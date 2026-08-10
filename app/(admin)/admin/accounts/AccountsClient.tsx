"use client";

// app/(admin)/admin/accounts/AccountsClient.tsx — Master Admin Accounts & Approvals UI
import { useState, useEffect } from "react";
import type { AdminProfile, AdminRole, AdminStatus } from "@/types";
import { Users, CheckCircle, ShieldAlert, UserCheck, Shield, Building2, UserX } from "lucide-react";

export default function AccountsClient() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts");
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || "Failed to load accounts.");
      setProfiles(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleUpdateStatus = async (
    profileId: string,
    status: AdminStatus,
    role?: AdminRole
  ) => {
    try {
      setActionSuccess(null);
      setError(null);

      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, status, role }),
      });

      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || "Action failed.");

      setActionSuccess(`Account successfully updated to ${status.toUpperCase()}.`);
      fetchAccounts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const pendingProfiles = profiles.filter((p) => p.status === "pending");
  const activeProfiles = profiles.filter((p) => p.status === "active");
  const suspendedProfiles = profiles.filter((p) => p.status === "suspended");

  return (
    <div className="accounts-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Staff Account Approvals &amp; Roles</h1>
          <p className="page-subtitle">
            Authorize <code>@clsu.edu.ph</code> staff accounts, assign operational roles, and manage center permissions.
          </p>
        </div>
      </header>

      {actionSuccess && (
        <div className="alert alert--success">
          <CheckCircle size={18} aria-hidden="true" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert--error">
          <ShieldAlert size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Pending Account Requests Section */}
      <section className="section-block">
        <div className="section-header">
          <h2 className="section-title">
            Pending Account Requests
            {pendingProfiles.length > 0 && (
              <span className="badge badge--warning">{pendingProfiles.length} Pending</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="loading-state">Loading accounts...</div>
        ) : pendingProfiles.length === 0 ? (
          <div className="empty-state">No pending account requests at this time.</div>
        ) : (
          <div className="cards-grid">
            {pendingProfiles.map((profile) => (
              <div key={profile.id} className="account-card card--pending">
                <div className="card-top">
                  <div>
                    <h3 className="staff-name">{profile.full_name}</h3>
                    <span className="staff-email">{profile.email}</span>
                  </div>
                  <span className="status-pill status--pending">PENDING</span>
                </div>

                <div className="card-meta">
                  <span>Registered: {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>

                <div className="action-row">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(profile.id, "active", "admin")}
                    className="btn btn--approve"
                  >
                    <UserCheck size={16} aria-hidden="true" />
                    <span>Approve as General Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(profile.id, "active", "cashier")}
                    className="btn btn--secondary"
                  >
                    Approve as Cashier
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(profile.id, "active", "seed_lab")}
                    className="btn btn--secondary"
                  >
                    Approve as Seed Lab
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(profile.id, "suspended")}
                    className="btn btn--danger"
                  >
                    <UserX size={16} aria-hidden="true" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Staff Roster Section */}
      <section className="section-block">
        <div className="section-header">
          <h2 className="section-title">Active Staff Accounts ({activeProfiles.length})</h2>
        </div>

        <div className="table-wrapper">
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Staff Name / Email</th>
                <th>Assigned Role</th>
                <th>Office / Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeProfiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">No active staff profiles recorded.</td>
                </tr>
              ) : (
                activeProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <div className="user-cell">
                        <strong className="name">{profile.full_name}</strong>
                        <span className="email">{profile.email}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        value={profile.role}
                        onChange={(e) => handleUpdateStatus(profile.id, "active", e.target.value as AdminRole)}
                        className="role-select"
                      >
                        <option value="master_admin">Master Admin</option>
                        <option value="cashier">Cashier Staff</option>
                        <option value="seed_lab">Seed Lab Staff</option>
                        <option value="admin">General Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className="sub-text">{profile.office || "CRRDC Main Office"}</span>
                    </td>
                    <td>
                      <span className="status-pill status--active">ACTIVE</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(profile.id, "suspended")}
                        className="btn-link text--danger"
                      >
                        Suspend Access
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .accounts-page { display: flex; flex-direction: column; gap: var(--space-8); max-width: 1080px; }
        .page-title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-heading); margin: 0 0 var(--space-1); }
        .page-subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .alert { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); border-radius: var(--radius-lg); font-size: var(--text-sm); font-weight: 500; }
        .alert--success { background-color: oklch(from var(--color-success) l c h / 0.12); color: var(--color-primary); border: 1px solid var(--color-primary); }
        .alert--error { background-color: oklch(from var(--color-error) l c h / 0.1); color: var(--color-error); border: 1px solid var(--color-error); }

        .section-block { display: flex; flex-direction: column; gap: var(--space-4); }
        .section-title { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-heading); display: flex; align-items: center; gap: var(--space-3); margin: 0; }
        .badge { font-size: var(--text-xs); font-weight: 700; padding: 2px 10px; border-radius: var(--radius-full); }
        .badge--warning { background-color: oklch(from var(--color-warning) l c h / 0.18); color: var(--color-warning); }

        .cards-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-4); }
        .account-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
        .card--pending { border-left: 4px solid var(--color-warning); }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .staff-name { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-heading); margin: 0 0 2px; }
        .staff-email { font-size: var(--text-xs); color: var(--color-ink-2); font-family: var(--font-mono); }

        .status-pill { font-size: 0.65rem; font-weight: 800; padding: 3px 8px; border-radius: var(--radius-full); text-transform: uppercase; }
        .status--pending { background-color: oklch(from var(--color-warning) l c h / 0.15); color: var(--color-warning); }
        .status--active { background-color: oklch(from var(--color-success) l c h / 0.15); color: var(--color-primary); }

        .card-meta { font-size: var(--text-xs); color: var(--color-ink-3); }
        .action-row { display: flex; flex-wrap: wrap; gap: var(--space-2); }

        .btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-xs); cursor: pointer; border: none; }
        .btn--approve { background-color: var(--color-primary); color: var(--color-primary-fg); }
        .btn--secondary { background-color: var(--color-paper-2); border: 1px solid var(--color-border); color: var(--color-ink); }
        .btn--danger { background-color: oklch(from var(--color-error) l c h / 0.1); color: var(--color-error); border: 1px solid var(--color-error); }

        .table-wrapper { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
        .accounts-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--text-sm); }
        .accounts-table th { background-color: var(--color-paper-2); padding: var(--space-4); font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-2); border-bottom: 1px solid var(--color-border); }
        .accounts-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .user-cell { display: flex; flex-direction: column; }
        .role-select { padding: 4px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-xs); background: var(--color-paper); }
        .btn-link { background: none; border: none; cursor: pointer; font-size: var(--text-xs); font-weight: 600; text-decoration: underline; }
        .text--danger { color: var(--color-error); }
        .loading-state, .empty-state, .empty-cell { padding: var(--space-8); text-align: center; color: var(--color-ink-3); font-size: var(--text-sm); }
      `}</style>
    </div>
  );
}
