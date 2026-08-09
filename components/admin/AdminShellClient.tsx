"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

interface AdminShellClientProps {
  adminEmail: string;
  children: React.ReactNode;
}

export default function AdminShellClient({
  adminEmail,
  children,
}: AdminShellClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell page-enter">
      {/* Mobile top bar with hamburger button */}
      <div className="admin-mobile-header">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="admin-mobile-title">CRRDC Admin</span>
      </div>

      {/* Dim overlay on mobile */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className="admin-sidebar"
        data-open={sidebarOpen}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar__header">
          <Link href="/" className="admin-sidebar__brand" onClick={() => setSidebarOpen(false)}>
            <div className="admin-sidebar__logo-row">
              <img
                src="/images/crrdc-logo.png"
                alt="CRRDC Logo"
                className="admin-sidebar__logo-img"
              />
              <span className="admin-sidebar__logo-text">
                <span className="admin-sidebar__logo-clsu">CLSU</span>
                <span className="admin-sidebar__logo-dot">·</span>
                <span className="admin-sidebar__logo-crrdc">CRRDC</span>
              </span>
            </div>
            <span className="admin-sidebar__sub">Research Innovation &amp; Extension</span>
          </Link>
        </div>

        <div onClick={() => setSidebarOpen(false)}>
          <AdminSidebarNav />
        </div>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user-info">
            <span className="admin-sidebar__user">{adminEmail}</span>
            <span className="admin-sidebar__role">Administrator</span>
          </div>

          <form action="/api/auth/signout" method="post">
            <button type="submit" className="admin-sidebar__signout">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main" id="admin-main">
        {children}
      </main>

      <style>{`
        .admin-shell {
          display: flex;
          min-height: 100svh;
          background-color: var(--color-paper-2);
          position: relative;
        }

        .admin-mobile-header {
          display: none;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-3) var(--gutter);
          background-color: var(--color-primary-dark);
          color: var(--color-primary-fg);
          position: sticky;
          top: 0;
          z-index: 90;
        }
        .admin-mobile-toggle {
          background: transparent;
          border: none;
          color: var(--color-primary-fg);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .admin-mobile-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: var(--text-lg);
          color: var(--color-accent);
        }

        .admin-sidebar-overlay {
          display: none;
        }

        .admin-sidebar {
          width: 260px;
          flex-shrink: 0;
          background-color: var(--color-primary-dark);
          display: flex;
          flex-direction: column;
          border-right: 1px solid oklch(from var(--color-primary-dark) calc(l - 0.08) c h);
          transition: transform var(--dur-slow) var(--ease-out);
          z-index: 100;
        }
        .admin-sidebar__header {
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid oklch(from var(--color-primary-dark) calc(l - 0.08) c h);
        }
        .admin-sidebar__brand {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .admin-sidebar__logo-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .admin-sidebar__logo-img {
          height: 28px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 1px 3px oklch(0% 0 0 / 0.3));
        }
        .admin-sidebar__logo-text {
          display: flex;
          align-items: baseline;
          gap: 3px;
          font-family: var(--font-body);
        }
        .admin-sidebar__logo-clsu {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--color-accent);
        }
        .admin-sidebar__logo-dot {
          color: var(--color-primary-fg);
          opacity: 0.5;
          font-size: var(--text-xs);
        }
        .admin-sidebar__logo-crrdc {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--color-primary-fg);
        }
        .admin-sidebar__sub {
          display: block;
          font-size: 0.7rem;
          color: oklch(from var(--color-primary-fg) l c h / 0.65);
          letter-spacing: 0.01em;
        }

        .admin-sidebar__footer {
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid oklch(from var(--color-primary-dark) calc(l - 0.08) c h);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-top: auto;
        }
        .admin-sidebar__user-info {
          display: flex;
          flex-direction: column;
        }
        .admin-sidebar__user {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-primary-fg);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .admin-sidebar__role {
          font-size: 0.65rem;
          color: var(--color-accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-sidebar__signout {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: 1px solid oklch(from var(--color-primary-fg) l c h / 0.2);
          border-radius: var(--radius-sm);
          background: transparent;
          color: oklch(from var(--color-primary-fg) l c h / 0.8);
          font-size: var(--text-xs);
          font-weight: 500;
          cursor: pointer;
          transition: background-color var(--dur-fast) var(--ease-out);
        }
        .admin-sidebar__signout:hover {
          background-color: oklch(from var(--color-primary-fg) l c h / 0.1);
          color: var(--color-primary-fg);
        }

        .admin-main {
          flex: 1;
          overflow: auto;
          padding: var(--space-8);
          min-width: 0;
        }

        @media (max-width: 768px) {
          .admin-shell {
            flex-direction: column;
          }
          .admin-mobile-header {
            display: flex;
          }
          .admin-sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background-color: oklch(0% 0 0 / 0.5);
            z-index: 95;
          }
          .admin-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            width: 280px;
            transform: translateX(-100%);
          }
          .admin-sidebar[data-open="true"] {
            transform: translateX(0);
          }
          .admin-main {
            padding: var(--space-4);
          }
        }
      `}</style>
    </div>
  );
}
