"use client";

// app/(public)/cart/CartView.tsx — Interactive Cart review component
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatPHP, breakdownRiceQty } from "@/types";

export default function CartView() {
  const { items, totalItems, totalPHP, updateQuantity, removeItem, clearCart } = useCart();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon" aria-hidden="true">
          <ShoppingBag size={48} />
        </div>
        <h2 className="cart-empty__title">{t("emptyCartHeading")}</h2>
        <p className="cart-empty__text">
          {t("emptyCartSub")}
        </p>
        <Link href="/catalog" className="cart-empty__btn">
          {t("browseBtn")}
        </Link>
        <style>{`
          .cart-empty {
            text-align: center;
            padding: var(--space-16) var(--space-6);
            background-color: var(--color-paper);
            border: 1px dashed var(--color-border);
            border-radius: var(--radius-xl);
            max-width: 540px;
            margin-inline: auto;
          }
          .cart-empty__icon {
            color: var(--color-primary);
            opacity: 0.5;
            margin-bottom: var(--space-4);
          }
          .cart-empty__title {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            color: var(--color-primary-dark);
            margin: 0 0 var(--space-2);
          }
          .cart-empty__text {
            font-size: var(--text-base);
            color: var(--color-ink-2);
            margin: 0 0 var(--space-8);
          }
          .cart-empty__btn {
            display: inline-flex;
            align-items: center;
            padding: var(--space-3) var(--space-6);
            background-color: var(--color-primary);
            color: var(--color-primary-fg);
            font-weight: 600;
            border-radius: var(--radius-md);
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cart-view">
      <div className="cart-view__grid">
        {/* Cart Items List */}
        <div className="cart-view__items">
          <div className="cart-view__header">
            <h2 className="cart-view__section-title">{t("cartItems")} ({totalItems})</h2>
            <button type="button" onClick={clearCart} className="cart-view__clear-btn">
              {t("clearCart")}
            </button>
          </div>

          <div className="cart-view__list">
            {items.map(({ product, quantity }) => {
              const isRiceKg = product.unit_type === "kg";
              const riceBreakdown = isRiceKg ? breakdownRiceQty(quantity) : null;
              const lineSubtotal = product.price_php * quantity;

              return (
                <div key={product.id} className="cart-item">
                  <div className="cart-item__main">
                    <div className="cart-item__info">
                      <span className="cart-item__badge">{product.category}</span>
                      <h3 className="cart-item__title">{product.name}</h3>
                      <span className="cart-item__unit-price">
                        {formatPHP(product.price_php)}{" "}
                        {isRiceKg
                          ? t("perKg")
                          : product.unit_type === "sack"
                          ? t("perSack")
                          : t("perUnit")}
                      </span>
                    </div>

                    {/* Rice breakdown line */}
                    {isRiceKg && riceBreakdown && (
                      <div className="cart-item__breakdown">
                        <span>Unit breakdown: </span>
                        <strong>
                          {riceBreakdown.sacks > 0
                            ? `${riceBreakdown.sacks} ${riceBreakdown.sacks === 1 ? "sack" : "sacks"}`
                            : ""}
                          {riceBreakdown.sacks > 0 && riceBreakdown.looseKg > 0 ? " + " : ""}
                          {riceBreakdown.looseKg > 0 ? `${riceBreakdown.looseKg} kg` : ""}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls & Line Subtotal */}
                  <div className="cart-item__right">
                    <div className="cart-item__qty-controls">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQuantity(product.id, quantity - (isRiceKg ? 5 : 1))}
                      >
                        -
                      </button>
                      <span className="qty-val">
                        {quantity} {isRiceKg ? "kg" : ""}
                      </span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQuantity(product.id, quantity + (isRiceKg ? 5 : 1))}
                      >
                        +
                      </button>
                    </div>

                    <span className="cart-item__total">{formatPHP(lineSubtotal)}</span>

                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => removeItem(product.id)}
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="cart-summary">
          <h2 className="cart-summary__title">{t("orderSummary")}</h2>

          <div className="cart-summary__rows">
            <div className="summary-row">
              <span>{t("subtotalVal")}</span>
              <span>{formatPHP(totalPHP)}</span>
            </div>
            <div className="summary-row">
              <span>Payment Method</span>
              <span className="summary-row__tag">In-Person Cash</span>
            </div>
            <div className="summary-row">
              <span>Pickup Location</span>
              <span>CRRDC Office, CLSU</span>
            </div>
          </div>

          <div className="cart-summary__divider" />

          <div className="summary-row summary-row--total">
            <span>{t("totalAmount")}:</span>
            <span className="total-val">{formatPHP(totalPHP)}</span>
          </div>

          <Link href="/checkout" className="checkout-btn">
            <span>{t("proceedCheckout")}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <Link href="/catalog" className="continue-link">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>{t("backToCatalog")}</span>
          </Link>
        </aside>
      </div>

      <style>{`
        .cart-view__grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: var(--space-8);
          align-items: start;
        }

        .cart-view__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
        }
        .cart-view__section-title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          color: var(--color-primary-dark);
          margin: 0;
        }
        .cart-view__clear-btn {
          background: none;
          border: none;
          color: var(--color-error);
          font-size: var(--text-xs);
          font-weight: 600;
          cursor: pointer;
        }

        .cart-view__list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        /* Cart Item */
        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-4);
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }
        .cart-item__main { flex: 1; min-width: 0; }
        .cart-item__badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-primary);
          letter-spacing: 0.05em;
        }
        .cart-item__title {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          color: var(--color-primary-dark);
          margin: 0 0 var(--space-1);
        }
        .cart-item__unit-price {
          font-size: var(--text-xs);
          color: var(--color-ink-3);
          font-family: var(--font-mono);
        }
        .cart-item__breakdown {
          font-size: var(--text-xs);
          color: var(--color-ink-2);
          margin-top: var(--space-2);
          padding: var(--space-1) var(--space-2);
          background-color: var(--color-paper-2);
          border-radius: var(--radius-sm);
          display: inline-block;
        }

        .cart-item__right {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-shrink: 0;
        }
        .cart-item__qty-controls {
          display: flex;
          align-items: center;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }
        .qty-btn {
          width: 1.8rem;
          height: 1.8rem;
          border: none;
          background: var(--color-paper-2);
          font-weight: 700;
          cursor: pointer;
        }
        .qty-val {
          padding-inline: var(--space-2);
          font-size: var(--text-xs);
          font-family: var(--font-mono);
          font-weight: 600;
        }
        .cart-item__total {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: var(--text-base);
          color: var(--color-ink);
          min-width: 80px;
          text-align: right;
        }
        .cart-item__remove {
          background: none;
          border: none;
          color: var(--color-ink-3);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: var(--radius-sm);
          transition: color var(--dur-fast) var(--ease-out);
        }
        .cart-item__remove:hover { color: var(--color-error); }

        /* Sidebar Summary */
        .cart-summary {
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }
        .cart-summary__title {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          color: var(--color-primary-dark);
          margin: 0 0 var(--space-6);
        }
        .cart-summary__rows {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-sm);
          color: var(--color-ink-2);
        }
        .summary-row__tag {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-primary);
        }
        .cart-summary__divider {
          height: 1px;
          background-color: var(--color-border);
          margin-block: var(--space-4);
        }
        .summary-row--total {
          font-weight: 700;
          font-size: var(--text-base);
          color: var(--color-ink);
          margin-bottom: var(--space-6);
        }
        .total-val {
          font-family: var(--font-mono);
          font-size: var(--text-xl);
          color: var(--color-primary-dark);
        }

        .checkout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: background-color var(--dur-fast) var(--ease-out);
          margin-bottom: var(--space-4);
        }
        .checkout-btn:hover { background-color: var(--color-primary-hover); }

        .continue-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          color: var(--color-ink-3);
          text-decoration: none;
        }
        .continue-link:hover { color: var(--color-primary); }

        @media (max-width: 768px) {
          .cart-view__grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
