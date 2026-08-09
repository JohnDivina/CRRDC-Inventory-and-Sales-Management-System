"use client";

// components/layout/Footer.tsx — Ft5 Statement footer (Hallmark footer archetype)
// Institutional: CLSU/CRRDC affiliation, contact info, mandate statement.
// No social media grid, no multi-column link dump.

import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const MapEmbed = dynamic(() => import("./MapEmbed"), {
  ssr: false,
  loading: () => (
    <div className="footer__map-placeholder">
      <span>Loading interactive map...</span>
    </div>
  ),
});

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="footer" aria-label="Site footer">
      <div className="footer__inner">
        {/* Statement */}
        <div className="footer__statement">
          <p className="footer__institution">
            {t("institution")}
          </p>
          <p className="footer__parent">
            {t("university")}
          </p>
        </div>

        <div className="footer__divider" aria-hidden="true" />

        {/* Contact + links + Map */}
        <div className="footer__columns">
          <div className="footer__contact">
            <h3 className="footer__col-label">{t("contact")}</h3>
            <ul className="footer__contact-list" role="list">
              <li>
                <MapPin size={14} aria-hidden="true" />
                <span>{t("location")}</span>
              </li>
              <li>
                <Phone size={14} aria-hidden="true" />
                <a href="tel:+63449566016">(044) 456-6016</a>
              </li>
              <li>
                <Mail size={14} aria-hidden="true" />
                <a href="mailto:crrdc@clsu.edu.ph">crrdc@clsu.edu.ph</a>
              </li>
            </ul>
          </div>

          <div className="footer__links">
            <h3 className="footer__col-label">{t("catalog")}</h3>
            <ul className="footer__link-list" role="list">
              <li><Link href="/catalog?cat=seed">{t("seeds")}</Link></li>
              <li><Link href="/catalog?cat=rice">{t("rice")}</Link></li>
              <li><Link href="/catalog?cat=other">{t("otherProducts")}</Link></li>
              <li><Link href="/catalog">{t("allProducts")}</Link></li>
            </ul>
          </div>

          <div className="footer__links">
            <h3 className="footer__col-label">{t("center")}</h3>
            <ul className="footer__link-list" role="list">
              <li><Link href="/">{t("aboutCrrdc")}</Link></li>
              <li>
                <a href="https://clsu.edu.ph" target="_blank" rel="noopener noreferrer">
                  {t("clsuWebsite")}
                </a>
              </li>
            </ul>
          </div>

          {/* Embedded RET Complex Map Column */}
          <div className="footer__map-col">
            <h3 className="footer__col-label">{t("locationTitle")}</h3>
            <div className="footer__map-box">
              <div className="footer__map-wrapper">
                <MapEmbed />
              </div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=15.728834897932666,120.92756303784827"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__directions-btn"
              >
                <Navigation size={12} aria-hidden="true" />
                <span>{t("getDirections")}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer__divider" aria-hidden="true" />

        {/* Copyright */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {year} Central Luzon State University — CRRDC. All rights reserved.
          </p>
          <p className="footer__mandate">
            {t("mandateStatement")}
          </p>
        </div>
      </div>

      <style>{`
        .footer {
          background-color: var(--color-primary-dark);
          color: oklch(from var(--color-primary-fg) l c h / 0.8);
          margin-top: 0;
        }
        .footer__inner {
          max-width: var(--container-max);
          margin-inline: auto;
          padding: var(--space-16) var(--gutter) var(--space-10);
        }
        .footer__statement {
          margin-bottom: var(--space-8);
        }
        .footer__institution {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          color: var(--color-primary-fg);
          margin: 0 0 var(--space-2);
        }
        .footer__parent {
          font-size: var(--text-sm);
          color: oklch(from var(--color-primary-fg) l c h / 0.6);
          margin: 0;
        }
        .footer__divider {
          height: 1px;
          background-color: oklch(from var(--color-primary-fg) l c h / 0.12);
          margin-block: var(--space-8);
        }
        .footer__columns {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 2.2fr;
          gap: var(--space-8);
        }
        .footer__col-label {
          font-family: var(--font-body);
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-accent-dim);
          margin: 0 0 var(--space-4);
        }
        .footer__contact-list,
        .footer__link-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .footer__contact-list li {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          font-size: var(--text-sm);
          line-height: 1.4;
        }
        .footer__contact-list li svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--color-accent-dim);
        }
        .footer__contact-list a,
        .footer__link-list a {
          color: oklch(from var(--color-primary-fg) l c h / 0.8);
          text-decoration: none;
          transition: color var(--dur-fast) var(--ease-out);
        }
        .footer__contact-list a:hover,
        .footer__link-list a:hover {
          color: var(--color-accent);
        }
        .footer__link-list li {
          font-size: var(--text-sm);
        }

        .footer__map-box {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .footer__map-wrapper {
          width: 100%;
          height: 180px;
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: 0 2px 10px oklch(0% 0 0 / 0.2);
          position: relative;
          z-index: 1;
        }
        .footer__map-placeholder {
          width: 100%;
          height: 100%;
          background-color: oklch(from var(--color-primary-fg) l c h / 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          color: oklch(from var(--color-primary-fg) l c h / 0.5);
        }
        .footer__directions-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-accent);
          text-decoration: none;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          background-color: oklch(from var(--color-primary-fg) l c h / 0.08);
          align-self: flex-start;
          transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
        }
        .footer__directions-btn:hover {
          background-color: var(--color-accent);
          color: var(--color-accent-fg);
        }

        .footer__bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-4);
        }
        .footer__copyright,
        .footer__mandate {
          font-size: var(--text-xs);
          margin: 0;
          color: oklch(from var(--color-primary-fg) l c h / 0.5);
        }
        @media (max-width: 900px) {
          .footer__columns {
            grid-template-columns: 1fr 1fr;
          }
          .footer__map-wrapper {
            height: 220px;
          }
        }
        @media (max-width: 540px) {
          .footer__columns {
            grid-template-columns: 1fr;
          }
          .footer__map-wrapper {
            height: 240px;
          }
          .footer__bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
