"use client";

// app/(admin)/orders/OrdersClient.tsx — Admin Orders List Component
import { useState } from "react";
import Link from "next/link";
import { formatPHP, type Order } from "@/types";
import { Search, CheckCircle2, Clock, Eye, ClipboardList } from "lucide-react";

interface OrdersClientProps {
  initialOrders: Order[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o))
        );
      }
    } catch {
      alert("Failed to confirm order");
    }
  };

  return (
    <div className="orders-view">
      <header className="orders-header">
        <div>
          <h1 className="orders-title">Order Management</h1>
          <p className="orders-subtitle">View guest orders, monitor payment status, and confirm cash receipts.</p>
        </div>
      </header>

      {/* Controls */}
      <div className="orders-controls">
        <div className="search-box">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          {["all", "pending", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              type="button"
              className="filter-btn"
              data-active={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            >
              {status.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date &amp; Time</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">
                  <div className="orders-empty">
                    <ClipboardList size={40} className="orders-empty__icon" aria-hidden="true" />
                    <span className="orders-empty__title">No orders yet</span>
                    <span className="orders-empty__desc">Orders will appear here once customers submit them.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <code className="order-code">{o.id}</code>
                  </td>
                  <td>{new Date(o.created_at).toLocaleString("en-PH")}</td>
                  <td className="price-cell">{formatPHP(Number(o.total_price_php))}</td>
                  <td>
                    <span className="status-tag" data-status={o.status}>
                      {o.status === "completed" ? (
                        <>
                          <CheckCircle2 size={12} aria-hidden="true" /> Completed
                        </>
                      ) : (
                        <>
                          <Clock size={12} aria-hidden="true" /> Pending
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      {o.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleConfirmOrder(o.id)}
                          className="confirm-btn"
                        >
                          Confirm
                        </button>
                      )}
                      <Link href={`/checkout/order/${o.id}`} target="_blank" className="icon-btn" title="View Receipt">
                        <Eye size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .orders-view { display: flex; flex-direction: column; gap: var(--space-6); }
        .orders-title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-primary-dark); margin: 0 0 var(--space-1); }
        .orders-subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .orders-controls { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
        .search-box { position: relative; flex: 1; max-width: 360px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-ink-3); }
        .search-input { width: 100%; padding: var(--space-2) var(--space-3) var(--space-2) 36px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }

        .filter-group { display: flex; gap: var(--space-2); }
        .filter-btn { padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-paper); font-size: var(--text-xs); font-weight: 600; cursor: pointer; color: var(--color-ink-2); }
        .filter-btn[data-active="true"] { background-color: var(--color-primary-dark); color: var(--color-primary-fg); border-color: var(--color-primary-dark); }

        .table-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--text-sm); }
        .admin-table th { padding: var(--space-4); border-bottom: 2px solid var(--color-border); font-size: var(--text-xs); text-transform: uppercase; color: var(--color-ink-2); font-weight: 600; background-color: var(--color-paper-2); }
        .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .empty-row { text-align: center; color: var(--color-ink-3); padding: var(--space-6) !important; }
        .orders-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-6); }
        .orders-empty__icon { color: var(--color-primary); opacity: 0.5; }
        .orders-empty__title { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-heading); font-weight: 600; }
        .orders-empty__desc { font-size: var(--text-xs); color: var(--color-ink-2); }

        .order-code { font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600; color: var(--color-heading); }
        .price-cell { font-family: var(--font-mono); font-weight: 600; }

        .status-tag { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-xs); font-weight: 600; padding: 2px 8px; border-radius: var(--radius-full); }
        .status-tag[data-status="pending"] { background-color: oklch(from var(--color-warning) l c h / 0.15); color: var(--color-warning); }
        .status-tag[data-status="completed"] { background-color: oklch(from var(--color-success) l c h / 0.15); color: var(--color-primary); }

        .action-row { display: flex; align-items: center; gap: var(--space-2); }
        .confirm-btn { padding: 4px 12px; background-color: var(--color-primary); color: var(--color-primary-fg); border: none; border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: 600; cursor: pointer; }
        .confirm-btn:hover { background-color: var(--color-primary-hover); }

        .icon-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-md); border: 1px solid var(--color-border); background-color: var(--color-paper); color: var(--color-ink-2); text-decoration: none; }
        .icon-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
      `}</style>
    </div>
  );
}
