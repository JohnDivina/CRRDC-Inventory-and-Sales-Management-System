// app/(public)/cart/page.tsx — Cart Review Page
import type { Metadata } from "next";
import CartView from "./CartView";

export const metadata: Metadata = {
  title: "Your Cart | CRRDC — CLSU",
  description: "Review your selected seeds, rice, and agricultural produce before checkout.",
};

export default function CartPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Shopping Cart</h1>
        <p className="page-subtitle">
          Review your selected line items. Rice quantities are automatically transacted in full 25-kg sacks where applicable.
        </p>
      </header>

      <CartView />

      <style>{`
        .page-container {
          max-width: var(--container-max);
          margin-inline: auto;
          padding: var(--space-12) var(--gutter);
        }
        .page-header {
          margin-bottom: var(--space-8);
          border-bottom: 1px solid var(--color-border);
          padding-bottom: var(--space-6);
        }
        .page-title {
          font-size: var(--text-display-s);
          color: var(--color-primary-dark);
          margin: 0 0 var(--space-2);
        }
        .page-subtitle {
          font-size: var(--text-lg);
          color: var(--color-ink-2);
          margin: 0;
          max-width: var(--container-text);
        }
      `}</style>
    </div>
  );
}
