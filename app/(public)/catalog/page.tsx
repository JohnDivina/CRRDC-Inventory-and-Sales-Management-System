// app/(public)/catalog/page.tsx — All products catalog
import type { Metadata } from "next";
import { getProducts } from "@/lib/products.api";
import CatalogView from "@/components/catalog/CatalogView";

export const metadata: Metadata = {
  title: "Product Catalog | CRRDC — CLSU",
  description: "Browse CRRDC's full catalog of certified seeds, rice, and other agricultural products.",
};

export const revalidate = 3600;

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Product Catalog</h1>
        <p className="page-subtitle">
          Explore certified seeds, quality rice, and agricultural inputs developed and distributed by CRRDC.
        </p>
      </header>

      <CatalogView products={products} />

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
          color: var(--color-heading);
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
