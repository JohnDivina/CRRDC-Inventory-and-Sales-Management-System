// components/catalog/CatalogGrid.tsx — Grid wrapper for product cards
import type { Product } from "@/types";
import ProductCard from "./ProductCard";
import { PackageSearch } from "lucide-react";

interface CatalogGridProps {
  products: Product[];
}

export default function CatalogGrid({ products }: CatalogGridProps) {
  if (products.length === 0) {
    return (
      <div className="catalog-empty">
        <div className="catalog-empty__icon" aria-hidden="true">
          <PackageSearch size={48} />
        </div>
        <p className="catalog-empty__title">No products found</p>
        <p className="catalog-empty__text">
          Check back soon or try a different category.
        </p>
        <style>{`
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      <style>{`
        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--space-6);
        }
        @media (max-width: 900px) {
          .catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 600px) {
          .catalog-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
