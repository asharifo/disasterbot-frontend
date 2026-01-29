import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function ImageSlider({ images }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const draggableInstance = useRef(null);
  const parallaxSetters = useRef([]);
  const imageLoadedRef = useRef(new Set());

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

    images.forEach((src) => {
      if (imageLoadedRef.current.has(src)) {
        loadedCount++;
        if (loadedCount === totalImages) setImagesLoaded(true);
        return;
      }

      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageLoadedRef.current.add(src);
        loadedCount++;
        if (loadedCount === totalImages) setImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) setImagesLoaded(true);
      };
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

    const slides = slideRefs.current;
    const slideCount = slides.length;

    const SLIDE_GAP = 40;
    const SCROLL_SENSITIVITY = 0.8;
    const BUFFER = 200;

    let totalWidth = 0;
    slides.forEach((slide) => {
      if (!slide) return;
      const rect = slide.getBoundingClientRect();
      totalWidth += rect.width + SLIDE_GAP;
    });

    const maxDrag = Math.max(0, totalWidth - container.clientWidth);

    // Parallax setters
    parallaxSetters.current = slides.map((slide) => {
      if (!slide) return null;
      const img = slide.querySelector("img");
      if (!img) return null;
      return gsap.quickSetter(img, "x", "px");
    });

    const updateParallax = (x) => {
      slides.forEach((slide, i) => {
        if (!slide || !parallaxSetters.current[i]) return;
        const progress = (x / maxDrag) * 100;
        parallaxSetters.current[i](-progress * 0.3);
      });
    };

    const startAnimationLoop = () => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const animate = () => {
        const current = currentPositionRef.current;
        const target = targetPositionRef.current;
        const next = current + (target - current) * 0.12;

        currentPositionRef.current = next;
        gsap.set(track, { x: next });
        updateParallax(next);

        if (Math.abs(target - next) > 0.5) {
          rafIdRef.current = requestAnimationFrame(animate);
        } else {
          currentPositionRef.current = target;
          gsap.set(track, { x: target });
          updateParallax(target);
          isAnimatingRef.current = false;
        }
      };

      rafIdRef.current = requestAnimationFrame(animate);
    };

    const instance = Draggable.create(track, {
      type: "x",
      inertia: true,
      bounds: {
        minX: -maxDrag - BUFFER,
        maxX: BUFFER,
      },
      onPress() {
        this.cursor = "grabbing";
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

    const handleWheelInternal = () => {
      const delta = lastWheelDeltaRef.current;
      if (!delta) return;

      const deltaX = delta * SCROLL_SENSITIVITY;
      let nextTarget = targetPositionRef.current - deltaX;

      const minX = -maxDrag - BUFFER;
      const maxX = BUFFER;
      if (nextTarget < minX) nextTarget = minX;
      if (nextTarget > maxX) nextTarget = maxX;

      targetPositionRef.current = nextTarget;
      startAnimationLoop();
    };

    const handleWheel = (e) => {
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

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      instance.kill();
      container.removeEventListener("wheel", handleWheel);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      isAnimatingRef.current = false;
      wheelFrameRequestedRef.current = false;
    };
  }, [imagesLoaded]);

  return (
    <div ref={containerRef} className="slider-container">
      <div ref={trackRef} className="image-track">
        {images.map((src, i) => (
          <div
            key={i}
            className="slide"
            ref={(el) => setSlideRef(el, i)}
          >
            <img src={src} alt={`Slide ${i + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
