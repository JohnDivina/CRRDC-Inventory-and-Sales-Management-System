"use client";

// app/(admin)/admin/releases/ReleasesClient.tsx — Seed Laboratory Item Release Queue UI
import { useState, useEffect } from "react";
import type { Order } from "@/types";
import { formatPHP } from "@/types";
import { PackageCheck, CheckCircle2, AlertCircle, RefreshCw, Box, AlertTriangle, Calendar } from "lucide-react";

export default function ReleasesClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Soft pickup date warning modal state
  const [pendingReleaseOrder, setPendingReleaseOrder] = useState<Order | null>(null);

  const fetchConfirmedOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders?status=payment_confirmed");
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || "Failed to load release queue.");
      setOrders(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfirmedOrders();
  }, []);

  const handleReleaseClick = (order: Order) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const isFuturePickup = order.preferred_pickup_date && order.preferred_pickup_date > todayStr;

    if (isFuturePickup) {
      setPendingReleaseOrder(order);
    } else {
      executeConfirmRelease(order.id);
    }
  };

  const executeConfirmRelease = async (orderId: string) => {
    setReleasingId(orderId);
    setPendingReleaseOrder(null);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/release`, {
        method: "POST",
      });

      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || "Failed to confirm item release.");

      setSuccessMsg(`Order #${orderId.slice(0, 8)} items successfully released! Product inventory decremented.`);
      fetchConfirmedOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <div className="releases-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Seed Laboratory Item Release Queue</h1>
          <p className="page-subtitle">
            Verify cashier-confirmed orders and release certified seeds, rice, and agricultural products to customers.
          </p>
        </div>
        <button type="button" onClick={fetchConfirmedOrders} className="refresh-btn">
          <RefreshCw size={16} className={loading ? "spin" : ""} aria-hidden="true" />
          <span>Refresh Queue</span>
        </button>
      </header>

      {/* ⚠️ SOFT PICKUP DATE WARNING MODAL */}
      {pendingReleaseOrder && (
        <div className="modal-backdrop">
          <div className="warning-modal">
            <div className="modal-icon-header">
              <AlertTriangle size={32} className="warning-icon" />
            </div>
            <h3 className="modal-title">Preferred Pickup Date Warning</h3>
            <p className="modal-body">
              The customer's preferred pickup date for Order <code>#{pendingReleaseOrder.id.slice(0, 8)}</code> is{" "}
              <strong className="date-highlight">
                <Calendar size={14} className="inline-icon" /> {pendingReleaseOrder.preferred_pickup_date}
              </strong>.
              <br /><br />
              Would you like to release the items now anyway?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setPendingReleaseOrder(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-btn"
                onClick={() => executeConfirmRelease(pendingReleaseOrder.id)}
              >
                Release Items Now
              </button>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="alert alert--success">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert--error">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-box">Loading release queue...</div>
      ) : orders.length === 0 ? (
        <div className="empty-box">
          <Box size={40} className="empty-icon" />
          <p>No orders awaiting item release at this time.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => {
            const todayStr = new Date().toISOString().split("T")[0];
            const isFuturePickup = o.preferred_pickup_date && o.preferred_pickup_date > todayStr;
            return (
              <div key={o.id} className="release-card">
                <div className="card-header">
                  <div>
                    <span className="billing-num">Billing Ref: <strong>{o.billing_number || "PAID"}</strong></span>
                    <h3 className="customer-name">{o.customer_name || "Guest Customer"}</h3>
                    <span className="order-id">Order ID: <code>{o.id}</code></span>
                  </div>
                  <span className="type-badge">{(o.order_type || "regular").toUpperCase()}</span>
                </div>

                {isFuturePickup && (
                  <div className="pickup-date-badge">
                    <Calendar size={13} aria-hidden="true" />
                    <span>Pickup Date: <strong>{o.preferred_pickup_date}</strong></span>
                  </div>
                )}

                {o.items && o.items.length > 0 && (
                  <div className="items-box">
                    <span className="items-heading">Items to Hand Out:</span>
                    <ul className="items-list">
                      {o.items.map((item, idx) => (
                        <li key={idx} className="item-row">
                          <strong>{item.quantity} {item.unit_type}</strong>
                          <span>{item.product?.name || "Agricultural Item"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="card-footer">
                  <div className="total-val">
                    <span>Total Paid Value:</span>
                    <strong>{formatPHP(Number(o.total_price_php))}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReleaseClick(o)}
                    disabled={releasingId === o.id}
                    className="release-btn"
                  >
                    <PackageCheck size={18} aria-hidden="true" />
                    <span>{releasingId === o.id ? "Releasing Items..." : "Confirm Items Released"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .releases-page { display: flex; flex-direction: column; gap: var(--space-6); max-width: 1080px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-heading); margin: 0 0 var(--space-1); }
        .page-subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .refresh-btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border); background: var(--color-paper); border-radius: var(--radius-md); font-size: var(--text-xs); font-weight: 600; cursor: pointer; color: var(--color-ink-2); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .alert { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); border-radius: var(--radius-lg); font-size: var(--text-sm); font-weight: 500; }
        .alert--success { background-color: oklch(from var(--color-success) l c h / 0.12); color: var(--color-primary); border: 1px solid var(--color-primary); }
        .alert--error { background-color: oklch(from var(--color-error) l c h / 0.1); color: var(--color-error); border: 1px solid var(--color-error); }

        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-6); }
        .release-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); border-left: 5px solid var(--color-primary); }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .billing-num { font-size: var(--text-xs); color: var(--color-primary); display: block; margin-bottom: 2px; }
        .customer-name { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-heading); margin: 0 0 2px; }
        .order-id { font-size: 0.7rem; color: var(--color-ink-3); }

        .type-badge { font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: var(--radius-full); background-color: oklch(from var(--color-primary) l c h / 0.12); color: var(--color-primary); }
        .pickup-date-badge { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background-color: oklch(from var(--color-accent) l c h / 0.15); border-radius: var(--radius-md); font-size: var(--text-xs); color: var(--color-ink); }

        .items-box { background-color: var(--color-paper-2); padding: var(--space-3); border-radius: var(--radius-lg); }
        .items-heading { font-size: 0.7rem; font-weight: 700; color: var(--color-ink-3); text-transform: uppercase; margin-bottom: var(--space-2); display: block; }
        .items-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); }
        .item-row { display: flex; gap: var(--space-2); color: var(--color-heading); }

        .card-footer { display: flex; flex-direction: column; gap: var(--space-3); border-top: 1px solid var(--color-border); padding-top: var(--space-3); }
        .total-val { display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-ink-2); }
        .release-btn { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-3) var(--space-4); background-color: var(--color-primary); color: var(--color-primary-fg); border: none; border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-sm); cursor: pointer; }
        .release-btn:disabled { opacity: 0.6; cursor: wait; }

        .loading-box, .empty-box { padding: var(--space-12); text-align: center; color: var(--color-ink-3); background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); display: flex; flex-direction: column; align-items: center; gap: var(--space-3); }
        .empty-icon { color: var(--color-ink-3); opacity: 0.5; }

        .modal-backdrop { position: fixed; inset: 0; background-color: oklch(0% 0 0 / 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: var(--space-4); }
        .warning-modal { background-color: var(--color-paper); border-radius: var(--radius-xl); border: 1px solid var(--color-border); padding: var(--space-6); max-width: 440px; width: 100%; display: flex; flex-direction: column; gap: var(--space-4); box-shadow: 0 20px 40px oklch(0% 0 0 / 0.2); }
        .modal-icon-header { display: flex; justify-content: center; }
        .warning-icon { color: var(--color-accent); }
        .modal-title { font-family: var(--font-display); font-size: var(--text-xl); text-align: center; color: var(--color-heading); margin: 0; }
        .modal-body { font-size: var(--text-sm); color: var(--color-ink-2); text-align: center; margin: 0; line-height: 1.5; }
        .date-highlight { color: var(--color-primary); font-weight: 700; }
        .inline-icon { display: inline; vertical-align: text-bottom; }
        .modal-actions { display: flex; gap: var(--space-3); margin-top: var(--space-2); }
        .cancel-btn { flex: 1; padding: var(--space-3); border: 1px solid var(--color-border); background: var(--color-paper-2); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; color: var(--color-ink); }
        .confirm-btn { flex: 1; padding: var(--space-3); border: none; background: var(--color-primary); color: var(--color-primary-fg); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  );
}
