"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-to-top no-print"
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
    >
      <ArrowUp size={18} aria-hidden="true" />

      <style>{`
        .scroll-to-top {
          position: fixed;
          bottom: var(--space-6);
          right: var(--space-6);
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background-color: var(--color-primary-dark);
          color: var(--color-primary-fg);
          border: 1px solid oklch(from var(--color-primary-fg) l c h / 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
          z-index: 50;
          transition: transform var(--dur-fast) var(--ease-out),
                      background-color var(--dur-fast) var(--ease-out);
          animation: fade-in var(--dur-base) var(--ease-out);
        }
        .scroll-to-top:hover {
          background-color: var(--color-primary);
          transform: translateY(-2px);
        }

        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </button>
  );
}
