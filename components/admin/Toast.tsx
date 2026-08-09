"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  onDismiss: (id: string) => void;
}

export default function Toast({ id, message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error"
      ? XCircle
      : Info;

  return (
    <div className={`toast-item toast-item--${type}`} role="alert">
      <Icon size={18} className="toast-icon" aria-hidden="true" />
      <span className="toast-message">{message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={() => onDismiss(id)}
        aria-label="Close notification"
      >
        <X size={14} aria-hidden="true" />
      </button>

      <style>{`
        .toast-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          background-color: var(--color-paper);
          box-shadow: 0 4px 20px oklch(0% 0 0 / 0.18);
          border: 1px solid var(--color-border);
          color: var(--color-ink);
          font-size: var(--text-sm);
          min-width: 280px;
          max-width: 400px;
          animation: toast-slide-in var(--dur-slow) var(--ease-out);
        }
        .toast-item--success {
          border-left: 4px solid var(--color-success);
        }
        .toast-item--success .toast-icon {
          color: var(--color-success);
        }
        .toast-item--error {
          border-left: 4px solid var(--color-error);
        }
        .toast-item--error .toast-icon {
          color: var(--color-error);
        }
        .toast-item--info {
          border-left: 4px solid var(--color-primary);
        }
        .toast-item--info .toast-icon {
          color: var(--color-primary);
        }
        .toast-message {
          flex: 1;
          line-height: 1.4;
        }
        .toast-close {
          background: transparent;
          border: none;
          color: var(--color-ink-3);
          cursor: pointer;
          padding: 2px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .toast-close:hover {
          color: var(--color-ink);
        }

        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
