"use client";

// components/catalog/ProductCard.tsx — Hallmark styled product card (spacious & refined)
import { useState } from "react";
import Link from "next/link";
import { Plus, Check, Leaf } from "lucide-react";
import type { Product } from "@/types";
import { formatPHP } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/components/layout/LanguageContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);
  const isOutOfStock = product.stock_qty <= 0;
  const isRiceKg = product.unit_type === "kg";
  const stepQty = isRiceKg ? 5 : 1;
  const [qty, setQty] = useState(1);

  const CATEGORY_BADGES: Record<Product["category"], { label: string; class: string }> = {
    seed: { label: t("seeds"), class: "badge--seed" },
    rice: { label: t("rice"), class: "badge--rice" },
    other: { label: t("otherProducts"), class: "badge--other" },
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || qty <= 0) return;

    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const badge = CATEGORY_BADGES[product.category];

  return (
    <article className="product-card" data-out-of-stock={isOutOfStock}>
      <Link href={`/products/${product.id}`} className="product-card__link">
        {/* Product Media Area */}
        <div className="product-card__media">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="product-card__img"
              loading="lazy"
            />
          ) : (
            <div className="product-card__placeholder">
              <Leaf size={32} className="product-card__placeholder-icon" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="product-card__header">
          {isOutOfStock ? (
            <span className="product-card__badge badge--out-of-stock">{t("outOfStock")}</span>
          ) : (
            <span className={`product-card__badge ${badge.class}`}>{badge.label}</span>
          )}
          <span className="product-card__stock" data-low={product.stock_qty > 0 && product.stock_qty < 20}>
            {product.stock_qty > 0 ? `${product.stock_qty} ${t("inStock")}` : t("outOfStock")}
          </span>
        </div>

        <div className="product-card__body">
          <h3 className="product-card__title">{product.name}</h3>
          {product.description && (
            <p className="product-card__desc">{product.description}</p>
          )}
        </div>

        <div className="product-card__footer">
          <div className="product-card__price-group">
            <span className="product-card__price">{formatPHP(product.price_php)}</span>
            <span className="product-card__unit">
              {product.unit_type === "kg"
                ? t("perKg")
                : product.unit_type === "sack"
                ? t("perSack")
                : product.unit_type === "packet"
                ? t("perPacket")
                : t("perUnit")}
            </span>
          </div>

          <div className="product-card__controls" onClick={(e) => e.stopPropagation()}>
            <div className="product-card__stepper">
              <button
                type="button"
                className="stepper-btn"
                disabled={isOutOfStock || qty <= 1}
                onClick={(e) => {
                  e.preventDefault();
                  setQty((q) => Math.max(1, q - stepQty));
                }}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="stepper-val">{qty} {isRiceKg ? "kg" : ""}</span>
              <button
                type="button"
                className="stepper-btn"
                disabled={isOutOfStock || qty >= product.stock_qty}
                onClick={(e) => {
                  e.preventDefault();
                  setQty((q) => Math.min(product.stock_qty, q + stepQty));
                }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="product-card__btn"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              data-added={added}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <>
                  <Check size={16} aria-hidden="true" />
                  <span>{t("addedToCart")}</span>
                </>
              ) : (
                <>
                  <Plus size={16} aria-hidden="true" />
                  <span>{t("addToCart")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-7);
          position: relative;
          transition: border-color var(--dur-base) var(--ease-out),
                      box-shadow var(--dur-base) var(--ease-out),
                      transform var(--dur-fast) var(--ease-out);
        }
        .product-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 6px 24px oklch(0% 0 0 / 0.08);
          transform: translateY(-2px);
        }
        .product-card[data-out-of-stock="true"] {
          opacity: 0.75;
        }
        .product-card__link {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .product-card__media {
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background-color: var(--color-paper-2);
          margin-bottom: var(--space-4);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-card__placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: oklch(from var(--color-primary) l c h / 0.05);
        }
        .product-card__placeholder-icon {
          color: var(--color-primary);
          opacity: 0.4;
        }

        .product-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-5);
          gap: var(--space-3);
        }
        .product-card__badge {
          font-size: var(--text-xs);
          font-weight: 600;
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          word-spacing: normal;
          white-space: nowrap;
        }
        .badge--seed {
          background-color: oklch(from var(--color-primary) l c h / 0.12);
          color: var(--color-primary);
        }
        .badge--rice {
          background-color: oklch(from var(--color-accent-dim) l c h / 0.18);
          color: var(--color-accent-dim);
        }
        .badge--other {
          background-color: var(--color-paper-3);
          color: var(--color-ink-2);
        }
        .badge--out-of-stock {
          background-color: oklch(from var(--color-error) l c h / 0.12);
          color: var(--color-error);
        }

        .product-card__stock {
          font-size: var(--text-xs);
          color: var(--color-ink-3);
          font-family: var(--font-mono);
          white-space: nowrap;
        }
        .product-card__stock[data-low="true"] {
          color: var(--color-warning);
          font-weight: 600;
        }

        .product-card__body {
          flex: 1;
          margin-bottom: var(--space-6);
        }
        .product-card__title {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          color: var(--color-heading);
          margin: 0 0 var(--space-3);
          line-height: 1.3;
          letter-spacing: -0.01em;
        }
        .product-card__desc {
          font-size: var(--text-sm);
          color: var(--color-ink-2);
          margin: 0;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card__footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: var(--space-4);
          padding-top: var(--space-5);
          border-top: 1px dashed var(--color-border);
        }
        .product-card__price-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .product-card__price {
          font-family: var(--font-mono);
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--color-ink);
        }
        .product-card__unit {
          font-size: var(--text-xs);
          color: var(--color-ink-3);
          white-space: nowrap;
        }

        .product-card__controls {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .product-card__stepper {
          display: flex;
          align-items: center;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background-color: var(--color-paper-2);
          overflow: hidden;
        }
        .stepper-btn {
          width: 1.8rem;
          height: 2.2rem;
          border: none;
          background: transparent;
          font-weight: 700;
          font-size: var(--text-sm);
          color: var(--color-ink);
          cursor: pointer;
        }
        .stepper-btn:hover:not(:disabled) {
          background-color: var(--color-paper-3);
          color: var(--color-primary);
        }
        .stepper-btn:disabled {
          color: var(--color-ink-3);
          cursor: not-allowed;
        }
        .stepper-val {
          padding-inline: var(--space-2);
          font-size: var(--text-xs);
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--color-ink);
          white-space: nowrap;
        }

        .product-card__btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          min-height: 2.2rem;
          border: 1px solid var(--color-primary);
          border-radius: var(--radius-md);
          background-color: var(--color-paper);
          color: var(--color-primary);
          font-size: var(--text-sm);
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          white-space: nowrap;
          transition: background-color var(--dur-fast) var(--ease-out),
                      color var(--dur-fast) var(--ease-out),
                      border-color var(--dur-fast) var(--ease-out);
        }
        .product-card__btn:hover:not(:disabled) {
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
        }
        .product-card__btn[data-added="true"] {
          background-color: var(--color-success);
          border-color: var(--color-success);
          color: var(--color-primary-fg);
        }
        .product-card__btn:disabled {
          border-color: var(--color-border);
          color: var(--color-ink-3);
          cursor: not-allowed;
          background-color: var(--color-paper-2);
        }

        @media (max-width: 640px) {
          .product-card {
            padding: 10px;
            border-radius: var(--radius-lg);
          }
          .product-card__media {
            aspect-ratio: 1 / 1;
            margin-bottom: 6px;
          }
          .product-card__header {
            margin-bottom: 4px;
            gap: 4px;
            flex-wrap: wrap;
          }
          .product-card__badge {
            font-size: 0.625rem;
            padding: 2px 6px;
          }
          .product-card__stock {
            font-size: 0.625rem;
          }
          .product-card__body {
            margin-bottom: 6px;
          }
          .product-card__title {
            font-size: 0.85rem;
            line-height: 1.25;
            margin-bottom: 2px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 2.5em;
          }
          .product-card__desc {
            display: none;
          }
          .product-card__footer {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
            padding-top: 6px;
          }
          .product-card__price-group {
            flex-direction: row;
            justify-content: space-between;
            align-items: baseline;
          }
          .product-card__price {
            font-size: 0.95rem;
          }
          .product-card__unit {
            font-size: 0.65rem;
          }
          .product-card__controls {
            width: 100%;
            display: flex;
            gap: 4px;
          }
          .product-card__stepper {
            flex: 1;
            justify-content: space-between;
          }
          .stepper-btn {
            width: 1.5rem;
            height: 1.8rem;
            font-size: 0.75rem;
          }
          .stepper-val {
            font-size: 0.7rem;
            padding-inline: 2px;
          }
          .product-card__btn {
            padding: 4px 8px;
            min-height: 1.8rem;
            font-size: 0.75rem;
            gap: 2px;
          }
        }
      `}</style>
    </article>
  );
}
