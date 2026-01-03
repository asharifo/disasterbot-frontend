import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import FullscreenOverlay from "./FullscreenOverlay";

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function ImageSlider({ images }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const draggableInstance = useRef(null);
  const parallaxSetters = useRef([]);
  const imageLoadedRef = useRef(new Set());

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Animation state kept in refs to avoid stale closures
  const currentPositionRef = useRef(0);
  const targetPositionRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const rafIdRef = useRef(null);

  // Wheel scheduling state
  const wheelFrameRequestedRef = useRef(false);
  const lastWheelDeltaRef = useRef(0);

  // Stable callback ref so we don't recreate anonymous refs per render
  const setSlideRef = useCallback((el, index) => {
    slideRefs.current[index] = el;
  }, []);

  // Preload images
  const preloadImages = useCallback(() => {
    let loadedCount = 0;
    const totalImages = images.length;

    if (!totalImages) {
      setImagesLoaded(true);
      return;
    }

    images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        imageLoadedRef.current.add(index);
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };

      // Hints
      img.decoding = "async";
      // Let browser decide; thumbnails themselves will be "lazy"
      img.loading = "auto";
      img.src = src;
    });
  }, [images]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  useEffect(() => {
    if (!imagesLoaded) return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const slideEls = slideRefs.current.filter(Boolean);

    // Compute basic layout metrics once
    const containerWidth = container.offsetWidth;
    const trackWidth = track.scrollWidth;
    const maxDrag = Math.max(trackWidth - containerWidth, 0);
    const BUFFER = 100; // small buffer for "soft" edges

    const PARALLAX_RATIO = 0.3;
    const SCROLL_SENSITIVITY = 1.2;
    const LERP_FACTOR = 0.12;

    // Get all image elements inside slides
    const imageEls = slideEls
      .map((slide) => slide.querySelector("img"))
      .filter(Boolean);

    // Precompute slide positions to avoid getBoundingClientRect on every frame
    const slideMeta = slideEls.map((slide) => ({
      offsetLeft: slide.offsetLeft,
      width: slide.offsetWidth,
    }));

    // Optimize images for transforms
    imageEls.forEach((img) => {
      gsap.set(img, {
        force3D: true,
        willChange: "transform",
        backfaceVisibility: "hidden",
        perspective: 1000,
      });
      img.style.imageRendering = "optimizeSpeed";
      img.style.imageRendering = "-webkit-optimize-contrast";
      // Direct DOM attribute: thumbnails can safely be lazy
      img.loading = "lazy";
      img.decoding = "async";
    });

    parallaxSetters.current = imageEls.map((img) =>
      gsap.quickSetter(img, "x", "px")
    );

    // ------- Parallax update with visibility culling (no layout thrash) ------
    const updateParallax = (trackX) => {
      const shift = -trackX * PARALLAX_RATIO;

      slideEls.forEach((slide, i) => {
        const meta = slideMeta[i];
        if (!meta) return;

        const leftOnScreen = meta.offsetLeft + trackX;
        const rightOnScreen = leftOnScreen + meta.width;

        const isVisible =
          rightOnScreen > -200 && leftOnScreen < containerWidth + 200;

        if (isVisible && parallaxSetters.current[i]) {
          parallaxSetters.current[i](shift);
        }
      });
    };

    // ------- Smooth animation loop using requestAnimationFrame --------------
    const startAnimationLoop = () => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const animate = () => {
        const current = currentPositionRef.current;
        const target = targetPositionRef.current;
        const delta = target - current;

        if (Math.abs(delta) > 0.5) {
          const next = current + delta * LERP_FACTOR;
          currentPositionRef.current = next;
          gsap.set(track, {
            x: next,
            force3D: true,
          });
          updateParallax(next);
          rafIdRef.current = requestAnimationFrame(animate);
        } else {
          currentPositionRef.current = target;
          gsap.set(track, {
            x: target,
            force3D: true,
          });
          updateParallax(target);
          isAnimatingRef.current = false;
          rafIdRef.current = null;
        }
      };

      rafIdRef.current = requestAnimationFrame(animate);
    };

    // ------- Draggable setup -----------------------------------------------
    const instance = Draggable.create(track, {
      type: "x",
      bounds: { minX: -maxDrag - BUFFER, maxX: BUFFER },
      inertia: true,
      dragResistance: 0.15,
      throwResistance: 1200,
      cursor: "grab",
      onPress() {
        this.cursor = "grabbing";
        // Stop current smoothing loop if any
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
          isAnimatingRef.current = false;
        }
      },
      onRelease() {
        this.cursor = "grab";
      },
      onDrag() {
        const x = this.x;
        currentPositionRef.current = x;
        targetPositionRef.current = x;
        updateParallax(x);
      },
      onThrowUpdate() {
        const x = this.x;
        currentPositionRef.current = x;
        targetPositionRef.current = x;
        updateParallax(x);
      },
    })[0];

    draggableInstance.current = instance;

    currentPositionRef.current = instance.x;
    targetPositionRef.current = instance.x;
    updateParallax(instance.x);

    // ------- Wheel handler with RAF scheduling -----------------------------
    const handleWheelInternal = () => {
      if (isFullscreen) return;
      const container = containerRef.current;
      if (!container) return;

      const delta = lastWheelDeltaRef.current;
      if (!delta) return;

      const deltaX = delta * SCROLL_SENSITIVITY;

      let nextTarget =
        targetPositionRef.current - deltaX;

      // Clamp target within extended bounds
      const minX = -maxDrag - BUFFER;
      const maxX = BUFFER;
      if (nextTarget < minX) nextTarget = minX;
      if (nextTarget > maxX) nextTarget = maxX;

      targetPositionRef.current = nextTarget;
      startAnimationLoop();
    };

    const handleWheel = (e) => {
      if (isFullscreen) return;

      e.preventDefault();

      const dominantDelta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      lastWheelDeltaRef.current = dominantDelta;

      if (!wheelFrameRequestedRef.current) {
        wheelFrameRequestedRef.current = true;
        requestAnimationFrame(() => {
          wheelFrameRequestedRef.current = false;
          handleWheelInternal();
        });
      }
    };

    // Fullscreen enable/disable: control Draggable & listeners
    const applyFullscreenState = () => {
      if (!container) return;
      if (isFullscreen) {
        instance.disable();
        container.style.pointerEvents = "none";
        track.style.pointerEvents = "none";
        container.removeEventListener("wheel", handleWheel);
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
          isAnimatingRef.current = false;
        }
      } else {
        instance.enable();
        container.style.pointerEvents = "auto";
        track.style.pointerEvents = "auto";
        container.addEventListener("wheel", handleWheel, { passive: false });
      }
    };

    applyFullscreenState();

    // Re-apply when fullscreen state changes
    // (effect already runs on isFullscreen change)
    // so no extra listener needed.

    return () => {
      instance.kill();
      container.removeEventListener("wheel", handleWheel);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      isAnimatingRef.current = false;
      wheelFrameRequestedRef.current = false;
    };
  }, [isFullscreen, imagesLoaded]);

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
    setIsFullscreen(true);
  };

  const handleFullscreenExit = () => {
    setIsFullscreen(false);
  };

  const handleIndexChange = (newIndex) => {
    setCurrentIndex(newIndex);
  };

  return (
    <>
      {/* Thumbnail carousel */}
      <div ref={containerRef} className="slider-container">
        <div ref={trackRef} className="image-track">
          {images.map((src, i) => (
            <div
              key={i}
              className="slide"
              ref={(el) => setSlideRef(el, i)}
              onClick={() => handleThumbnailClick(i)}
            >
              <img src={src} alt={`Slide ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <FullscreenOverlay
          images={images}
          currentIndex={currentIndex}
          slideRefs={slideRefs}
          onExit={handleFullscreenExit}
          onIndexChange={handleIndexChange}
        />
      )}
    </>
  );
}
