// app/(public)/checkout/page.tsx — Checkout Page
import type { Metadata } from "next";
import CheckoutView from "./CheckoutView";

export const metadata: Metadata = {
  title: "Checkout & Generate QR | CRRDC — CLSU",
  description: "Complete your order and receive your official transaction QR code for in-person payment at CRRDC.",
};

export default function CheckoutPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Order Checkout</h1>
        <p className="page-subtitle">
          Confirm your order details below to generate your official transaction QR code. Present this code upon in-person payment at CRRDC.
        </p>
      </header>

      <CheckoutView />

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
