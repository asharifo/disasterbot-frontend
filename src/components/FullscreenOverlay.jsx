import { useRef, useLayoutEffect, useCallback } from "react";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FullscreenOverlay({
  images,
  currentIndex,
  slideRefs,
  onExit,
  onIndexChange,
}) {
  const fullscreenRef = useRef(null);
  const sectionsContainerRef = useRef(null);

  // Scroll accumulators kept in refs (not state) for high-frequency events
  const scrollAccumulatorRef = useRef(0);
  const scrollTimeoutRef = useRef(null);

  // Progress indicator component
  const ProgressIndicator = () => (
    <div className="progress-indicator">
      {images.map((_, index) => (
        <button
          key={index}
          className={`progress-dot ${
            index === currentIndex ? "active" : ""
          }`}
          onClick={() => navigateToSection(index)}
          aria-label={`Go to image ${index + 1}`}
        >
          <span className="sr-only">Image {index + 1}</span>
        </button>
      ))}
    </div>
  );

  // Navigate between sections
  const navigateToSection = useCallback(
    (newIndex) => {
      const container = sectionsContainerRef.current;
      if (
        !container ||
        newIndex < 0 ||
        newIndex >= images.length ||
        newIndex === currentIndex
      ) {
        return;
      }

      gsap.to(container, {
        xPercent: -newIndex * 100,
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => {
          onIndexChange(newIndex);
        },
      });
    },
    [currentIndex, images.length, onIndexChange]
  );

  const handlePrevious = useCallback(() => {
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    navigateToSection(newIndex);
  }, [currentIndex, images.length, navigateToSection]);

  const handleNext = useCallback(() => {
    const newIndex =
      currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    navigateToSection(newIndex);
  }, [currentIndex, images.length, navigateToSection]);

  const handleExit = useCallback(() => {
    const overlay = fullscreenRef.current;
    const slides = slideRefs.current || [];

    const timeline = gsap.timeline({
      onComplete: onExit,
    });

    // Drop the overlay
    if (overlay) {
      timeline.to(overlay, {
        y: "100%",
        duration: 0.6,
        ease: "power3.in",
      });
    }

    // Slide thumbnails back into view
    slides.forEach((slide, idx) => {
      if (slide) {
        timeline.to(
          slide,
          { y: "0%", duration: 0.2, ease: "power3.in" },
          `-=${0.4 - idx * 0.05}`
        );
      }
    });
  }, [onExit, slideRefs]);

  // Wheel handler with accumulation (for trackpads and smooth scroll)
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();

      const delta = e.deltaY;
      scrollAccumulatorRef.current += delta;

      const EXIT_THRESHOLD = 60; // a bit higher to avoid accidental exits

      if (scrollAccumulatorRef.current < -EXIT_THRESHOLD) {
        // reset before exit to avoid re-triggering
        scrollAccumulatorRef.current = 0;
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
        handleExit();
        return;
      }

      // Reset accumulator after a short pause
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        scrollAccumulatorRef.current = 0;
        scrollTimeoutRef.current = null;
      }, 200);
    },
    [handleExit]
  );

  // Entrance animation and global listeners
  useLayoutEffect(() => {
    const overlay = fullscreenRef.current;
    const sections = sectionsContainerRef.current;
    const slides = slideRefs.current || [];
    if (!overlay || !sections) return;

    const timeline = gsap.timeline();

    // Initial position: ensure overlay starts offscreen
    gsap.set(overlay, { y: "100%" });

    // Thumbnails slide up
    slides.forEach((slide, i) => {
      if (slide) {
        timeline.to(
          slide,
          { y: "-100vh", duration: 0.2, ease: "power3.in" },
          i * 0.05
        );
      }
    });

    // Fullscreen overlay rises
    timeline.to(
      overlay,
      { y: 0, duration: 0.6, ease: "power3.in" },
      0.1
    );

    // Set initial section position
    gsap.set(sections, { xPercent: -currentIndex * 100 });

    // Wheel listener only on overlay, not the whole window
    overlay.addEventListener("wheel", handleWheel, { passive: false });

    // Keyboard navigation
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          handleExit();
          break;
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      overlay.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      timeline.kill();
    };
  }, [
    currentIndex,
    handleWheel,
    handleExit,
    handlePrevious,
    handleNext,
    slideRefs,
  ]);

  return (
    <div ref={fullscreenRef} className="fullscreen-overlay">
      <div className="fullscreen-content">
        <button
          className="nav-button nav-previous"
          onClick={handlePrevious}
        >
          <ChevronLeft />
        </button>

        <div
          ref={sectionsContainerRef}
          className="sections-container"
        >
          {images.map((src, idx) => (
            <div key={idx} className="fullscreen-section">
              <div className="section-content">
                <img
                  src={src}
                  alt={`Section ${idx + 1}`}
                  className="section-image"
                />
                <div className="section-info">
                  <h2 className="section-title">Section {idx + 1}</h2>
                  <p className="section-description">
                    This is the content for section {idx + 1}. You
                    can add any content here—text, videos, etc.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="nav-button nav-next" onClick={handleNext}>
          <ChevronRight />
        </button>

        <ProgressIndicator />
      </div>
    </div>
  );
}
