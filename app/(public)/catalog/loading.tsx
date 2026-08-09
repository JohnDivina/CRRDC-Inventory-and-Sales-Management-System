import ProductCardSkeleton from "@/components/catalog/ProductCardSkeleton";

export default function CatalogLoading() {
  return (
    <div className="page-container">
      <header className="page-header">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--subtitle" />
      </header>

      <div className="skeleton-filters">
        <div className="skeleton-tab" />
        <div className="skeleton-tab" />
        <div className="skeleton-tab" />
        <div className="skeleton-tab" />
      </div>

      <div className="catalog-grid-skeleton">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>

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
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .skeleton-line {
          background-color: var(--color-paper-2);
          border-radius: var(--radius-md);
        }
        .skeleton-line--title {
          width: 240px;
          height: 40px;
        }
        .skeleton-line--subtitle {
          width: 480px;
          max-width: 100%;
          height: 20px;
        }

        .skeleton-filters {
          display: flex;
          gap: var(--space-3);
          margin-bottom: var(--space-8);
        }
        .skeleton-tab {
          width: 90px;
          height: 38px;
          border-radius: var(--radius-full);
          background-color: var(--color-paper-2);
        }

        .catalog-grid-skeleton {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--space-6);
        }

        @media (max-width: 900px) {
          .catalog-grid-skeleton {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 600px) {
          .catalog-grid-skeleton {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
