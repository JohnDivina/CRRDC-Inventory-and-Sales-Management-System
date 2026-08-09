"use client";

import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

export default function PageLoadingOverlay() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fade out overlay after DOM mount / ready
    const handleLoad = () => {
      setTimeout(() => setLoading(false), 300);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  if (!loading) return null;

  return (
    <div className="page-loading-overlay" role="status" aria-label="Loading site">
      <div className="page-loading-content">
        <div className="page-loading-spinner">
          <Sprout size={36} className="page-loading-icon" aria-hidden="true" />
        </div>
        <span className="page-loading-brand">CLSU · CRRDC</span>
        <span className="page-loading-text">Research Innovation and Extension</span>
      </div>

      <style>{`
        .page-loading-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background-color: var(--color-primary-dark);
          color: var(--color-primary-fg);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fade-out 0.4s var(--ease-out) forwards 0.4s;
          pointer-events: none;
        }
        .page-loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          text-align: center;
        }
        .page-loading-spinner {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          background-color: oklch(from var(--color-primary-fg) l c h / 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .page-loading-icon {
          color: var(--color-accent);
        }
        .page-loading-brand {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--color-accent);
          letter-spacing: 0.05em;
        }
        .page-loading-text {
          font-size: var(--text-xs);
          color: oklch(from var(--color-primary-fg) l c h / 0.7);
          letter-spacing: 0.03em;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes fade-out {
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}
