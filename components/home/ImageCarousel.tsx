"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sprout, Wheat, Leaf } from "lucide-react";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: typeof Sprout;
  color: string;
}

const SLIDES: Slide[] = [
  {
    id: "slide-1",
    title: "High-Yield Certified Inbred Seeds",
    subtitle: "NSIC RCs & Foundation Seeds developed for resilience and peak agricultural output.",
    tag: "Certified Research Seeds",
    icon: Sprout,
    color: "oklch(45% 0.16 145)",
  },
  {
    id: "slide-2",
    title: "Premium CLSU Quality Rice Varieties",
    subtitle: "Milled and processed directly from CLSU research fields in 25-kg sacks & bulk.",
    tag: "Field Harvested Rice",
    icon: Wheat,
    color: "oklch(42% 0.14 120)",
  },
  {
    id: "slide-3",
    title: "Sustainable Agricultural Technologies & Inputs",
    subtitle: "Empowering local farmers through scientific innovation and extension services.",
    tag: "Extension & Support",
    icon: Leaf,
    color: "oklch(38% 0.12 160)",
  },
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    startTimer();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    startTimer();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    setTouchStart(null);
  };

  return (
    <div
      className="carousel-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured product carousel"
    >
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {SLIDES.map((slide) => {
          const Icon = slide.icon;
          return (
            <div
              key={slide.id}
              className="carousel-slide"
              style={{ backgroundColor: slide.color }}
            >
              <div className="carousel-slide__content">
                <span className="carousel-slide__tag">{slide.tag}</span>
                <h3 className="carousel-slide__title">{slide.title}</h3>
                <p className="carousel-slide__sub">{slide.subtitle}</p>
              </div>
              <div className="carousel-slide__graphic" aria-hidden="true">
                <Icon size={120} className="carousel-slide__icon" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        className="carousel-arrow carousel-arrow--left"
        onClick={handlePrev}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </button>

      <button
        type="button"
        className="carousel-arrow carousel-arrow--right"
        onClick={handleNext}
        aria-label="Next slide"
      >
        <ChevronRight size={24} aria-hidden="true" />
      </button>

      {/* Dot Indicators */}
      <div className="carousel-dots">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            className="carousel-dot"
            data-active={currentIndex === i}
            onClick={() => {
              setCurrentIndex(i);
              startTimer();
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <style>{`
        .carousel-container {
          position: relative;
          width: 100%;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: 0 8px 30px oklch(0% 0 0 / 0.15);
          margin-bottom: var(--space-12);
        }

        .carousel-track {
          display: flex;
          transition: transform 500ms var(--ease-out);
        }

        .carousel-slide {
          min-width: 100%;
          padding: var(--space-12) var(--space-10);
          color: var(--color-primary-fg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          min-height: 260px;
        }

        .carousel-slide__content {
          max-width: 580px;
          z-index: 2;
        }

        .carousel-slide__tag {
          display: inline-block;
          font-size: var(--text-xs);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-accent);
          margin-bottom: var(--space-2);
        }

        .carousel-slide__title {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          color: var(--color-primary-fg);
          margin: 0 0 var(--space-3);
          line-height: 1.2;
        }

        .carousel-slide__sub {
          font-size: var(--text-base);
          color: oklch(from var(--color-primary-fg) l c h / 0.9);
          margin: 0;
          line-height: 1.5;
        }

        .carousel-slide__graphic {
          z-index: 1;
          opacity: 0.25;
          margin-right: var(--space-4);
        }

        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background-color: oklch(0% 0 0 / 0.35);
          color: var(--color-primary-fg);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 5;
          transition: background-color var(--dur-fast) var(--ease-out);
        }
        .carousel-arrow:hover {
          background-color: oklch(0% 0 0 / 0.6);
        }
        .carousel-arrow--left { left: var(--space-4); }
        .carousel-arrow--right { right: var(--space-4); }

        .carousel-dots {
          position: absolute;
          bottom: var(--space-4);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: var(--space-2);
          z-index: 5;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
          background-color: oklch(from var(--color-primary-fg) l c h / 0.4);
          border: none;
          cursor: pointer;
          transition: width var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out);
        }
        .carousel-dot[data-active="true"] {
          width: 24px;
          background-color: var(--color-accent);
        }

        @media (max-width: 768px) {
          .carousel-slide {
            padding: var(--space-8) var(--space-6);
            min-height: 220px;
          }
          .carousel-slide__title {
            font-size: var(--text-xl);
          }
          .carousel-slide__graphic {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
