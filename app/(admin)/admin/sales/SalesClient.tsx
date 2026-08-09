"use client";

// app/(admin)/sales/SalesClient.tsx — Admin Sales History Component
import { useState } from "react";
import Link from "next/link";
import { formatPHP, type Order } from "@/types";
import { TrendingUp, DollarSign, ShoppingBag, Calendar, Eye } from "lucide-react";

interface SalesClientProps {
  completedOrders: Order[];
}

export default function SalesClient({ completedOrders }: SalesClientProps) {
  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + Number(o.total_price_php || 0),
    0
  );
  const totalCount = completedOrders.length;
  const avgOrderVal = totalCount > 0 ? totalRevenue / totalCount : 0;

  return (
    <div className="sales-view">
      <header className="sales-header">
        <div>
          <h1 className="sales-title">Sales History &amp; Revenue</h1>
          <p className="sales-subtitle">Track completed in-person sales transactions and revenue performance.</p>
        </div>
      </header>

      {/* Analytics Cards */}
      <div className="sales-metrics">
        <div className="metric-card">
          <div className="metric-card__header">
            <span className="metric-card__label">Total Revenue</span>
            <TrendingUp size={20} className="metric-icon metric-icon--green" aria-hidden="true" />
          </div>
          <span className="metric-card__value">{formatPHP(totalRevenue)}</span>
          <span className="metric-card__sub">All-time confirmed sales</span>
        </div>

        <div className="metric-card">
          <div className="metric-card__header">
            <span className="metric-card__label">Completed Transactions</span>
            <ShoppingBag size={20} className="metric-icon metric-icon--blue" aria-hidden="true" />
          </div>
          <span className="metric-card__value">{totalCount}</span>
          <span className="metric-card__sub">Orders fulfilled &amp; paid</span>
        </div>

        <div className="metric-card">
          <div className="metric-card__header">
            <span className="metric-card__label">Average Order Value</span>
            <DollarSign size={20} className="metric-icon metric-icon--gold" aria-hidden="true" />
          </div>
          <span className="metric-card__value">{formatPHP(avgOrderVal)}</span>
          <span className="metric-card__sub">Per completed transaction</span>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="table-card">
        <div className="table-header">
          <h2 className="table-title">Completed Sales Ledger</h2>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Confirmed Date &amp; Time</th>
              <th>Total Revenue</th>
              <th>Payment Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {completedOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">
                  No completed sales recorded yet. Confirmed orders will appear here.
                </td>
              </tr>
            ) : (
              completedOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <code className="order-code">{o.id}</code>
                  </td>
                  <td>
                    {o.confirmed_at
                      ? new Date(o.confirmed_at).toLocaleString("en-PH")
                      : new Date(o.created_at).toLocaleString("en-PH")}
                  </td>
                  <td className="price-cell">{formatPHP(Number(o.total_price_php))}</td>
                  <td>
                    <span className="status-tag status-tag--completed">
                      PAID IN CASH
                    </span>
                  </td>
                  <td>
                    <Link href={`/checkout/order/${o.id}`} target="_blank" className="icon-btn" title="View Receipt">
                      <Eye size={16} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .sales-view { display: flex; flex-direction: column; gap: var(--space-6); }
        .sales-title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-primary-dark); margin: 0 0 var(--space-1); }
        .sales-subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .sales-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
        .metric-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-2); }
        .metric-card__header { display: flex; justify-content: space-between; align-items: center; }
        .metric-card__label { font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-2); text-transform: uppercase; letter-spacing: 0.05em; }
        .metric-card__value { font-family: var(--font-mono); font-size: var(--text-2xl); font-weight: 700; color: var(--color-primary-dark); }
        .metric-card__sub { font-size: var(--text-xs); color: var(--color-ink-3); }

        .metric-icon--green { color: var(--color-primary); }
        .metric-icon--blue { color: oklch(50% 0.15 240); }
        .metric-icon--gold { color: var(--color-warning); }

        .table-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
        .table-header { padding: var(--space-6); border-bottom: 1px solid var(--color-border); }
        .table-title { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-primary-dark); margin: 0; }

        .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--text-sm); }
        .admin-table th { padding: var(--space-4); border-bottom: 2px solid var(--color-border); font-size: var(--text-xs); text-transform: uppercase; color: var(--color-ink-2); font-weight: 600; background-color: var(--color-paper-2); }
        .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .empty-row { text-align: center; color: var(--color-ink-3); padding: var(--space-12) !important; }

        .order-code { font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600; color: var(--color-primary-dark); }
        .price-cell { font-family: var(--font-mono); font-weight: 600; }

        .status-tag--completed { font-size: var(--text-xs); font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); background-color: oklch(from var(--color-success) l c h / 0.15); color: var(--color-primary-dark); }
        .icon-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-md); border: 1px solid var(--color-border); background-color: var(--color-paper); color: var(--color-ink-2); text-decoration: none; }

        @media (max-width: 900px) { .sales-metrics { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
