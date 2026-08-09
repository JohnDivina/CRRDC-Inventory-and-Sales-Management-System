"use client";

// components/layout/Masthead.tsx — N6 Masthead nav (Hallmark nav archetype)
// N6: wide institutional horizontal bar, wordmark left, links center, cart hover preview + Admin Login right
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Menu, X, UserCheck, LogIn, ArrowRight, Trash2, Sprout, Landmark } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPHP, breakdownRiceQty } from "@/types";
import { useLanguage } from "./LanguageContext";

export default function Masthead() {
  const pathname = usePathname();
  const { items, totalItems, totalPHP, removeItem } = useCart();
  const { t } = useLanguage();

  const NAV_LINKS = [
    { href: "/", label: t("home") },
    { href: "/catalog", label: t("catalog") },
  ] as const;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setCartOpen(false);
  }, [pathname]);

  const handleMouseEnterCart = () => {
    if (cartTimerRef.current) clearTimeout(cartTimerRef.current);
    setCartOpen(true);
  };

  const handleMouseLeaveCart = () => {
    cartTimerRef.current = setTimeout(() => {
      setCartOpen(false);
    }, 200);
  };

  const isAdminPath = pathname.startsWith("/admin");

  return (
    <>
      <header
        className="masthead"
        data-scrolled={scrolled}
        aria-label="Site header"
      >
        <div className="masthead__inner">
          {/* Wordmark & Official Logos — left */}
          <Link href="/" className="masthead__wordmark" aria-label="CRRDC home">
            <div className="masthead__brand-row">
              <img
                src="/images/crrdc-logo.png"
                alt="CRRDC Logo"
                className="masthead__logo-img"
              />
              <span className="masthead__logo-block" aria-hidden="true">
                <span className="masthead__logo-clsu">CLSU</span>
                <span className="masthead__logo-dot">·</span>
                <span className="masthead__logo-crrdc">CRRDC</span>
              </span>
            </div>
            <span className="masthead__tagline">{t("tagline")}</span>
          </Link>

          {/* Navigation — center (Home, Products) */}
          <nav className="masthead__nav" aria-label="Main navigation">
            <ul className="masthead__nav-list" role="list">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className="masthead__nav-link"
                      aria-current={isActive ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right actions */}
          <div className="masthead__actions">
            {/* Cart Icon & Hover Dropdown Preview */}
            <div
              className="masthead__cart-wrapper"
              onMouseEnter={handleMouseEnterCart}
              onMouseLeave={handleMouseLeaveCart}
            >
              <Link
                href="/cart"
                className="masthead__cart-btn"
                aria-label={`Shopping cart — ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
              >
                <ShoppingCart size={20} aria-hidden="true" />
                {totalItems > 0 && (
                  <span className="masthead__cart-badge" aria-hidden="true">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Hover Dropdown Popover */}
              <div
                className="cart-popover"
                data-open={cartOpen}
                aria-hidden={!cartOpen}
              >
                <div className="cart-popover__header">
                  <span className="cart-popover__title">Shopping Cart</span>
                  <span className="cart-popover__count">{totalItems} {totalItems === 1 ? "item" : "items"}</span>
                </div>

                {items.length === 0 ? (
                  <div className="cart-popover__empty">
                    <p>Your cart is empty</p>
                    <Link href="/catalog" className="cart-popover__browse-link">
                      Browse products
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="cart-popover__items">
                      {items.map(({ product, quantity }) => {
                        const isRiceKg = product.unit_type === "kg";
                        const riceBreakdown = isRiceKg ? breakdownRiceQty(quantity) : null;
                        return (
                          <div key={product.id} className="cart-popover__item">
                            <div className="cart-popover__item-info">
                              <span className="cart-popover__item-name">{product.name}</span>
                              <span className="cart-popover__item-meta">
                                Qty: {quantity} {isRiceKg ? "kg" : "unit(s)"}
                                {isRiceKg && riceBreakdown && riceBreakdown.sacks > 0
                                  ? ` (${riceBreakdown.sacks} sack${riceBreakdown.sacks > 1 ? "s" : ""})`
                                  : ""}
                              </span>
                            </div>

                            <div className="cart-popover__item-right">
                              <span className="cart-popover__item-price">
                                {formatPHP(product.price_php * quantity)}
                              </span>
                              <button
                                type="button"
                                className="cart-popover__remove"
                                onClick={() => removeItem(product.id)}
                                title="Remove item"
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="cart-popover__footer">
                      <div className="cart-popover__subtotal">
                        <span>Subtotal:</span>
                        <span className="cart-popover__total-val">{formatPHP(totalPHP)}</span>
                      </div>

                      <div className="cart-popover__actions">
                        <Link href="/cart" className="cart-popover__btn cart-popover__btn--secondary">
                          View Cart
                        </Link>
                        <Link href="/checkout" className="cart-popover__btn cart-popover__btn--primary">
                          Checkout <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Admin Login / Dashboard Button */}
            {isAdminPath ? (
              <Link href="/admin/dashboard" className="masthead__admin-btn">
                <UserCheck size={16} aria-hidden="true" />
                <span>Admin Dashboard</span>
              </Link>
            ) : (
              <Link href="/admin/login" className="masthead__admin-btn">
                <LogIn size={16} aria-hidden="true" />
                <span>Admin Login</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="masthead__menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <nav
        id="mobile-nav"
        className="masthead__mobile-nav"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
        data-open={menuOpen}
      >
        <ul className="masthead__mobile-list" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="masthead__mobile-link"
                aria-current={pathname === href ? "page" : undefined}
                tabIndex={menuOpen ? 0 : -1}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/cart"
              className="masthead__mobile-link"
              tabIndex={menuOpen ? 0 : -1}
            >
              <ShoppingCart size={18} aria-hidden="true" />
              <span>{t("cart")} ({totalItems})</span>
            </Link>
          </li>
          <li>
            {isAdminPath ? (
              <Link
                href="/admin/dashboard"
                className="masthead__mobile-link masthead__mobile-link--admin"
                tabIndex={menuOpen ? 0 : -1}
              >
                <UserCheck size={18} aria-hidden="true" />
                <span>{t("adminDashboard")}</span>
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="masthead__mobile-link masthead__mobile-link--admin"
                tabIndex={menuOpen ? 0 : -1}
              >
                <LogIn size={18} aria-hidden="true" />
                <span>{t("adminLogin")}</span>
              </Link>
            )}
          </li>
        </ul>
      </nav>

      <style>{`
        .masthead {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 500;
          display: flex;
          justify-content: center;
          height: 4.5rem;
          pointer-events: none;
        }
        .masthead__inner {
          pointer-events: auto;
          width: 100%;
          max-width: 100%;
          height: 4.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-6);
          padding-inline: var(--gutter);
          background-color: var(--color-primary-dark);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          border: 1px solid transparent;
          border-bottom-color: oklch(from var(--color-primary-dark) calc(l - 0.1) c h);
          border-radius: 0;
          box-shadow: 0 0 0 0 transparent;
          transform: translateY(0);
          will-change: transform, max-width, border-radius;
          transition: max-width 420ms cubic-bezier(0.16, 1, 0.3, 1),
                      border-radius 420ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 420ms cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 420ms cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 420ms cubic-bezier(0.16, 1, 0.3, 1),
                      padding 420ms cubic-bezier(0.16, 1, 0.3, 1),
                      background-color 420ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .masthead[data-scrolled="true"] .masthead__inner,
        .masthead.is-floating .masthead__inner {
          max-width: min(72rem, calc(100% - 1.5rem));
          transform: translateY(0.7rem);
          border-color: oklch(from var(--color-primary-fg) l c h / 0.25);
          border-radius: 9999px;
          box-shadow: 0 12px 35px oklch(0% 0 0 / 0.35);
          padding-inline: 1.5rem;
          background-color: oklch(from var(--color-primary-dark) l c h / 0.92);
        }
        .masthead__wordmark {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-decoration: none;
          flex-shrink: 0;
          line-height: 1;
        }
        .masthead__brand-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .masthead__logo-img {
          height: 36px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 2px 4px oklch(0% 0 0 / 0.2));
        }
        .masthead__logo-block {
          display: flex;
          align-items: baseline;
          gap: 0.35em;
          font-family: var(--font-body);
        }
        .masthead__logo-clsu {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--color-accent);
          letter-spacing: 0.05em;
        }
        .masthead__logo-dot {
          color: var(--color-primary-fg);
          opacity: 0.5;
          font-size: var(--text-sm);
        }
        .masthead__logo-crrdc {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--color-primary-fg);
          letter-spacing: 0.03em;
        }
        .masthead__tagline {
          font-size: var(--text-xs);
          color: oklch(from var(--color-primary-fg) l c h / 0.65);
          font-family: var(--font-body);
          letter-spacing: 0.02em;
        }

        /* Nav */
        .masthead__nav {
          display: flex;
          justify-content: center;
        }
        .masthead__nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: var(--space-2);
        }
        .masthead__nav-link {
          display: block;
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-sm);
          font-weight: 500;
          color: oklch(from var(--color-primary-fg) l c h / 0.85);
          text-decoration: none;
          border-radius: var(--radius-md);
          transition: color var(--dur-fast) var(--ease-out),
                      background-color var(--dur-fast) var(--ease-out);
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .masthead__nav-link:hover {
          color: var(--color-primary-fg);
          background-color: oklch(from var(--color-primary-fg) l c h / 0.1);
        }
        .masthead__nav-link[aria-current="page"] {
          color: var(--color-accent);
          background-color: oklch(from var(--color-primary-fg) l c h / 0.08);
          font-weight: 600;
        }

        /* Actions */
        .masthead__actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-shrink: 0;
        }

        /* Cart Dropdown Wrapper */
        .masthead__cart-wrapper {
          position: relative;
        }
        .masthead__cart-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.6rem;
          height: 2.6rem;
          border-radius: var(--radius-md);
          color: oklch(from var(--color-primary-fg) l c h / 0.9);
          text-decoration: none;
          transition: color var(--dur-fast) var(--ease-out),
                      background-color var(--dur-fast) var(--ease-out);
        }
        .masthead__cart-btn:hover {
          color: var(--color-primary-fg);
          background-color: oklch(from var(--color-primary-fg) l c h / 0.12);
        }
        .masthead__cart-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 1.2rem;
          height: 1.2rem;
          padding-inline: 0.25rem;
          border-radius: var(--radius-full);
          background-color: var(--color-accent);
          color: var(--color-accent-fg);
          font-size: 0.65rem;
          font-weight: 700;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        /* Hover Popover */
        .cart-popover {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: 0 10px 30px oklch(0% 0 0 / 0.2);
          padding: var(--space-4);
          z-index: 120;
          opacity: 0;
          transform: translateY(-8px);
          pointer-events: none;
          transition: opacity var(--dur-fast) var(--ease-out),
                      transform var(--dur-fast) var(--ease-out);
        }
        .cart-popover[data-open="true"] {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .cart-popover__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--color-border);
          margin-bottom: var(--space-3);
        }
        .cart-popover__title {
          font-family: var(--font-display);
          font-size: var(--text-base);
          color: var(--color-heading);
        }
        .cart-popover__count {
          font-size: var(--text-xs);
          color: var(--color-ink-3);
        }

        .cart-popover__empty {
          text-align: center;
          padding-block: var(--space-6);
        }
        .cart-popover__empty p {
          font-size: var(--text-sm);
          color: var(--color-ink-2);
          margin: 0 0 var(--space-2);
        }
        .cart-popover__browse-link {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-primary);
          text-decoration: none;
        }

        .cart-popover__items {
          max-height: 220px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
          padding-right: 2px;
        }
        .cart-popover__item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-2);
          padding-bottom: var(--space-2);
          border-bottom: 1px dashed var(--color-border);
        }
        .cart-popover__item:last-child { border-bottom: none; }
        .cart-popover__item-name {
          font-weight: 600;
          font-size: var(--text-xs);
          color: var(--color-ink);
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }
        .cart-popover__item-meta {
          font-size: 0.7rem;
          color: var(--color-ink-3);
        }
        .cart-popover__item-right {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .cart-popover__item-price {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-primary);
        }
        .cart-popover__remove {
          background: none;
          border: none;
          color: var(--color-ink-3);
          cursor: pointer;
          padding: 2px;
        }
        .cart-popover__remove:hover { color: var(--color-error); }

        .cart-popover__footer {
          border-top: 1px solid var(--color-border);
          padding-top: var(--space-3);
        }
        .cart-popover__subtotal {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-ink-2);
          margin-bottom: var(--space-3);
        }
        .cart-popover__total-val {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-primary);
        }

        .cart-popover__actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2);
        }
        .cart-popover__btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: 600;
          text-decoration: none;
        }
        .cart-popover__btn--secondary {
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          color: var(--color-ink);
        }
        .cart-popover__btn--primary {
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
        }

        .masthead__admin-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-5);
          border: 1px solid oklch(from var(--color-primary-fg) l c h / 0.25);
          border-radius: var(--radius-md);
          background-color: oklch(from var(--color-primary-fg) l c h / 0.06);
          color: var(--color-primary-fg);
          font-size: var(--text-xs);
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.02em;
          white-space: nowrap;
          transition: background-color var(--dur-fast) var(--ease-out),
                      border-color var(--dur-fast) var(--ease-out);
        }
        .masthead__admin-btn:hover {
          background-color: var(--color-accent);
          color: var(--color-accent-fg);
          border-color: var(--color-accent);
        }

        .masthead__menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 2.6rem;
          height: 2.6rem;
          border: none;
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--color-primary-fg);
          cursor: pointer;
        }

        .masthead__mobile-nav {
          display: none;
          position: fixed;
          top: 4.5rem;
          inset-inline: 0;
          background-color: var(--color-primary-dark);
          border-bottom: 1px solid oklch(from var(--color-primary-dark) calc(l - 0.1) c h);
          z-index: 99;
          transform: translateY(-100%);
          opacity: 0;
          transition: transform var(--dur-slow) var(--ease-out), opacity var(--dur-slow) var(--ease-out);
          pointer-events: none;
        }
        .masthead__mobile-nav[data-open="true"] {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        .masthead__mobile-list {
          list-style: none;
          margin: 0;
          padding: var(--space-4) var(--gutter);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .masthead__mobile-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-5);
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: 500;
          color: oklch(from var(--color-primary-fg) l c h / 0.9);
          text-decoration: none;
        }
        .masthead__mobile-link--admin {
          color: var(--color-accent);
          font-weight: 600;
          background-color: oklch(from var(--color-primary-fg) l c h / 0.08);
          margin-top: var(--space-2);
        }

        .masthead__mobile-lang-item {
          padding-top: var(--space-2);
          margin-top: var(--space-2);
          border-top: 1px dashed oklch(from var(--color-primary-fg) l c h / 0.15);
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        @media (max-width: 900px) {
          .masthead__nav { display: none; }
          .masthead__menu-toggle { display: flex; }
          .masthead__mobile-nav { display: block; }
          .masthead__actions { gap: var(--space-2); }
          .masthead__admin-btn { display: none; }
          .masthead__logo-clsu, .masthead__logo-dot { display: none; }
          .cart-popover { display: none; }
        }
        @media (max-width: 480px) {
          .masthead__tagline { display: none; }
          .masthead__logo-img { height: 30px; }
          .masthead__logo-crrdc { font-size: var(--text-lg); }
        }
      `}</style>
    </>
  );
}
