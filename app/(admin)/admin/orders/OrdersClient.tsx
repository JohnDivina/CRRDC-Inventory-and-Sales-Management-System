"use client";

// app/(admin)/admin/orders/OrdersClient.tsx — Admin Cashier Orders Queue & Payment Confirmation Component
import { useState } from "react";
import Link from "next/link";
import { formatPHP, type Order } from "@/types";
import { Search, CheckCircle2, Clock, Eye, ClipboardList, AlertTriangle, ShieldCheck } from "lucide-react";

interface OrdersClientProps {
  initialOrders: Order[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [warningModal, setWarningModal] = useState<{
    orderId: string;
    pickupDate: string;
  } | null>(null);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      (o.billing_number && o.billing_number.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInitiateConfirm = (order: Order) => {
    const todayStr = new Date().toISOString().split("T")[0];

    // Check soft pickup date warning condition
    if (order.preferred_pickup_date && order.preferred_pickup_date > todayStr) {
      setWarningModal({
        orderId: order.id,
        pickupDate: order.preferred_pickup_date,
      });
      return;
    }

    executeConfirmOrder(order.id);
  };

  const executeConfirmOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      if (res.ok && result.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: result.status || "payment_confirmed", billing_number: result.billingNumber }
              : o
          )
        );
      } else {
        alert(result.error || "Failed to confirm order payment.");
      }
    } catch {
      alert("Failed to confirm order");
    } finally {
      setWarningModal(null);
    }
  };

  return (
    <div className="orders-view">
      <header className="orders-header">
        <div>
          <h1 className="orders-title">Cashier Order &amp; Payment Queue</h1>
          <p className="orders-subtitle">
            Confirm cash payments, auto-generate official billing numbers (MM-DD-XX), and process institutional orders.
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="orders-controls">
        <div className="search-box">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by Customer, Order ID, or Billing No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          {["all", "pending", "payment_confirmed", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              type="button"
              className="filter-btn"
              data-active={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            >
              {status.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Soft Warning Pickup Date Modal */}
      {warningModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <AlertTriangle size={36} className="warn-icon" />
            <h3 className="modal-title">Preferred Pickup Date Warning</h3>
            <p className="modal-text">
              The customer specified a preferred pickup date of <strong>{warningModal.pickupDate}</strong>.
              Would you like to confirm payment now anyway?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn--confirm"
                onClick={() => executeConfirmOrder(warningModal.orderId)}
              >
                Confirm Payment Now
              </button>
              <button
                type="button"
                className="btn btn--cancel"
                onClick={() => setWarningModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Billing Ref / Order ID</th>
              <th>Customer &amp; Org</th>
              <th>Order Type</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-row">
                  <div className="orders-empty">
                    <ClipboardList size={40} className="orders-empty__icon" aria-hidden="true" />
                    <span className="orders-empty__title">No orders found</span>
                    <span className="orders-empty__desc">Orders will appear here once submitted at checkout.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="id-cell">
                      <strong className="billing-num">{o.billing_number || "PENDING"}</strong>
                      <code className="order-code">ID: {o.id.slice(0, 8)}</code>
                    </div>
                  </td>
                  <td>
                    <div className="user-cell">
                      <strong className="name">{o.customer_name || "Guest Customer"}</strong>
                      <span className="org">{o.customer_org || "Individual"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="type-tag">{o.order_type.toUpperCase()}</span>
                  </td>
                  <td className="price-cell">{formatPHP(Number(o.total_price_php))}</td>
                  <td>
                    <span className="status-tag" data-status={o.status}>
                      {o.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      {o.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleInitiateConfirm(o)}
                          className="confirm-btn"
                        >
                          <ShieldCheck size={14} />
                          <span>Confirm Payment</span>
                        </button>
                      )}
                      <Link href={`/checkout/order/${o.id}`} target="_blank" className="icon-btn" title="View Tracker & Receipt">
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
        .orders-view { display: flex; flex-direction: column; gap: var(--space-6); max-width: 1100px; }
        .orders-title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-primary-dark); margin: 0 0 var(--space-1); }
        .orders-subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .orders-controls { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
        .search-box { position: relative; flex: 1; max-width: 400px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-ink-3); }
        .search-input { width: 100%; padding: var(--space-2) var(--space-3) var(--space-2) 36px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }

        .filter-group { display: flex; gap: var(--space-2); flex-wrap: wrap; }
        .filter-btn { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-paper); font-size: var(--text-xs); font-weight: 600; cursor: pointer; color: var(--color-ink-2); }
        .filter-btn[data-active="true"] { background-color: var(--color-primary-dark); color: var(--color-primary-fg); border-color: var(--color-primary-dark); }

        .modal-overlay { position: fixed; inset: 0; z-index: 9999; background: oklch(0% 0 0 / 0.5); display: flex; align-items: center; justify-content: center; padding: var(--space-4); }
        .modal-card { background: var(--color-paper); border-radius: var(--radius-xl); padding: var(--space-6); max-width: 420px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-3); }
        .warn-icon { color: var(--color-warning); }
        .modal-title { font-family: var(--font-display); font-size: var(--text-lg); margin: 0; }
        .modal-text { font-size: var(--text-xs); color: var(--color-ink-2); margin: 0; line-height: 1.5; }
        .modal-actions { display: flex; gap: var(--space-3); width: 100%; margin-top: var(--space-2); }
        .btn { flex: 1; padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-xs); border: none; cursor: pointer; }
        .btn--confirm { background: var(--color-primary); color: var(--color-primary-fg); }
        .btn--cancel { background: var(--color-paper-2); border: 1px solid var(--color-border); color: var(--color-ink); }

        .table-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--text-sm); }
        .admin-table th { padding: var(--space-4); border-bottom: 2px solid var(--color-border); font-size: var(--text-xs); text-transform: uppercase; color: var(--color-ink-2); font-weight: 600; background-color: var(--color-paper-2); }
        .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }

        .id-cell, .user-cell { display: flex; flex-direction: column; }
        .billing-num { font-size: var(--text-xs); color: var(--color-primary); }
        .order-code { font-family: var(--font-mono); font-size: 0.65rem; color: var(--color-ink-3); }
        .name { font-size: var(--text-xs); color: var(--color-heading); }
        .org { font-size: 0.7rem; color: var(--color-ink-2); }

        .type-tag { font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: var(--radius-full); background: var(--color-paper-2); border: 1px solid var(--color-border); }
        .price-cell { font-family: var(--font-mono); font-weight: 600; }

        .status-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: var(--radius-full); text-transform: uppercase; }
        .status-tag[data-status="pending"] { background-color: oklch(from var(--color-warning) l c h / 0.15); color: var(--color-warning); }
        .status-tag[data-status="payment_confirmed"] { background-color: oklch(from var(--color-success) l c h / 0.15); color: var(--color-primary); }
        .status-tag[data-status="completed"] { background-color: oklch(from var(--color-success) l c h / 0.2); color: var(--color-primary-dark); }

        .action-row { display: flex; align-items: center; gap: var(--space-2); }
        .confirm-btn { display: inline-flex; align-items: center; gap: var(--space-1); padding: 4px 10px; background-color: var(--color-primary); color: var(--color-primary-fg); border: none; border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: 600; cursor: pointer; }
        .icon-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-md); border: 1px solid var(--color-border); background-color: var(--color-paper); color: var(--color-ink-2); text-decoration: none; }
        .empty-row { text-align: center; color: var(--color-ink-3); padding: var(--space-6) !important; }
        .orders-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-6); }
        .orders-empty__icon { color: var(--color-primary); opacity: 0.5; }
        .orders-empty__title { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-heading); font-weight: 600; }
        .orders-empty__desc { font-size: var(--text-xs); color: var(--color-ink-2); }
      `}</style>
    </div>
  );
}
