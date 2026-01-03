import "../css/PromptCarousel.css";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";

// Avoid using useEffect and fix gap issue
export default function PromptCarousel( { prompts, onPromptSelect } ) {
  const containerRef = useRef(null);
  const scrollTimelineRef = useRef(null);
  const duplicatedPrompts = [...prompts, ...prompts];
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create infinite scroll animation
    const totalWidth = container.scrollWidth / 2;

    scrollTimelineRef.current = gsap.timeline({ repeat: -1 });
    scrollTimelineRef.current.to(container, {
      x: -totalWidth,
      duration: 70,
      ease: "none",
    });
    return () => {
      scrollTimelineRef.current?.kill();
    };
  }, []);
  const handleMouseEnter = () => {
    scrollTimelineRef.current?.pause();
  };

  const handleMouseLeave = () => {
    scrollTimelineRef.current?.resume();
  };

  const handleBubbleHover = (e) => {
    gsap.to(e.currentTarget, {
      y: -8,
      duration: 0.1,
      ease: "none",
    });
  };

  const handleBubbleLeave = (e) => {
    gsap.to(e.currentTarget, {
      y: 0,
      duration: 0.1,
      ease: "none",
    });
  };
  return (
    <div className="prompt-carousel">
      <div
        className="marquee"
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {duplicatedPrompts.map((prompt, index) => (
          <div
            key={`${prompt.id}-${index}`}
            className="prompt"
            onMouseEnter={handleBubbleHover}
            onMouseLeave={handleBubbleLeave}
            onClick={() => onPromptSelect(prompt)}
          >
            {prompt}
          </div>
        ))}
      </div>
    </div>
  );
}
