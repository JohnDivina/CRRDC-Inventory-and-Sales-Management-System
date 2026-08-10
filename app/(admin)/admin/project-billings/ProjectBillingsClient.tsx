"use client";

// app/(admin)/admin/project-billings/ProjectBillingsClient.tsx — Deferred Project Billings & Follow-Up Tracker
import { useState, useEffect } from "react";
import type { Order } from "@/types";
import { formatPHP } from "@/types";
import { Briefcase, Calendar, CheckCircle2, AlertCircle, RefreshCw, Clock } from "lucide-react";

export default function ProjectBillingsClient() {
  const [projectOrders, setProjectOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchProjectBillings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders?orderType=project");
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || "Failed to load project billings.");
      setProjectOrders(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectBillings();
  }, []);

  const handleMarkPaid = async (orderId: string) => {
    setConfirmingId(orderId);
    setError(null);
    setSuccessMsg(null);

    try {
      // Mark as paid & release inventory atomically
      const res = await fetch(`/api/orders/${orderId}/release`, {
        method: "POST",
      });

      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || "Failed to confirm project payment.");

      setSuccessMsg(`Project order payment confirmed! Status updated to COMPLETED and inventory decremented.`);
      fetchProjectBillings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirmingId(null);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="project-billings-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Project Billings &amp; Monthly Follow-Up</h1>
          <p className="page-subtitle">
            Track deferred project-funded orders, monitor monthly 20th follow-up dates, and mark payments received.
          </p>
        </div>
        <button type="button" onClick={fetchProjectBillings} className="refresh-btn">
          <RefreshCw size={16} className={loading ? "spin" : ""} aria-hidden="true" />
          <span>Refresh List</span>
        </button>
      </header>

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

      <div className="table-wrapper">
        <table className="billings-table">
          <thead>
            <tr>
              <th>Billing Ref / Order ID</th>
              <th>Requestioner &amp; Organization</th>
              <th>Project Details</th>
              <th>Amount Due</th>
              <th>Next Follow-Up Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="loading-cell">Loading project billings...</td>
              </tr>
            ) : projectOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">No pending project billings found.</td>
              </tr>
            ) : (
              projectOrders.map((o) => {
                const isOverdue = o.preferred_pickup_date && o.preferred_pickup_date < todayStr;
                return (
                  <tr key={o.id}>
                    <td>
                      <div className="ref-cell">
                        <strong className="billing-num">{o.billing_number || "PENDING"}</strong>
                        <span className="order-id">ID: <code>{o.id.slice(0, 8)}</code></span>
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <strong className="name">{o.customer_name || "N/A"}</strong>
                        <span className="org">{o.customer_org || "CLSU Project"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="project-cell">
                        <span className="purpose">{o.purpose || "Project Research Supply"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="amount">{formatPHP(Number(o.total_price_php))}</span>
                    </td>
                    <td>
                      <div className="date-cell" data-overdue={isOverdue}>
                        <Calendar size={14} aria-hidden="true" />
                        <span>{o.preferred_pickup_date || "Every 20th of the Month"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" data-status={o.status}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {o.status !== "completed" ? (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(o.id)}
                          disabled={confirmingId === o.id}
                          className="mark-paid-btn"
                        >
                          <CheckCircle2 size={14} aria-hidden="true" />
                          <span>{confirmingId === o.id ? "Updating..." : "Mark as Paid"}</span>
                        </button>
                      ) : (
                        <span className="paid-tag">PAID &amp; CLOSED</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .project-billings-page { display: flex; flex-direction: column; gap: var(--space-6); max-width: 1100px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-heading); margin: 0 0 var(--space-1); }
        .page-subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .refresh-btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border); background: var(--color-paper); border-radius: var(--radius-md); font-size: var(--text-xs); font-weight: 600; cursor: pointer; color: var(--color-ink-2); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .alert { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); border-radius: var(--radius-lg); font-size: var(--text-sm); font-weight: 500; }
        .alert--success { background-color: oklch(from var(--color-success) l c h / 0.12); color: var(--color-primary); border: 1px solid var(--color-primary); }
        .alert--error { background-color: oklch(from var(--color-error) l c h / 0.1); color: var(--color-error); border: 1px solid var(--color-error); }

        .table-wrapper { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
        .billings-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--text-sm); }
        .billings-table th { background-color: var(--color-paper-2); padding: var(--space-4); font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-2); border-bottom: 1px solid var(--color-border); }
        .billings-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }

        .ref-cell, .user-cell, .project-cell { display: flex; flex-direction: column; }
        .billing-num { font-size: var(--text-sm); color: var(--color-primary); }
        .order-id { font-size: 0.65rem; color: var(--color-ink-3); }
        .name { font-size: var(--text-xs); color: var(--color-heading); }
        .org { font-size: 0.7rem; color: var(--color-ink-2); }
        .amount { font-family: var(--font-mono); font-weight: 700; color: var(--color-heading); }

        .date-cell { display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-2); padding: 4px 8px; border-radius: var(--radius-md); background-color: var(--color-paper-2); }
        .date-cell[data-overdue="true"] { background-color: oklch(from var(--color-error) l c h / 0.1); color: var(--color-error); border: 1px solid var(--color-error); }

        .status-badge { font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: var(--radius-full); }
        .status-badge[data-status="project_pending"] { background-color: oklch(from var(--color-warning) l c h / 0.15); color: var(--color-warning); }
        .status-badge[data-status="completed"] { background-color: oklch(from var(--color-success) l c h / 0.15); color: var(--color-primary); }

        .mark-paid-btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background-color: var(--color-primary); color: var(--color-primary-fg); border: none; border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-xs); cursor: pointer; }
        .mark-paid-btn:disabled { opacity: 0.6; cursor: wait; }
        .paid-tag { font-size: 0.65rem; font-weight: 700; color: var(--color-primary); }

        .loading-cell, .empty-cell { text-align: center; padding: var(--space-10); color: var(--color-ink-3); }
      `}</style>
    </div>
  );
}
