"use client";

// app/(public)/checkout/CheckoutView.tsx — Interactive Checkout and QR display component
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatPHP, breakdownRiceQty } from "@/types";
import { generateQRDataURL } from "@/lib/qr";
import { QrCode, CheckCircle2, AlertCircle, ArrowLeft, Download, ShieldCheck, XCircle } from "lucide-react";

export default function CheckoutView() {
  const { items, totalPHP, clearCart } = useCart();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{
    orderId: string;
    totalPricePhp: number;
    qrDataUrl: string;
    createdAt: string;
  } | null>(null);

  if (createdOrder) {
    return (
      <div className="checkout-success">
        <div className="checkout-success__card">
          <div className="success-header">
            <CheckCircle2 size={48} className="success-icon" aria-hidden="true" />
            <h2 className="success-title">{t("orderConfirmedTitle")}</h2>
            <p className="success-subtitle">
              {t("qrInstructions")}
            </p>
          </div>

          <div className="qr-container">
            {/* Render generated QR code image */}
            <img
              src={createdOrder.qrDataUrl}
              alt="Order QR Code"
              className="qr-image"
            />
            <span className="order-id-label">
              Order ID: <code className="order-id">{createdOrder.orderId}</code>
            </span>
          </div>

          <div className="order-details-summary">
            <div className="detail-row">
              <span>{t("totalAmount")}:</span>
              <strong className="detail-price">{formatPHP(createdOrder.totalPricePhp)}</strong>
            </div>
            <div className="detail-row">
              <span>{t("orderStatusLabel")}:</span>
              <span className="status-badge status-badge--pending">{t("statusPending")}</span>
            </div>
            <div className="detail-row">
              <span>{t("paymentLocationTitle")}:</span>
              <span>{t("crrdcOfficeAddress")}</span>
            </div>
          </div>

          <div className="success-actions">
            <a
              href={createdOrder.qrDataUrl}
              download={`CRRDC-Order-${createdOrder.orderId.slice(0, 8)}.png`}
              className="download-qr-btn"
            >
              <Download size={16} aria-hidden="true" />
              <span>{t("saveQrBtn")}</span>
            </a>

            <Link href={`/checkout/order/${createdOrder.orderId}`} className="track-order-link">
              View Receipt &amp; Status Page
            </Link>

            <button
              type="button"
              className="cancel-order-btn"
              onClick={() => {
                if (confirm("Are you sure you want to cancel this order screen and return to catalog?")) {
                  setCreatedOrder(null);
                }
              }}
            >
              <XCircle size={16} aria-hidden="true" />
              <span>{t("cancelOrderBtn")}</span>
            </button>
          </div>
        </div>

        <style>{`
          .checkout-success {
            max-width: 600px;
            margin-inline: auto;
          }
          .checkout-success__card {
            background-color: var(--color-paper);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-xl);
            padding: var(--space-8);
            text-align: center;
          }
          .success-header { margin-bottom: var(--space-6); }
          .success-icon { color: var(--color-primary); margin-bottom: var(--space-3); }
          .success-title {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            color: var(--color-heading);
            margin: 0 0 var(--space-2);
          }
          .success-subtitle {
            font-size: var(--text-sm);
            color: var(--color-ink-2);
            margin: 0;
            line-height: 1.5;
          }

          .qr-container {
            background-color: var(--color-paper-2);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-6);
            margin-bottom: var(--space-6);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-3);
          }
          .qr-image {
            width: 240px;
            height: 240px;
            border-radius: var(--radius-md);
            border: 4px solid #fff;
          }
          .order-id-label { font-size: var(--text-xs); color: var(--color-ink-3); }
          .order-id { font-family: var(--font-mono); color: var(--color-ink); font-weight: 600; }

          .order-details-summary {
            background-color: var(--color-paper-2);
            border-radius: var(--radius-md);
            padding: var(--space-4);
            margin-bottom: var(--space-6);
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
            font-size: var(--text-sm);
          }
          .detail-row { display: flex; justify-content: space-between; align-items: center; color: var(--color-ink-2); }
          .detail-price { font-family: var(--font-mono); color: var(--color-primary); font-size: var(--text-lg); }
          .status-badge {
            font-size: var(--text-xs);
            font-weight: 700;
            padding: 2px 8px;
            border-radius: var(--radius-full);
          }
          .status-badge--pending {
            background-color: oklch(from var(--color-warning) l c h / 0.15);
            color: var(--color-warning);
          }

          .success-actions {
            display: flex;
            flex-direction: column;
            gap: var(--space-3);
          }
          .download-qr-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-2);
            padding: var(--space-3) var(--space-6);
            background-color: var(--color-primary);
            color: var(--color-primary-fg);
            border-radius: var(--radius-md);
            font-weight: 600;
            text-decoration: none;
          }
          .track-order-link {
            font-size: var(--text-sm);
            color: var(--color-primary);
            text-decoration: none;
            font-weight: 500;
          }
          .cancel-order-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-2);
            padding: var(--space-3) var(--space-6);
            background-color: var(--color-paper-2);
            border: 1px solid var(--color-error);
            color: var(--color-error);
            border-radius: var(--radius-md);
            font-weight: 600;
            cursor: pointer;
            transition: background-color var(--dur-fast) var(--ease-out);
          }
          .cancel-order-btn:hover {
            background-color: oklch(from var(--color-error) l c h / 0.1);
          }
        `}</style>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <p>Your cart is empty. Please add products before checking out.</p>
        <Link href="/catalog" className="btn-link">
          Browse Catalog
        </Link>
        <style>{`
          .checkout-empty { text-align: center; padding: var(--space-12); }
          .btn-link { display: inline-block; margin-top: var(--space-4); color: var(--color-primary); }
        `}</style>
      </div>
    );
  }

  const handleSubmitOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
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

      const { orderId, totalPricePhp, qrPayload, createdAt } = result.data;

      // Generate QR Code data URL
      const qrDataUrl = await generateQRDataURL(qrPayload);

      // Clear the local cart session state
      clearCart();

      // Show success screen
      setCreatedOrder({
        orderId,
        totalPricePhp,
        qrDataUrl,
        createdAt,
      });
    } catch (err: any) {
      console.error("Order Submit Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-view">
      <div className="checkout-grid">
        {/* Left: Order Review */}
        <div className="checkout-main">
          <h2 className="checkout-section-title">Review Order Items</h2>
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

          <div className="checkout-notice">
            <ShieldCheck size={20} className="notice-icon" aria-hidden="true" />
            <div>
              <h4 className="notice-title">In-Person Payment Notice</h4>
              <p className="notice-text">
                No credit card or online payment is required on this website. Payment will be collected in cash by CRRDC staff when you present your generated order QR code at the center.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Total & Action */}
        <aside className="checkout-sidebar">
          <h2 className="checkout-sidebar-title">{t("orderSummary")}</h2>

          <div className="checkout-total-box">
            <span className="total-label">{t("totalAmount")}:</span>
            <span className="total-amount">{formatPHP(totalPHP)}</span>
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
              <span>{t("generatingQr")}</span>
            ) : (
              <>
                <QrCode size={18} aria-hidden="true" />
                <span>{t("confirmGenerateQr")}</span>
              </>
            )}
          </button>

          <Link href="/cart" className="back-cart-link">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>{t("cart")}</span>
          </Link>
        </aside>
      </div>

      <style>{`
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: var(--space-8);
          align-items: start;
        }

        .checkout-section-title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          color: var(--color-primary-dark);
          margin: 0 0 var(--space-6);
        }

        .checkout-items-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin-bottom: var(--space-6);
        }

        .checkout-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--color-border);
        }
        .checkout-item-row:last-child { border-bottom: none; padding-bottom: 0; }
        .item-title { font-family: var(--font-display); font-size: var(--text-base); color: var(--color-primary-dark); margin: 0; }
        .item-qty { font-size: var(--text-xs); color: var(--color-ink-3); }
        .item-price { font-family: var(--font-mono); font-weight: 700; color: var(--color-ink); }

        .checkout-notice {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-5);
          background-color: oklch(from var(--color-primary) l c h / 0.06);
          border: 1px solid oklch(from var(--color-primary) l c h / 0.2);
          border-radius: var(--radius-lg);
        }
        .notice-icon { color: var(--color-primary); flex-shrink: 0; }
        .notice-title { font-size: var(--text-sm); font-weight: 700; color: var(--color-primary-dark); margin: 0 0 var(--space-1); }
        .notice-text { font-size: var(--text-xs); color: var(--color-ink-2); margin: 0; line-height: 1.5; }

        .checkout-sidebar {
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }
        .checkout-sidebar-title {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          color: var(--color-primary-dark);
          margin: 0 0 var(--space-6);
        }

        .checkout-total-box {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }
        .total-label { font-size: var(--text-sm); font-weight: 600; color: var(--color-ink-2); }
        .total-amount { font-family: var(--font-mono); font-size: var(--text-2xl); font-weight: 700; color: var(--color-primary-dark); }

        .checkout-error {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3);
          background-color: oklch(from var(--color-error) l c h / 0.1);
          color: var(--color-error);
          font-size: var(--text-xs);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }

        .submit-order-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-4) var(--space-6);
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: 600;
          cursor: pointer;
          transition: background-color var(--dur-fast) var(--ease-out);
          margin-bottom: var(--space-4);
        }
        .submit-order-btn:hover:not(:disabled) { background-color: var(--color-primary-hover); }
        .submit-order-btn:disabled { opacity: 0.7; cursor: wait; }

        .back-cart-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          color: var(--color-ink-3);
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
