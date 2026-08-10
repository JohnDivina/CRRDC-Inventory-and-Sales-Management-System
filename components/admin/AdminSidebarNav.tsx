"use client";

// components/admin/AdminSidebarNav.tsx — Client component for active navigation tab styling
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PackageCheck,
  Briefcase,
  Package,
  Users,
  QrCode,
  Globe
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Cashier Orders", Icon: Receipt },
  { href: "/admin/releases", label: "Seed Lab Releases", Icon: PackageCheck },
  { href: "/admin/project-billings", label: "Project Billings", Icon: Briefcase },
  { href: "/admin/inventory", label: "Inventory & Audit", Icon: Package },
  { href: "/admin/accounts", label: "Staff Accounts", Icon: Users },
  { href: "/admin/scanner", label: "QR Scanner (Legacy)", Icon: QrCode },
];


interface AdminSidebarNavProps {
  isMasterAdmin?: boolean;
}

export default function AdminSidebarNav({ isMasterAdmin = false }: AdminSidebarNavProps) {
  const pathname = usePathname();

  const navItems = NAV_ITEMS.filter((item) => {
    if (item.href === "/admin/accounts") {
      return isMasterAdmin;
    }
    return true;
  });

  return (
    <nav className="sidebar-nav">
      <ul className="sidebar-nav__list" role="list">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));

          return (
            <li key={href}>
              <Link
                href={href}
                className="sidebar-nav__link"
                data-active={isActive}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-nav__divider" aria-hidden="true" />

      <div className="sidebar-nav__public-link">
        <Link href="/" target="_blank" className="sidebar-nav__link">
          <Globe size={18} aria-hidden="true" />
          <span>View Public Store</span>
        </Link>
      </div>

      <style>{`
        .sidebar-nav {
          padding: var(--space-4);
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .sidebar-nav__list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .sidebar-nav__link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 500;
          color: oklch(from var(--color-primary-fg) l c h / 0.8);
          text-decoration: none;
          transition: background-color var(--dur-fast) var(--ease-out),
                      color var(--dur-fast) var(--ease-out);
        }
        .sidebar-nav__link:hover {
          background-color: oklch(from var(--color-primary-fg) l c h / 0.08);
          color: var(--color-primary-fg);
        }
        .sidebar-nav__link[data-active="true"] {
          background-color: oklch(from var(--color-primary-fg) l c h / 0.15);
          color: var(--color-accent);
          font-weight: 600;
        }
        .sidebar-nav__divider {
          height: 1px;
          background-color: oklch(from var(--color-primary-dark) calc(l - 0.08) c h);
          margin-block: var(--space-4);
        }
        .sidebar-nav__public-link {
          margin-top: auto;
        }
      `}</style>
    </nav>
  );
}
