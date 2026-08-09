// app/(public)/catalog/[category]/page.tsx — Category-filtered catalog
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products.api";
import type { ProductCategory } from "@/types";
import CategoryFilter from "@/components/catalog/CategoryFilter";
import CatalogGrid from "@/components/catalog/CatalogGrid";

const VALID_CATEGORIES: ProductCategory[] = ["seed", "rice", "other"];
const CATEGORY_META: Record<ProductCategory, { title: string; subtitle: string }> = {
  seed: {
    title: "Certified Seeds",
    subtitle: "High-quality foundation and registered seeds developed and tested by CLSU researchers.",
  },
  rice: {
    title: "Milled Rice",
    subtitle: "Premium milled rice from CRRDC's own varieties — sold per kilogram or 25-kg sack.",
  },
  other: {
    title: "Other Produce & Inputs",
    subtitle: "Organic inputs, bio-fertilizers, and specialized agricultural products.",
  },
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as ProductCategory)) return {};
  const cat = category as ProductCategory;
  return {
    title: `${CATEGORY_META[cat].title} | CRRDC — CLSU`,
    description: CATEGORY_META[cat].subtitle,
  };
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as ProductCategory)) notFound();

  const cat = category as ProductCategory;
  const meta = CATEGORY_META[cat];
  const products = await getProducts(cat);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">{meta.title}</h1>
        <p className="page-subtitle">{meta.subtitle}</p>
      </header>

      <CategoryFilter />

      <CatalogGrid products={products} />

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
