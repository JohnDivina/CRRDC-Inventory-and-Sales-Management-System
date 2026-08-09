"use client";

// app/(admin)/dashboard/DashboardClient.tsx — Interactive Admin Dashboard Component
import Link from "next/link";
import { formatPHP } from "@/types";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Package,
  QrCode,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

import SalesAnalytics from "@/components/admin/SalesAnalytics";

interface DashboardClientProps {
  pendingCount: number;
  completedCount: number;
  totalSalesPHP: number;
  lowStockCount: number;
  activeProductsCount: number;
  recentOrders: any[];
}

export default function DashboardClient({
  pendingCount,
  completedCount,
  totalSalesPHP,
  lowStockCount,
  activeProductsCount,
  recentOrders,
}: DashboardClientProps) {
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">
            Research Innovation and Extension Overview
          </p>
        </div>

        <div className="dashboard__header-actions">
          <Link href="/admin/scanner" className="action-btn action-btn--primary">
            <QrCode size={18} aria-hidden="true" />
            <span>Scan QR Code</span>
          </Link>
          <Link href="/admin/inventory/new" className="action-btn action-btn--secondary">
            <PlusCircle size={18} aria-hidden="true" />
            <span>Add Product</span>
          </Link>
        </div>
      </header>

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card metric-card--yellow">
          <div className="metric-card__header">
            <span className="metric-card__label">Pending Confirmation</span>
            <Clock size={20} className="metric-icon metric-icon--yellow" aria-hidden="true" />
          </div>
          <span className="metric-card__value">{pendingCount}</span>
          <span className="metric-card__sub">Orders awaiting in-person payment</span>
        </div>

        <div className="metric-card metric-card--green">
          <div className="metric-card__header">
            <span className="metric-card__label">Total Revenue</span>
            <TrendingUp size={20} className="metric-icon metric-icon--green" aria-hidden="true" />
          </div>
          <span className="metric-card__value">{formatPHP(totalSalesPHP)}</span>
          <span className="metric-card__sub">{completedCount} completed transactions</span>
        </div>

        <div className="metric-card metric-card--orange">
          <div className="metric-card__header">
            <span className="metric-card__label">Low Stock Items</span>
            <AlertTriangle size={20} className="metric-icon metric-icon--orange" aria-hidden="true" />
          </div>
          <span className="metric-card__value">{lowStockCount}</span>
          <span className="metric-card__sub">Products below safety threshold</span>
        </div>

        <div className="metric-card metric-card--blue">
          <div className="metric-card__header">
            <span className="metric-card__label">Active Products</span>
            <Package size={20} className="metric-icon metric-icon--blue" aria-hidden="true" />
          </div>
          <span className="metric-card__value">{activeProductsCount}</span>
          <span className="metric-card__sub">Available in public catalog</span>
        </div>
      </div>

      {/* Interactive Sales Performance Analytics & Product Stock Statistics */}
      <SalesAnalytics />

      {/* Recent Pending Orders Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recent Pending Orders</h2>
          <Link href="/admin/orders" className="view-all-link">
            <span>View All Orders</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-box">
            <p>No pending orders at this time.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Created</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <code className="order-code">{order.id.slice(0, 8)}...</code>
                    </td>
                    <td>{new Date(order.created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="price-cell">{formatPHP(Number(order.total_price_php))}</td>
                    <td>
                      <span className="status-badge status-badge--pending">Pending</span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/scanner?orderId=${order.id}`}
                        className="table-action-btn"
                      >
                        Confirm
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .dashboard { display: flex; flex-direction: column; gap: var(--space-8); }
        .dashboard__header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-4); }
        .dashboard__title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-heading); margin: 0 0 var(--space-1); }
        .dashboard__subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .dashboard__header-actions { display: flex; gap: var(--space-3); }
        .action-btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; text-decoration: none; transition: background-color var(--dur-fast) var(--ease-out); }
        .action-btn--primary { background-color: var(--color-primary); color: var(--color-primary-fg); }
        .action-btn--primary:hover { background-color: var(--color-primary-hover); }
        .action-btn--secondary { background-color: var(--color-paper); border: 1px solid var(--color-border); color: var(--color-ink); }
        .action-btn--secondary:hover { background-color: var(--color-paper-2); border-color: var(--color-primary); }

        /* Metrics */
        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-5); }
        .metric-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-left: 4px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-2); transition: transform var(--dur-fast) var(--ease-out); }
        .metric-card:hover { transform: translateY(-2px); }
        .metric-card--yellow { border-left-color: var(--color-warning); }
        .metric-card--green { border-left-color: var(--color-success); }
        .metric-card--orange { border-left-color: var(--color-error); }
        .metric-card--blue { border-left-color: var(--color-primary); }

        .metric-card__header { display: flex; justify-content: space-between; align-items: center; }
        .metric-card__label { font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-2); text-transform: uppercase; letter-spacing: 0.05em; }
        .metric-card__value { font-family: var(--font-mono); font-size: var(--text-2xl); font-weight: 700; color: var(--color-heading); }
        .metric-card__sub { font-size: var(--text-xs); color: var(--color-ink-3); }

        .metric-icon--yellow { color: var(--color-warning); }
        .metric-icon--green { color: var(--color-success); }
        .metric-icon--orange { color: var(--color-error); }
        .metric-icon--blue { color: var(--color-primary); }

        /* Table Section */
        .dashboard-section { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
        .section-title { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-heading); margin: 0; }
        .view-all-link { display: flex; align-items: center; gap: var(--space-1); font-size: var(--text-xs); font-weight: 600; color: var(--color-primary); text-decoration: none; }

        .table-wrapper { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--text-sm); }
        .admin-table th { padding: var(--space-3) var(--space-4); border-bottom: 2px solid var(--color-border); font-size: var(--text-xs); text-transform: uppercase; color: var(--color-ink-2); font-weight: 600; }
        .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-ink); }
        .order-code { font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600; color: var(--color-heading); }
        .price-cell { font-family: var(--font-mono); font-weight: 600; }
        .status-badge { font-size: var(--text-xs); font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); }
        .status-badge--pending { background-color: oklch(from var(--color-warning) l c h / 0.15); color: var(--color-warning); }
        .table-action-btn { display: inline-block; padding: 4px 12px; background-color: var(--color-primary); color: var(--color-primary-fg); border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: 600; text-decoration: none; }
        .table-action-btn:hover { background-color: var(--color-primary-hover); }

        @media (max-width: 1200px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .metrics-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
