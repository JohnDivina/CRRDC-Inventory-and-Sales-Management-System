"use client";

// app/(public)/products/[id]/ProductDetailClient.tsx — Interactive product detail component
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShoppingCart, Info, PackageCheck } from "lucide-react";
import type { Product } from "@/types";
import { formatPHP, breakdownRiceQty } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/components/layout/LanguageContext";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock_qty <= 0;
  const isRiceKg = product.unit_type === "kg";
  const isRiceSack = product.unit_type === "sack";

  // For rice sold per kg, quantity is total kg
  const riceBreakdown = isRiceKg ? breakdownRiceQty(quantity) : null;

  const handleAddToCart = () => {
    if (isOutOfStock || quantity <= 0) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="product-detail">
      <div className="product-detail__container">
        {/* Breadcrumb & Navigation */}
        <nav className="product-detail__breadcrumbs" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb-link">{t("home")}</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/catalog" className="breadcrumb-link">{t("catalog")}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-detail__grid">
          {/* Product Media / Placeholder */}
          <div className="product-detail__media">
            <div className="product-detail__image-placeholder">
              <PackageCheck size={64} className="product-detail__icon" aria-hidden="true" />
              <span className="product-detail__category-tag">
                {product.category.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="product-detail__content">
            <span className="product-detail__badge">{product.category}</span>
            <h1 className="product-detail__title">{product.name}</h1>

            <div className="product-detail__price-row">
              <span className="product-detail__price">{formatPHP(product.price_php)}</span>
              <span className="product-detail__unit-label">
                {isRiceKg
                  ? t("perKg")
                  : isRiceSack
                  ? t("perSack")
                  : product.unit_type === "packet"
                  ? t("perPacket")
                  : t("perUnit")}
              </span>
            </div>

            {product.description && (
              <div className="product-detail__desc">
                <p>{product.description}</p>
              </div>
            )}

            {/* Special Rice Sack Unit Explainer */}
            {isRiceKg && (
              <div className="product-detail__rice-notice">
                <Info size={16} aria-hidden="true" className="product-detail__notice-icon" />
                <p>
                  <strong>Rice Unit Rules:</strong> 25 kg = 1 Sack. When ordering 25 kg or more,
                  your order will automatically be transacted as full sacks plus any remaining loose kilograms.
                </p>
              </div>
            )}

            {/* Out of Stock Notice Banner */}
            {isOutOfStock && (
              <div className="product-detail__out-of-stock-notice">
                <Info size={16} aria-hidden="true" />
                <span>{t("outOfStock")}</span>
              </div>
            )}

            {/* Quantity Selector & Sack Breakdown */}
            <div className="product-detail__order-box">
              <div className="product-detail__qty-row">
                <label htmlFor="qty-input" className="product-detail__qty-label">
                  {t("quantity")} ({isRiceKg ? "kg" : isRiceSack ? "sacks" : "units"}):
                </label>

                <div className="product-detail__qty-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - (isRiceKg ? 5 : 1)))}
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    -
                  </button>
                  <input
                    id="qty-input"
                    type="number"
                    min="1"
                    max={product.stock_qty}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setQuantity(Math.max(1, Math.min(product.stock_qty, val)));
                    }}
                    className="qty-input"
                    disabled={isOutOfStock}
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.min(product.stock_qty, q + (isRiceKg ? 5 : 1)))}
                    disabled={quantity >= product.stock_qty || isOutOfStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rice Breakdown Output */}
              {isRiceKg && riceBreakdown && (
                <div className="product-detail__breakdown">
                  <span className="breakdown-label">Line Item Breakdown:</span>
                  <span className="breakdown-value">
                    {riceBreakdown.sacks > 0
                      ? `${riceBreakdown.sacks} ${riceBreakdown.sacks === 1 ? "sack (25 kg)" : "sacks (50+ kg)"}`
                      : ""}
                    {riceBreakdown.sacks > 0 && riceBreakdown.looseKg > 0 ? " + " : ""}
                    {riceBreakdown.looseKg > 0 ? `${riceBreakdown.looseKg} loose kg` : ""}
                  </span>
                </div>
              )}

              {/* Total Calculation */}
              <div className="product-detail__total-row">
                <span className="total-label">{t("subtotalVal")}:</span>
                <span className="total-value">{formatPHP(product.price_php * quantity)}</span>
              </div>

              {/* Actions */}
              <div className="product-detail__actions">
                <button
                  type="button"
                  className="add-to-cart-btn"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  data-added={added}
                >
                  {added ? (
                    <>
                      <Check size={18} aria-hidden="true" />
                      <span>{t("addedToCart")}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} aria-hidden="true" />
                      <span>{isOutOfStock ? t("outOfStock") : t("addToCart")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-detail {
          padding-block: var(--space-12);
        }
        .product-detail__container {
          max-width: var(--container-max);
          margin-inline: auto;
          padding-inline: var(--gutter);
        }
        .product-detail__breadcrumbs {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          margin-bottom: var(--space-8);
        }
        .breadcrumb-link {
          font-weight: 500;
          color: var(--color-primary);
          text-decoration: none;
        }
        .breadcrumb-link:hover {
          color: var(--color-primary-dark);
          text-decoration: underline;
        }
        .breadcrumb-sep {
          color: var(--color-ink-3);
        }
        .breadcrumb-current {
          color: var(--color-ink-2);
          font-weight: 600;
        }
        .product-detail__back:hover {
          color: var(--color-primary-dark);
        }

        .product-detail__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-12);
          align-items: start;
        }

        /* Media */
        .product-detail__media {
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          aspect-ratio: 4 / 3;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .product-detail__image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          color: var(--color-ink-3);
        }
        .product-detail__icon {
          color: var(--color-primary);
          opacity: 0.6;
        }
        .product-detail__category-tag {
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--color-primary-dark);
        }

        /* Content */
        .product-detail__badge {
          display: inline-block;
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-primary);
          margin-bottom: var(--space-2);
        }
        .product-detail__title {
          font-size: var(--text-3xl);
          color: var(--color-primary-dark);
          margin: 0 0 var(--space-4);
          line-height: 1.2;
        }
        .product-detail__price-row {
          display: flex;
          align-items: baseline;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }
        .product-detail__price {
          font-family: var(--font-mono);
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--color-ink);
        }
        .product-detail__unit-label {
          font-size: var(--text-sm);
          color: var(--color-ink-3);
        }

        .product-detail__desc {
          font-size: var(--text-base);
          color: var(--color-ink-2);
          line-height: 1.6;
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--color-border);
        }

        /* Rice Notice */
        .product-detail__rice-notice {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-4);
          background-color: oklch(from var(--color-primary) l c h / 0.06);
          border: 1px solid oklch(from var(--color-primary) l c h / 0.2);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-6);
          font-size: var(--text-xs);
          color: var(--color-ink-2);
          line-height: 1.5;
        }
        .product-detail__notice-icon {
          color: var(--color-primary);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .product-detail__out-of-stock-notice {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background-color: oklch(from var(--color-error) l c h / 0.08);
          border: 1px solid oklch(from var(--color-error) l c h / 0.2);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-6);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-error);
        }

        /* Order Box */
        .product-detail__order-box {
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .product-detail__qty-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .product-detail__qty-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-ink);
        }
        .product-detail__qty-controls {
          display: flex;
          align-items: center;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .qty-btn {
          width: 2.2rem;
          height: 2.2rem;
          border: none;
          background-color: var(--color-paper-2);
          color: var(--color-ink);
          font-weight: 700;
          cursor: pointer;
        }
        .qty-btn:hover:not(:disabled) {
          background-color: var(--color-paper-3);
        }
        .qty-input {
          width: 3.5rem;
          height: 2.2rem;
          border: none;
          border-inline: 1px solid var(--color-border);
          text-align: center;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: 600;
        }

        .product-detail__breakdown {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-xs);
          padding: var(--space-2) var(--space-3);
          background-color: var(--color-paper-2);
          border-radius: var(--radius-sm);
        }
        .breakdown-label { color: var(--color-ink-3); }
        .breakdown-value { font-weight: 600; color: var(--color-primary-dark); }

        .product-detail__total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-top: var(--space-2);
          border-top: 1px dashed var(--color-border);
        }
        .total-label { font-size: var(--text-sm); font-weight: 600; color: var(--color-ink-2); }
        .total-value { font-family: var(--font-mono); font-size: var(--text-xl); font-weight: 700; color: var(--color-primary-dark); }

        .add-to-cart-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-6);
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: 600;
          cursor: pointer;
          transition: background-color var(--dur-fast) var(--ease-out);
        }
        .add-to-cart-btn:hover:not(:disabled) {
          background-color: var(--color-primary-hover);
        }
        .add-to-cart-btn[data-added="true"] {
          background-color: var(--color-success);
        }
        .add-to-cart-btn:disabled {
          background-color: var(--color-border);
          color: var(--color-ink-3);
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .product-detail__grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
