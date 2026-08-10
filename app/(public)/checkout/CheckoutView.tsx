"use client";

// app/(public)/checkout/CheckoutView.tsx — Interactive Checkout Component with Phase 2 Order Types & Red Payment Notice
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatPHP, breakdownRiceQty, type OrderType } from "@/types";
import { AlertCircle, ArrowLeft, ShieldAlert, CheckCircle2, Calendar, Building, FileText, User } from "lucide-react";

export default function CheckoutView() {
  const router = useRouter();
  const { items, totalPHP, clearCart } = useCart();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer Form State
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("regular");
  const [customerOrg, setCustomerOrg] = useState("");
  const [purpose, setPurpose] = useState("");
  const [preferredPickupDate, setPreferredPickupDate] = useState("");
  const [requestionerName, setRequestionerName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [projectTitle, setProjectTitle] = useState("");

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <p>Your cart is empty. Please add products before checking out.</p>
        <Link href="/catalog" className="btn-link">
          Browse Catalog
        </Link>
        <style>{`
          .checkout-empty { text-align: center; padding: var(--space-12); }
          .btn-link { display: inline-block; margin-top: var(--space-4); color: var(--color-primary); font-weight: 600; }
        `}</style>
      </div>
    );
  }

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        customerName: customerName.trim(),
        orderType,
        customerOrg: customerOrg.trim() || undefined,
        purpose: purpose.trim() || undefined,
        preferredPickupDate: preferredPickupDate || undefined,
        requestionerName: requestionerName.trim() || undefined,
        projectCode: projectCode.trim() || undefined,
        projectTitle: projectTitle.trim() || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const result = await res.json();

      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Failed to submit order.");
      }

      const { orderId } = result.data;
      clearCart();

      // Redirect immediately to live Order Status & Receipt page
      router.push(`/checkout/order/${orderId}`);
    } catch (err: any) {
      console.error("Order Submit Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-view">
      {/* 🔴 RED PROMINENT IN-PERSON PAYMENT NOTICE */}
      <div className="red-payment-notice">
        <div className="notice-header">
          <ShieldAlert size={24} className="notice-red-icon" aria-hidden="true" />
          <h3 className="notice-red-title">IN-PERSON CASH PAYMENT NOTICE</h3>
        </div>
        <p className="notice-red-body">
          No online credit card payment is required on this website. Payment will be collected in cash by the <strong>CRRDC Cashier</strong> when you present your Order ID at the center.
        </p>
      </div>

      <div className="checkout-grid">
        {/* Left: Customer Details & Form */}
        <div className="checkout-main">
          <h2 className="checkout-section-title">1. Customer Information &amp; Order Purpose</h2>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Juan Dela Cruz"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Order Type</label>
              <div className="order-type-pills">
                <button
                  type="button"
                  className="type-pill"
                  data-active={orderType === "regular"}
                  onClick={() => setOrderType("regular")}
                >
                  Regular Cash Order
                </button>
                <button
                  type="button"
                  className="type-pill"
                  data-active={orderType === "institutional"}
                  onClick={() => setOrderType("institutional")}
                >
                  Institutional / Office Use
                </button>
                <button
                  type="button"
                  className="type-pill"
                  data-active={orderType === "project"}
                  onClick={() => setOrderType("project")}
                >
                  Project-Based (Deferred Payment)
                </button>
                <button
                  type="button"
                  className="type-pill"
                  data-active={orderType === "complimentary"}
                  onClick={() => setOrderType("complimentary")}
                >
                  Free / Tokens / Giveaways
                </button>
              </div>
            </div>

            {/* Conditional Fields based on Order Type */}
            {orderType === "institutional" && (
              <div className="conditional-box">
                <div className="form-group">
                  <label className="form-label">Center / Office Name</label>
                  <input
                    type="text"
                    placeholder="e.g. CLSU Crop Protection Center"
                    value={customerOrg}
                    onChange={(e) => setCustomerOrg(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose of Request</label>
                  <input
                    type="text"
                    placeholder="e.g. Field trials & research demonstration"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {orderType === "project" && (
              <div className="conditional-box">
                <div className="form-group">
                  <label className="form-label">Requisitioner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Maria Santos"
                    value={requestionerName}
                    onChange={(e) => setRequestionerName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Organization / Funding Agency</label>
                  <input
                    type="text"
                    placeholder="e.g. DOST-PCAARRD Project"
                    value={customerOrg}
                    onChange={(e) => setCustomerOrg(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Code</label>
                  <input
                    type="text"
                    placeholder="e.g. PRJ-2026-089"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Smart Agriculture Seed Improvement Program"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {orderType === "complimentary" && (
              <div className="conditional-box">
                <div className="form-group">
                  <label className="form-label">Recipient / Event Name</label>
                  <input
                    type="text"
                    placeholder="e.g. RiceFest 2026 Delegates"
                    value={customerOrg}
                    onChange={(e) => setCustomerOrg(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose / Event Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Official token distribution for visiting university extension team"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Preferred Pickup Date (Optional)</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input
                  type="date"
                  value={preferredPickupDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setPreferredPickupDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <h2 className="checkout-section-title" style={{ marginTop: "var(--space-8)" }}>
            2. Review Order Items
          </h2>
          <div className="checkout-items-list">
            {items.map(({ product, quantity }) => {
              const isRiceKg = product.unit_type === "kg";
              const riceBreakdown = isRiceKg ? breakdownRiceQty(quantity) : null;
              return (
                <div key={product.id} className="checkout-item-row">
                  <div>
                    <h3 className="item-title">{product.name}</h3>
                    <span className="item-qty">
                      Qty: {quantity} {isRiceKg ? "kg" : "unit(s)"}
                      {isRiceKg && riceBreakdown && riceBreakdown.sacks > 0
                        ? ` (${riceBreakdown.sacks} sack${riceBreakdown.sacks > 1 ? "s" : ""} ${riceBreakdown.looseKg > 0 ? `+ ${riceBreakdown.looseKg} kg` : ""})`
                        : ""}
                    </span>
                  </div>
                  <span className="item-price">{formatPHP(product.price_php * quantity)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Summary & Action */}
        <aside className="checkout-sidebar">
          <h2 className="checkout-sidebar-title">{t("orderSummary")}</h2>

          <div className="checkout-total-box">
            <span className="total-label">{t("totalAmount")}:</span>
            <span className="total-amount">
              {orderType === "complimentary" ? (
                <span className="free-tag">₱0.00 (Valued at {formatPHP(totalPHP)})</span>
              ) : (
                formatPHP(totalPHP)
              )}
            </span>
          </div>

          {error && (
            <div className="checkout-error">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            className="submit-order-btn"
            disabled={loading}
            onClick={handleSubmitOrder}
          >
            {loading ? (
              <span>Submitting Order...</span>
            ) : (
              <>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>Submit Order</span>
              </>
            )}
          </button>

          <Link href="/cart" className="back-cart-link">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Return to Cart</span>
          </Link>
        </aside>
      </div>

      <style>{`
        .checkout-view { display: flex; flex-direction: column; gap: var(--space-6); }

        /* RED PROMINENT PAYMENT NOTICE */
        .red-payment-notice {
          background-color: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: var(--radius-xl);
          padding: var(--space-5) var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          box-shadow: 0 4px 15px oklch(0% 0 0 / 0.05);
        }
        .notice-header { display: flex; align-items: center; gap: var(--space-3); }
        .notice-red-icon { color: #dc2626; flex-shrink: 0; }
        .notice-red-title { font-family: var(--font-display); font-size: var(--text-lg); color: #991b1b; margin: 0; font-weight: 800; letter-spacing: 0.02em; }
        .notice-red-body { font-size: var(--text-sm); color: #7f1d1d; margin: 0; line-height: 1.5; }

        .checkout-grid { display: grid; grid-template-columns: 1fr 340px; gap: var(--space-8); align-items: start; }
        .checkout-section-title { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-primary-dark); margin: 0 0 var(--space-4); }

        .form-section { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
        .form-group { display: flex; flex-direction: column; gap: var(--space-2); }
        .form-label { font-size: var(--text-xs); font-weight: 700; color: var(--color-heading); }
        .req { color: var(--color-error); }
        .form-input { padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); width: 100%; }

        .input-with-icon { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: var(--space-3); color: var(--color-ink-3); pointer-events: none; }
        .input-with-icon .form-input { padding-left: var(--space-10); }

        .order-type-pills { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
        .type-pill { padding: var(--space-3); border: 1px solid var(--color-border); background: var(--color-paper-2); border-radius: var(--radius-md); font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-2); cursor: pointer; text-align: center; transition: all var(--dur-fast); }
        .type-pill[data-active="true"] { background-color: var(--color-primary); color: var(--color-primary-fg); border-color: var(--color-primary); }

        .conditional-box { background-color: var(--color-paper-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }

        .checkout-items-list { display: flex; flex-direction: column; gap: var(--space-3); background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-5); }
        .checkout-item-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--space-3); border-bottom: 1px solid var(--color-border); }
        .checkout-item-row:last-child { border-bottom: none; padding-bottom: 0; }
        .item-title { font-family: var(--font-display); font-size: var(--text-base); color: var(--color-primary-dark); margin: 0; }
        .item-qty { font-size: var(--text-xs); color: var(--color-ink-3); }
        .item-price { font-family: var(--font-mono); font-weight: 700; color: var(--color-ink); }

        .checkout-sidebar { background-color: var(--color-paper-2); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); position: sticky; top: var(--space-6); }
        .checkout-sidebar-title { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-primary-dark); margin: 0 0 var(--space-6); }
        .checkout-total-box { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-border); }
        .total-label { font-size: var(--text-sm); font-weight: 600; color: var(--color-ink-2); }
        .total-amount { font-family: var(--font-mono); font-size: var(--text-2xl); font-weight: 700; color: var(--color-primary-dark); }
        .free-tag { font-size: var(--text-sm); color: var(--color-primary); font-weight: 700; }

        .checkout-error { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3); background-color: oklch(from var(--color-error) l c h / 0.1); color: var(--color-error); font-size: var(--text-xs); border-radius: var(--radius-md); margin-bottom: var(--space-4); }

        .submit-order-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-4) var(--space-6); background-color: var(--color-primary); color: var(--color-primary-fg); border: none; border-radius: var(--radius-md); font-size: var(--text-base); font-weight: 600; cursor: pointer; transition: background-color var(--dur-fast); margin-bottom: var(--space-4); }
        .submit-order-btn:hover:not(:disabled) { background-color: var(--color-primary-hover); }
        .submit-order-btn:disabled { opacity: 0.7; cursor: wait; }

        .back-cart-link { display: flex; align-items: center; justify-content: center; gap: var(--space-2); font-size: var(--text-xs); color: var(--color-ink-3); text-decoration: none; }

        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .order-type-pills { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
