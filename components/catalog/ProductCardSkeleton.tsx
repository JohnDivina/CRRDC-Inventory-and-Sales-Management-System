export default function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-badge" />
        <div className="skeleton-title" />
        <div className="skeleton-desc" />
        <div className="skeleton-footer">
          <div className="skeleton-price" />
          <div className="skeleton-btn" />
        </div>
      </div>

      <style>{`
        .product-card-skeleton {
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px oklch(0% 0 0 / 0.04);
        }
        .skeleton-image {
          width: 100%;
          aspect-ratio: 4 / 3;
          background: linear-gradient(
            90deg,
            var(--color-paper-2) 25%,
            var(--color-paper-3) 50%,
            var(--color-paper-2) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-content {
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          flex: 1;
        }
        .skeleton-badge {
          width: 60px;
          height: 16px;
          border-radius: var(--radius-full);
          background-color: var(--color-paper-2);
        }
        .skeleton-title {
          width: 80%;
          height: 22px;
          border-radius: var(--radius-sm);
          background-color: var(--color-paper-2);
        }
        .skeleton-desc {
          width: 100%;
          height: 36px;
          border-radius: var(--radius-sm);
          background-color: var(--color-paper-2);
        }
        .skeleton-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: var(--space-2);
        }
        .skeleton-price {
          width: 70px;
          height: 20px;
          border-radius: var(--radius-sm);
          background-color: var(--color-paper-2);
        }
        .skeleton-btn {
          width: 90px;
          height: 34px;
          border-radius: var(--radius-md);
          background-color: var(--color-paper-2);
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
