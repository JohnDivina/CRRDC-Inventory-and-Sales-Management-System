"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

interface AdminShellClientProps {
  adminEmail: string;
  isMasterAdmin?: boolean;
  children: React.ReactNode;
}

export default function AdminShellClient({
  adminEmail,
  isMasterAdmin = false,
  children,
}: AdminShellClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMaster =
    isMasterAdmin ||
    adminEmail.toLowerCase().includes("johnrey_divina") ||
    adminEmail.toLowerCase().includes("johnreydivina") ||
    adminEmail.toLowerCase() === "johnrey_divina@clsu.edu.ph";

  return (
    <div className="admin-shell">
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

        <div className="admin-sidebar__nav-wrapper" onClick={() => setSidebarOpen(false)}>
          <AdminSidebarNav isMasterAdmin={isMaster} />
        </div>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user-info">
            <span className="admin-sidebar__user">{adminEmail}</span>
            <span className="admin-sidebar__role">{isMaster ? "Master Administrator" : "Staff Administrator"}</span>
          </div>

          <form action="/api/auth/signout" method="post">
            <button type="submit" className="admin-sidebar__signout">
              Sign out
            </button>
          </form>
        </div>
      </aside>


      <main className="admin-main page-enter" id="admin-main">
        {children}
      </main>
    </div>
  );
}

