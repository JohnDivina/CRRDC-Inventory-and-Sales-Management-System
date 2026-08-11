"use client";

// app/(admin)/admin/audit-logs/AuditLogsClient.tsx — Unified System Audit Trail Client Component
import { useState } from "react";
import { Search, ShieldAlert, History, Filter, UserCheck, RefreshCw, Database } from "lucide-react";

interface AuditLogEntry {
  id: string;
  actor_name: string;
  actor_designation?: string | null;
  action_type: string;
  target_table: string;
  record_id: string;
  quantity?: number;
  notes?: string | null;
  created_at: string;
}

interface AuditLogsClientProps {
  initialLogs: AuditLogEntry[];
  isMasterAdmin?: boolean;
}

export default function AuditLogsClient({ initialLogs, isMasterAdmin = false }: AuditLogsClientProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [periodName, setPeriodName] = useState("");
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.action_type.toLowerCase().includes(search.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(search.toLowerCase())) ||
      log.record_id.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action_type === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleRefresh = async () => {
    try {
      const res = await fetch("/api/admin/audit-log");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.data) {
          setLogs(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to refresh audit log:", err);
    }
  };

  const handleExecuteReset = async () => {
    setResetting(true);
    setResetSuccess(null);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodName: periodName.trim() || undefined }),
      });

      const result = await res.json();
      if (res.ok && result.ok) {
        setResetSuccess(result.message);
        setResetModalOpen(false);
        setPeriodName("");
        handleRefresh();
      } else {
        alert(result.error || "Failed to execute period reset.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  const formatActionBadge = (type: string) => {
    switch (type) {
      case "cashier_payment_confirm":
        return <span className="action-tag action-tag--cashier">Cashier Confirm</span>;
      case "seed_lab_release":
        return <span className="action-tag action-tag--seedlab">Seed Lab Release</span>;
      case "inventory_addition":
        return <span className="action-tag action-tag--addition">Inventory Addition</span>;
      case "inventory_edit":
      case "manual_edit":
      case "manual_adjustment":
        return <span className="action-tag action-tag--edit">Inventory Edit</span>;
      case "data_reset":
        return <span className="action-tag action-tag--reset">Data Reset Archive</span>;
      default:
        return <span className="action-tag">{type.replace("_", " ").toUpperCase()}</span>;
    }
  };

  return (
    <div className="audit-view">
      <header className="audit-header">
        <div>
          <h1 className="audit-title">Unified System Audit Trail</h1>
          <p className="audit-subtitle">
            Immutable, append-only activity log recording all staff transaction confirmations, seed lab item releases, stock additions, and period resets.
          </p>
        </div>

        {isMasterAdmin && (
          <button
            type="button"
            className="action-btn action-btn--danger"
            onClick={() => setResetModalOpen(true)}
          >
            <Database size={16} aria-hidden="true" />
            <span>Master Data Reset ("Clean Slate")</span>
          </button>
        )}
      </header>

      {resetSuccess && (
        <div className="reset-success-banner">
          <UserCheck size={18} />
          <span>{resetSuccess}</span>
        </div>
      )}

      {/* Controls */}
      <div className="audit-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by staff name, action, or note details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="filter-pills">
          {[
            { id: "all", label: "All Actions" },
            { id: "cashier_payment_confirm", label: "Cashier Confirmations" },
            { id: "seed_lab_release", label: "Seed Lab Releases" },
            { id: "inventory_addition", label: "Inventory Additions" },
            { id: "data_reset", label: "Data Resets" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className="filter-pill"
              data-active={actionFilter === id}
              onClick={() => setActionFilter(id)}
            >
              {label}
            </button>
          ))}

          <button type="button" onClick={handleRefresh} className="icon-btn" title="Refresh Audit Log">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Staff / Actor</th>
              <th>Designation</th>
              <th>Action Type</th>
              <th>Log Summary / Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">
                  <div className="audit-empty">
                    <History size={40} className="audit-empty__icon" aria-hidden="true" />
                    <span className="audit-empty__title">No audit log entries recorded</span>
                    <span className="audit-empty__desc">Staff transactions and inventory edits will automatically appear here.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className="time-val">{new Date(log.created_at).toLocaleString("en-PH")}</span>
                  </td>
                  <td>
                    <div className="actor-cell">
                      <strong className="actor-name">{log.actor_name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="designation-val">{log.actor_designation || "Staff Administrator"}</span>
                  </td>
                  <td>{formatActionBadge(log.action_type)}</td>
                  <td>
                    <span className="notes-val">{log.notes || `Target ${log.target_table} #${log.record_id}`}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MASTER ADMIN DATA RESET MODAL */}
      {resetModalOpen && (
        <div className="modal-overlay" onClick={() => setResetModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header modal-header--danger">
              <ShieldAlert size={24} color="#dc2626" />
              <h2 className="modal-title">Master Admin Period Reset ("Clean Slate")</h2>
            </div>
            <p className="modal-body">
              This action will <strong>snapshot and archive all current working sales, active orders, and project billings</strong> into historical backup records, then clear working tables for a clean reporting slate.
            </p>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Period Archive Name (Optional)</label>
              <input
                type="text"
                placeholder={`e.g. Period Ending ${new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" })}`}
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setResetModalOpen(false)}
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleExecuteReset}
                disabled={resetting}
              >
                {resetting ? "Archiving & Resetting..." : "Archive & Clear Slate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .audit-view { display: flex; flex-direction: column; gap: var(--space-6); max-width: 1100px; }
        .audit-header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); }
        .audit-title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-primary-dark); margin: 0 0 var(--space-1); }
        .audit-subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .reset-success-banner { background-color: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; display: flex; align-items: center; gap: var(--space-2); }

        .audit-controls { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
        .search-box { position: relative; flex: 1; max-width: 420px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-ink-3); }
        .form-input { padding: var(--space-3) var(--space-3) var(--space-3) 38px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); width: 100%; }

        .filter-pills { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
        .filter-pill { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-paper); font-size: var(--text-xs); font-weight: 500; cursor: pointer; color: var(--color-ink-2); transition: all 140ms ease; }
        .filter-pill[data-active="true"] { background-color: var(--color-primary); color: var(--color-primary-fg); border-color: var(--color-primary); font-weight: 600; }

        .time-val { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-2); }
        .actor-cell { display: flex; flex-direction: column; }
        .actor-name { font-size: var(--text-xs); color: var(--color-heading); }
        .designation-val { font-size: 0.7rem; color: var(--color-ink-3); }
        .notes-val { font-size: var(--text-xs); color: var(--color-heading); }

        .action-tag { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); text-transform: uppercase; letter-spacing: 0.05em; background-color: var(--color-paper-3); color: var(--color-ink-2); display: inline-block; }
        .action-tag--cashier { background-color: #dbeafe; color: #1e40af; }
        .action-tag--seedlab { background-color: #fef3c7; color: #92400e; }
        .action-tag--addition { background-color: #dcfce7; color: #166534; }
        .action-tag--edit { background-color: #f3e8ff; color: #6b21a8; }
        .action-tag--reset { background-color: #fee2e2; color: #991b1b; }

        .audit-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-12); gap: var(--space-2); }
        .audit-empty__icon { color: var(--color-ink-3); }
        .audit-empty__title { font-size: var(--text-base); font-weight: 700; color: var(--color-heading); }
        .audit-empty__desc { font-size: var(--text-xs); color: var(--color-ink-2); }

        .action-btn--danger { background-color: #dc2626; color: #fff; border: none; border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); font-size: var(--text-xs); font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .action-btn--danger:hover { background-color: #b91c1c; }

        .modal-overlay { position: fixed; inset: 0; background-color: oklch(0% 0 0 / 0.5); z-index: 999; display: flex; align-items: center; justify-content: center; padding: var(--space-4); }
        .modal-card { background-color: var(--color-paper); border-radius: var(--radius-xl); padding: var(--space-6); max-width: 480px; width: 100%; box-shadow: 0 20px 40px oklch(0% 0 0 / 0.3); display: flex; flex-direction: column; gap: var(--space-4); }
        .modal-header { display: flex; align-items: center; gap: var(--space-3); }
        .modal-title { font-family: var(--font-display); font-size: var(--text-lg); color: #991b1b; margin: 0; }
        .modal-body { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; line-height: 1.5; }
        .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-2); }
        .btn { padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); font-size: var(--text-xs); font-weight: 600; cursor: pointer; border: none; }
        .btn--secondary { background-color: var(--color-paper-3); color: var(--color-ink); }
        .btn--danger { background-color: #dc2626; color: #fff; }
      `}</style>
    </div>
  );
}
