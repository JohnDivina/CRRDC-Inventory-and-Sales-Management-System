"use client";

// components/catalog/CategoryFilter.tsx — Category filter tabs (spaced out, accessible)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/layout/LanguageContext";

export default function CategoryFilter() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const CATEGORIES = [
    { href: "/catalog", label: t("allProducts"), key: "all" },
    { href: "/catalog/seed", label: t("seeds"), key: "seed" },
    { href: "/catalog/rice", label: t("rice"), key: "rice" },
    { href: "/catalog/other", label: t("otherProducts"), key: "other" },
  ];

  return (
    <nav className="category-filter" aria-label="Product categories">
      <ul className="category-filter__list" role="list">
        {CATEGORIES.map(({ href, label, key }) => {
          const isActive = pathname === href;
          return (
            <li key={key}>
              <Link
                href={href}
                className="category-filter__tab"
                data-active={isActive}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <style>{`
        .category-filter {
          margin-bottom: var(--space-8);
        }
        .category-filter__list {
          display: flex;
          gap: var(--space-4);
          list-style: none;
          padding: var(--space-3) var(--space-2);
          margin: calc(-1 * var(--space-3)) calc(-1 * var(--space-2)) 0;
          overflow-x: auto;
          scrollbar-width: thin;
        }
        .category-filter__tab {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-3) var(--space-6);
          min-height: 44px;
          font-size: var(--text-sm);
          font-weight: 600;
          letter-spacing: 0.02em;
          word-spacing: normal;
          color: var(--color-ink-2);
          text-decoration: none;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border-strong);
          background-color: var(--color-paper);
          white-space: nowrap;
          transition: transform 140ms cubic-bezier(0.2, 0.7, 0.3, 1),
                      box-shadow 140ms cubic-bezier(0.2, 0.7, 0.3, 1),
                      border-color 160ms ease,
                      background-color 160ms ease,
                      color 160ms ease;
        }
        .category-filter__tab:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background-color: var(--color-paper-2);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px oklch(0% 0 0 / 0.12);
        }
        .category-filter__tab:active {
          transform: translateY(1px);
          box-shadow: 0 2px 6px oklch(0% 0 0 / 0.08);
          transition-duration: 70ms;
        }
        .category-filter__tab[data-active="true"] {
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          border-color: var(--color-primary);
          font-weight: 600;
          box-shadow: 0 4px 14px oklch(0% 0 0 / 0.15);
        }
      `}</style>
    </nav>
  );
}
