export default function DashboardLoading() {
  return (
    <div className="dashboard-skeleton">
      <header className="skeleton-header">
        <div className="skeleton-title" />
        <div className="skeleton-sub" />
      </header>

      <div className="metrics-grid-skeleton">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="metric-card-skeleton">
            <div className="metric-icon-skeleton" />
            <div className="metric-text-skeleton">
              <div className="metric-label-skeleton" />
              <div className="metric-val-skeleton" />
            </div>
          </div>
        ))}
      </div>

      <div className="table-card-skeleton">
        <div className="table-header-skeleton" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="table-row-skeleton" />
        ))}
      </div>

      <style>{`
        .dashboard-skeleton {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
        .skeleton-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .skeleton-title {
          width: 220px;
          height: 36px;
          background-color: var(--color-paper-3);
          border-radius: var(--radius-md);
        }
        .skeleton-sub {
          width: 380px;
          max-width: 100%;
          height: 18px;
          background-color: var(--color-paper-3);
          border-radius: var(--radius-sm);
        }

        .metrics-grid-skeleton {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: var(--space-4);
        }
        .metric-card-skeleton {
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .metric-icon-skeleton {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          background-color: var(--color-paper-3);
        }
        .metric-text-skeleton {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
        }
        .metric-label-skeleton {
          width: 70%;
          height: 14px;
          background-color: var(--color-paper-3);
          border-radius: var(--radius-sm);
        }
        .metric-val-skeleton {
          width: 50%;
          height: 24px;
          background-color: var(--color-paper-3);
          border-radius: var(--radius-sm);
        }

        .table-card-skeleton {
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .table-header-skeleton {
          width: 100%;
          height: 40px;
          background-color: var(--color-paper-3);
          border-radius: var(--radius-md);
        }
        .table-row-skeleton {
          width: 100%;
          height: 48px;
          background-color: var(--color-paper-2);
          border-radius: var(--radius-md);
        }

        @media (max-width: 1200px) {
          .metrics-grid-skeleton {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 600px) {
          .metrics-grid-skeleton {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
