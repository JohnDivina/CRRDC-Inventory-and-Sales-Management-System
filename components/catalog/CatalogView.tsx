"use client";

import { useState } from "react";
import type { Product } from "@/types";
import ProductCard from "./ProductCard";
import { PackageSearch } from "lucide-react";

interface CatalogViewProps {
  products: Product[];
}

const CATEGORIES = [
  { key: "all", label: "All Products" },
  { key: "seed", label: "Seeds" },
  { key: "rice", label: "Rice" },
  { key: "other", label: "Other Products" },
] as const;

export default function CatalogView({ products }: CatalogViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [animating, setAnimating] = useState(false);

  const handleCategoryChange = (key: string) => {
    if (key === activeCategory) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveCategory(key);
      setAnimating(false);
    }, 150);
  };

  const filteredProducts = products.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  return (
    <div className="catalog-view">
      {/* Category filter tabs */}
      <nav className="category-filter" aria-label="Product categories">
        <ul className="category-filter__list" role="list">
          {CATEGORIES.map(({ key, label }) => {
            const isActive = activeCategory === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  className="category-filter__tab"
                  data-active={isActive}
                  onClick={() => handleCategoryChange(key)}
                  aria-pressed={isActive}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Animated Product Grid / Empty State */}
      <div className={`catalog-grid-wrapper ${animating ? "is-animating" : ""}`}>
        {filteredProducts.length === 0 ? (
          <div className="catalog-empty">
            <div className="catalog-empty__icon" aria-hidden="true">
              <PackageSearch size={48} />
            </div>
            <p className="catalog-empty__title">No products found</p>
            <p className="catalog-empty__text">
              Check back soon or try a different category filter.
            </p>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .catalog-view {
          display: flex;
          flex-direction: column;
        }

        .category-filter {
          margin-bottom: var(--space-8);
        }
        .category-filter__list {
          display: flex;
          gap: var(--space-4);
          list-style: none;
          padding: var(--space-3) var(--space-2);
          margin: calc(-1 * var(--space-3)) calc(-1 * var(--space-2)) 0;
          overflow-x: auto;
          scrollbar-width: thin;
        }
        .category-filter__tab {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-3) var(--space-6);
          min-height: 44px;
          font-size: var(--text-sm);
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--color-ink-2);
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border-strong);
          background-color: var(--color-paper);
          white-space: nowrap;
          cursor: pointer;
          transition: transform 140ms cubic-bezier(0.2, 0.7, 0.3, 1),
                      box-shadow 140ms cubic-bezier(0.2, 0.7, 0.3, 1),
                      border-color 160ms ease,
                      background-color 160ms ease,
                      color 160ms ease;
        }
        .category-filter__tab:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background-color: var(--color-paper-2);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px oklch(0% 0 0 / 0.12);
        }
        .category-filter__tab:active {
          transform: translateY(1px);
          box-shadow: 0 2px 6px oklch(0% 0 0 / 0.08);
          transition-duration: 70ms;
        }
        .category-filter__tab[data-active="true"] {
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          border-color: var(--color-primary);
          font-weight: 600;
          box-shadow: 0 4px 14px oklch(0% 0 0 / 0.15);
        }

        .catalog-grid-wrapper {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 150ms var(--ease-out), transform 150ms var(--ease-out);
        }
        .catalog-grid-wrapper.is-animating {
          opacity: 0;
          transform: translateY(8px);
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--space-6);
        }

        .catalog-empty {
          text-align: center;
          padding: var(--space-16) var(--space-6);
          background-color: var(--color-paper-2);
          border-radius: var(--radius-lg);
          border: 1px dashed var(--color-border);
        }
        .catalog-empty__icon {
          color: var(--color-primary);
          opacity: 0.5;
          margin-bottom: var(--space-4);
        }
        .catalog-empty__title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          color: var(--color-primary-dark);
          margin: 0 0 var(--space-2);
        }
        .catalog-empty__text {
          font-size: var(--text-base);
          color: var(--color-ink-2);
          margin: 0;
        }

        @media (max-width: 900px) {
          .catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: var(--space-4);
          }
        }
        @media (max-width: 640px) {
          .catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}
