"use client";

// components/layout/LanguageToggle.tsx — Fixed global floating language pill button
import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="floating-lang-toggle" role="group" aria-label="Language selection">
      <div className="floating-lang-icon" aria-hidden="true">
        <Globe size={14} />
      </div>
      <button
        type="button"
        className="floating-lang-btn"
        data-active={language === "en"}
        onClick={() => setLanguage("en")}
        title="English Language"
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="floating-lang-divider" aria-hidden="true">|</span>
      <button
        type="button"
        className="floating-lang-btn"
        data-active={language === "fil"}
        onClick={() => setLanguage("fil")}
        title="Filipino / Tagalog Language"
        aria-label="Lumipat sa Tagalog"
      >
        FIL
      </button>

      <style>{`
        .floating-lang-toggle {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 999;
          display: inline-flex;
          align-items: center;
          background: oklch(24% 0.08 148 / 0.88);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid oklch(98% 0.005 145 / 0.25);
          border-radius: var(--radius-full);
          padding: 4px 6px;
          gap: 4px;
          box-shadow: 0 10px 30px oklch(0% 0 0 / 0.35);
          transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .floating-lang-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px oklch(0% 0 0 / 0.45);
        }
        .floating-lang-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent);
          padding-left: 6px;
        }
        .floating-lang-divider {
          color: oklch(98% 0.005 145 / 0.3);
          font-size: 0.7rem;
          font-weight: 400;
        }
        .floating-lang-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding-inline: 8px;
          height: 26px;
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          color: oklch(98% 0.005 145 / 0.75);
          font-size: 0.7rem;
          font-weight: 700;
          font-family: var(--font-mono);
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background-color var(--dur-fast) var(--ease-out),
                      color var(--dur-fast) var(--ease-out);
        }
        .floating-lang-btn:hover {
          color: var(--color-primary-fg);
          background-color: oklch(98% 0.005 145 / 0.15);
        }
        .floating-lang-btn[data-active="true"] {
          background-color: var(--color-accent);
          color: var(--color-accent-fg);
          box-shadow: 0 2px 8px oklch(0% 0 0 / 0.2);
        }
        @media (max-width: 640px) {
          .floating-lang-toggle {
            bottom: 1.25rem;
            right: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
