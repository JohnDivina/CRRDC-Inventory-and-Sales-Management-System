"use client";

// app/(public)/page.tsx — Landing page
// Hallmark: hum-07 Narrative Workflow archetype
// Features: 4-stage timeline spine, process pills, feature chips, visual graphic cards, scroll reveal animations, tick-up counters & English/Tagalog i18n support.

import Link from "next/link";
import {
  Leaf,
  Wheat,
  Package,
  ArrowRight,
  ShoppingBag,
  PackageSearch,
  ShoppingCart,
  QrCode,
  Store,
} from "lucide-react";
import ImageCarousel from "@/components/home/ImageCarousel";
import HumScrollObserver from "@/components/home/HumScrollObserver";
import { useLanguage } from "@/components/layout/LanguageContext";

export default function LandingPage() {
  const { t } = useLanguage();

  const CATEGORY_META = {
    seed: {
      label: t("seeds"),
      Icon: Leaf,
      description: t("seedDesc"),
    },
    rice: {
      label: t("rice"),
      Icon: Wheat,
      description: t("riceDesc"),
    },
    other: {
      label: t("otherProducts"),
      Icon: Package,
      description: t("otherDesc"),
    },
  } as const;

  return (
    <div className="landing page-enter">
      {/* Hallmark hum-07 Scroll Observer (Floating Header, Stage Reveal, Tick-Up Counters) */}
      <HumScrollObserver />

      {/* ── Section 1: Institutional Mandate / Hero (White Background + Floating Logo) ── */}
      <section className="landing__mandate" aria-labelledby="mandate-heading">
        <div className="landing__container landing__mandate-grid">
          {/* Left Column — Text, Stats & CTA */}
          <div className="landing__mandate-content">
            <div className="landing__mandate-eyebrow">
              <span className="landing__eyebrow-rule" aria-hidden="true" />
              <span>{t("mandateEyebrow")}</span>
            </div>

            <h1 id="mandate-heading" className="landing__mandate-heading">
              {t("mandateHeading")}
            </h1>

            <div className="landing__mandate-body">
              <p>{t("mandateBody1")}</p>
              <p>{t("mandateBody2")}</p>
            </div>

            <div className="landing__mandate-footer">
              <div className="landing__mandate-stats">
                <div className="landing__stat">
                  <span className="landing__stat-num">
                    <span className="hum-count" data-to="50">50</span>+
                  </span>
                  <span className="landing__stat-label">{t("yearsResearch")}</span>
                </div>
                <div className="landing__stat">
                  <span className="landing__stat-num">BPI</span>
                  <span className="landing__stat-label">{t("bpiCertified")}</span>
                </div>
                <div className="landing__stat">
                  <span className="landing__stat-num">CLSU</span>
                  <span className="landing__stat-label">{t("clsuUni")}</span>
                </div>
              </div>

              {/* Shop Now Button */}
              <Link href="/catalog" className="landing__shop-now-btn">
                <ShoppingBag size={18} aria-hidden="true" />
                <span>{t("shopCatalog")}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right Column — Floating CRRDC Hero Logo */}
          <div className="landing__hero-graphic" aria-hidden="true">
            <div className="landing__hero-glow" />
            <img
              src="/images/crrdc-logo.png"
              alt="CRRDC Seal"
              className="landing__hero-logo-img"
            />
          </div>
        </div>
      </section>

      {/* ── Featured Image Carousel — Full Bleed ─────────────── */}
      <div className="landing__carousel-bleed">
        <ImageCarousel />
      </div>

      {/* ── Section 2: Product Categories ────────────────────── */}
      <section className="landing__categories" aria-labelledby="categories-heading">
        <div className="landing__container">
          <h2 id="categories-heading" className="landing__section-heading">
            {t("whatWeDistribute")}
          </h2>
          <div className="landing__category-grid">
            {(
              Object.entries(CATEGORY_META) as [
                keyof typeof CATEGORY_META,
                (typeof CATEGORY_META)[keyof typeof CATEGORY_META]
              ][]
            ).map(([key, { label, Icon, description }]) => (
              <Link
                key={key}
                href="/catalog"
                className="landing__category-card"
              >
                <div className="landing__category-icon" aria-hidden="true">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="landing__category-title">{label}</h3>
                  <p className="landing__category-desc">{description}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="landing__category-arrow"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Hallmark hum-07 Narrative Workflow (How to Purchase) ── */}
      <section className="landing__process" id="stages" aria-labelledby="process-heading">
        <div className="landing__container">
          <header className="hum-section__head">
            <div className="hum-process-bar" aria-label="The four stages">
              <span className="hum-process__step">
                <span className="hum-process__dot hum-dot--mint" />
                <span className="hum-num">01</span> browse
              </span>
              <span className="hum-process__link" />
              <span className="hum-process__step">
                <span className="hum-process__dot hum-dot--cyan" />
                <span className="hum-num">02</span> select
              </span>
              <span className="hum-process__link" />
              <span className="hum-process__step">
                <span className="hum-process__dot hum-dot--pear" />
                <span className="hum-num">03</span> checkout &amp; QR
              </span>
              <span className="hum-process__link" />
              <span className="hum-process__step">
                <span className="hum-process__dot hum-dot--coral" />
                <span className="hum-num">04</span> pay &amp; collect
              </span>
            </div>

            <p className="hum-eyebrow">
              <span className="hum-eyebrow__dot" /> The method
            </p>
            <h2 id="process-heading" className="landing__section-heading">
              {t("howToPurchaseTitle")}
            </h2>
            <p className="landing__process-intro">
              {t("purchaseIntro")}
            </p>
          </header>

          {/* Timeline Spine */}
          <div className="hum-stages">
            {/* Stage 1.0 */}
            <article className="hum-stage hum-stage--mint">
              <div className="hum-stage__rail" aria-hidden="true">
                <div className="hum-stage__node">
                  <b>1<small>.0</small></b>
                </div>
                <div className="hum-stage__line" />
              </div>
              <div className="hum-stage__panel">
                <div className="hum-stage__copy">
                  <p className="hum-stage__label">{t("stage1Label")}</p>
                  <h3 className="hum-stage__title">{t("stage1Title")}</h3>
                  <p className="hum-stage__text">{t("stage1Desc")}</p>
                  <div className="hum-stage__chips">
                    <span className="hum-chip">
                      <span className="hum-chip__dot" /> {t("stage1Chip1")}
                    </span>
                    <span className="hum-chip hum-chip--hands">
                      <span className="hum-chip__dot" /> {t("stage1Chip2")}
                    </span>
                  </div>
                </div>
                <div className="hum-stage__art" aria-hidden="true">
                  <div className="hum-art-card">
                    <PackageSearch size={44} className="hum-art-icon hum-icon--mint" />
                    <span className="hum-art-badge">Certified Products</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Stage 2.0 */}
            <article className="hum-stage hum-stage--cyan">
              <div className="hum-stage__rail" aria-hidden="true">
                <div className="hum-stage__node">
                  <b>2<small>.0</small></b>
                </div>
                <div className="hum-stage__line" />
              </div>
              <div className="hum-stage__panel">
                <div className="hum-stage__copy">
                  <p className="hum-stage__label">{t("stage2Label")}</p>
                  <h3 className="hum-stage__title">{t("stage2Title")}</h3>
                  <p className="hum-stage__text">{t("stage2Desc")}</p>
                  <div className="hum-stage__chips">
                    <span className="hum-chip">
                      <span className="hum-chip__dot" /> {t("stage2Chip1")}
                    </span>
                    <span className="hum-chip hum-chip--hands">
                      <span className="hum-chip__dot" /> {t("stage2Chip2")}
                    </span>
                  </div>
                </div>
                <div className="hum-stage__art" aria-hidden="true">
                  <div className="hum-art-card">
                    <ShoppingCart size={44} className="hum-art-icon hum-icon--cyan" />
                    <span className="hum-art-badge">Smart Cart</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Stage 3.0 */}
            <article className="hum-stage hum-stage--pear">
              <div className="hum-stage__rail" aria-hidden="true">
                <div className="hum-stage__node">
                  <b>3<small>.0</small></b>
                </div>
                <div className="hum-stage__line" />
              </div>
              <div className="hum-stage__panel">
                <div className="hum-stage__copy">
                  <p className="hum-stage__label">{t("stage3Label")}</p>
                  <h3 className="hum-stage__title">{t("stage3Title")}</h3>
                  <p className="hum-stage__text">{t("stage3Desc")}</p>
                  <div className="hum-stage__chips">
                    <span className="hum-chip">
                      <span className="hum-chip__dot" /> {t("stage3Chip1")}
                    </span>
                    <span className="hum-chip hum-chip--hands">
                      <span className="hum-chip__dot" /> {t("stage3Chip2")}
                    </span>
                  </div>
                </div>
                <div className="hum-stage__art" aria-hidden="true">
                  <div className="hum-art-card">
                    <QrCode size={44} className="hum-art-icon hum-icon--pear" />
                    <span className="hum-art-badge">Secured Order ID</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Stage 4.0 */}
            <article className="hum-stage hum-stage--coral">
              <div className="hum-stage__rail" aria-hidden="true">
                <div className="hum-stage__node">
                  <b>4<small>.0</small></b>
                </div>
                <div className="hum-stage__line" />
              </div>
              <div className="hum-stage__panel">
                <div className="hum-stage__copy">
                  <p className="hum-stage__label">{t("stage4Label")}</p>
                  <h3 className="hum-stage__title">{t("stage4Title")}</h3>
                  <p className="hum-stage__text">{t("stage4Desc")}</p>
                  <div className="hum-stage__chips">
                    <span className="hum-chip">
                      <span className="hum-chip__dot" /> {t("stage4Chip1")}
                    </span>
                    <span className="hum-chip hum-chip--hands">
                      <span className="hum-chip__dot" /> {t("stage4Chip2")}
                    </span>
                  </div>
                </div>
                <div className="hum-stage__art" aria-hidden="true">
                  <div className="hum-art-card">
                    <Store size={44} className="hum-art-icon hum-icon--coral" />
                    <span className="hum-art-badge">In-Person Release</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── Section 4: Hallmark hum-07 Honest Math Band ───────────────────────── */}
      <section className="hum-numbers-section" aria-labelledby="numbers-title">
        {/* Ghost photo placeholder — replace src with your actual image later */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/placeholder-stats-bg.jpg"
          alt=""
          className="hum-numbers-photo"
          aria-hidden="true"
          data-placeholder="true"
        />
        <div className="landing__container">
          <header className="hum-section__head hum-section__head--center">
            <p className="hum-eyebrow">
              <span className="hum-eyebrow__dot" /> {t("honestPerformance")}
            </p>
            <h2 className="hum-section__title" id="numbers-title">
              {t("honestHeading")}
            </h2>
          </header>
          <dl className="hum-numbers">
            <div className="hum-bignum">
              <dd className="hum-bignum__v">
                <span className="hum-count" data-to="100">100</span><span className="hum-bignum__u">%</span>
              </dd>
              <dt className="hum-bignum__k">{t("stat1Desc")}</dt>
            </div>
            <div className="hum-bignum">
              <dd className="hum-bignum__v">
                <span className="hum-bignum__pre">≈</span><span className="hum-count" data-to="2">2</span><span className="hum-bignum__u">min</span>
              </dd>
              <dt className="hum-bignum__k">{t("stat2Desc")}</dt>
            </div>
            <div className="hum-bignum">
              <dd className="hum-bignum__v">
                <span className="hum-count" data-to="4">4</span>
              </dd>
              <dt className="hum-bignum__k">{t("stat3Desc")}</dt>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Section 5: Hallmark hum-07 Final Focused Closer ──────────────────── */}
      <section className="hum-closer" aria-labelledby="closer-title">
        <div className="landing__container">
          <h2 className="hum-closer__title" id="closer-title">
            {t("closerTitle")}
          </h2>
          <p className="hum-closer__lede">
            {t("closerLede")}
          </p>
          <div className="landing__cta" style={{ justifyContent: "center" }}>
            <Link href="/catalog" className="landing__cta-btn">
              <span>{t("browseBtn")}</span>
              <ArrowRight size={18} aria-hidden="true" style={{ marginLeft: "6px" }} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        /* ── Landing page — Hallmark hum-07 Narrative Workflow ────── */
        .landing {
          padding-top: calc(4.5rem + var(--space-8));
        }
        .landing__container {
          max-width: var(--container-max);
          margin-inline: auto;
          padding-inline: var(--gutter);
        }

        /* ── Section 1: Institutional Mandate / Hero (White BG + Full Bleed Grid) ── */
        @keyframes floatLogo {
          0% {
            transform: translateY(0px) rotate(0deg);
            filter: drop-shadow(0 12px 24px oklch(0% 0 0 / 0.12));
          }
          50% {
            transform: translateY(-16px) rotate(1deg);
            filter: drop-shadow(0 24px 36px oklch(0% 0 0 / 0.18));
          }
          100% {
            transform: translateY(0px) rotate(0deg);
            filter: drop-shadow(0 12px 24px oklch(0% 0 0 / 0.12));
          }
        }

        .landing__mandate {
          background-color: var(--color-paper);
          border-bottom: 1px solid var(--color-border);
          padding-bottom: var(--space-16);
          margin-bottom: var(--space-12);
        }

        .landing__mandate-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: var(--space-12);
          align-items: center;
        }

        .landing__mandate-content {
          max-width: 100%;
        }

        .landing__mandate-eyebrow {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: var(--space-6);
        }

        .landing__eyebrow-rule {
          display: block;
          width: 2rem;
          height: 2px;
          background-color: var(--color-primary);
          flex-shrink: 0;
        }

        .landing__mandate-heading {
          font-size: clamp(var(--text-3xl), 3.8vw, var(--text-display-s));
          color: var(--color-heading);
          margin: 0 0 var(--space-8);
          line-height: 1.18;
        }

        .landing__mandate-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-bottom: var(--space-12);
        }

        .landing__mandate-body p {
          font-size: var(--text-lg);
          color: var(--color-ink);
          margin: 0;
          line-height: 1.75;
        }

        .landing__mandate-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: var(--space-8);
          padding-top: var(--space-8);
          border-top: 1px solid var(--color-border);
        }

        .landing__mandate-stats {
          display: flex;
          gap: var(--space-12);
          flex-wrap: wrap;
        }

        .landing__stat {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .landing__stat-num {
          font-family: var(--font-mono);
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--color-heading);
          line-height: 1;
        }

        .landing__stat-label {
          font-size: var(--text-xs);
          color: var(--color-ink-2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .landing__shop-now-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-8);
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          font-size: var(--text-base);
          font-weight: 600;
          border-radius: var(--radius-md);
          text-decoration: none;
          box-shadow: 0 4px 16px oklch(0% 0 0 / 0.12);
          transition: transform 140ms cubic-bezier(0.2, 0.7, 0.3, 1),
                      box-shadow 140ms cubic-bezier(0.2, 0.7, 0.3, 1),
                      background-color 160ms ease,
                      color 160ms ease;
        }
        .landing__shop-now-btn:hover {
          background-color: var(--color-primary-hover);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 24px oklch(0% 0 0 / 0.22);
          color: var(--color-primary-fg);
        }
        .landing__shop-now-btn:active {
          transform: translateY(1px) scale(0.99);
          box-shadow: 0 2px 8px oklch(0% 0 0 / 0.12);
          transition-duration: 70ms;
        }
        .landing__shop-now-btn:hover svg {
          transform: translateX(4px);
          transition: transform 200ms cubic-bezier(0.2, 0.7, 0.3, 1);
        }

        /* Hero Floating Logo Graphic */
        .landing__hero-graphic {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
        }

        .landing__hero-glow {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: var(--radius-full);
          background: radial-gradient(
            circle at center,
            oklch(from var(--color-primary) l c h / 0.15) 0%,
            oklch(from var(--color-accent) l c h / 0.08) 50%,
            transparent 75%
          );
          pointer-events: none;
          z-index: 1;
        }

        .landing__hero-logo-img {
          position: relative;
          z-index: 2;
          width: 280px;
          height: auto;
          object-fit: contain;
          animation: floatLogo 5s ease-in-out infinite;
        }

        /* Full bleed carousel strip */
        .landing__carousel-bleed {
          width: 100%;
          padding-inline: 0;
        }
        .landing__carousel-bleed .carousel-container {
          border-radius: 0 !important;
          margin-bottom: 0 !important;
          box-shadow: none !important;
        }
        .landing__carousel-bleed .carousel-slide {
          min-height: 320px !important;
        }

        /* ── Section 2: Product Categories ────────────────────── */
        .landing__categories {
          padding-top: var(--space-20);
          margin-bottom: var(--space-20);
        }
        .landing__section-heading {
          font-size: var(--text-3xl);
          color: var(--color-heading);
          margin: 0 0 var(--space-8);
        }
        .landing__category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
        }
        .landing__category-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: var(--space-6);
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          text-decoration: none;
          color: inherit;
          transition: border-color var(--dur-base) var(--ease-out),
                      box-shadow var(--dur-base) var(--ease-out),
                      transform var(--dur-fast) var(--ease-out);
        }
        .landing__category-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 8px 30px oklch(0% 0 0 / 0.08);
          transform: translateY(-2px);
        }
        .landing__category-icon {
          width: 2.8rem;
          height: 2.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          background-color: oklch(from var(--color-primary) l c h / 0.08);
          color: var(--color-primary);
        }
        .landing__category-title {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          color: var(--color-heading);
          margin: 0 0 var(--space-2);
        }
        .landing__category-desc {
          font-size: var(--text-sm);
          color: var(--color-ink-2);
          margin: 0;
          line-height: 1.5;
        }
        .landing__category-arrow {
          color: var(--color-ink-3);
          margin-top: auto;
          transition: transform var(--dur-fast) var(--ease-out),
                      color var(--dur-fast) var(--ease-out);
        }
        .landing__category-card:hover .landing__category-arrow {
          transform: translateX(4px);
          color: var(--color-primary);
        }

        /* ── Section 3: Hallmark hum-07 Timeline Spine ───────── */
        .landing__process {
          position: relative;
          background-color: var(--color-paper-2);
          background-image: url('/textures/paper-grain.png');
          background-repeat: repeat;
          background-size: 360px 360px;
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          padding-block: var(--space-20);
        }
        .landing__process .landing__container {
          position: relative;
          z-index: 1;
        }

        .hum-section__head {
          margin-bottom: var(--space-12);
        }

        .hum-process-bar {
          display: inline-flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-5);
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-ink-2);
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
        }

        .hum-process__step {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
        }

        .hum-process__dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
        }
        .hum-dot--mint { background-color: var(--color-primary); }
        .hum-dot--cyan { background-color: oklch(60% 0.16 240); }
        .hum-dot--pear { background-color: var(--color-accent); }
        .hum-dot--coral { background-color: oklch(60% 0.18 45); }

        .hum-num {
          font-family: var(--font-mono);
          color: var(--color-ink-3);
        }

        .hum-process__link {
          width: 16px;
          height: 1px;
          background-color: var(--color-border);
        }

        .hum-eyebrow {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-primary);
          margin: 0 0 var(--space-3);
        }

        .hum-eyebrow__dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background-color: var(--color-primary);
        }

        .landing__process-intro {
          font-size: var(--text-lg);
          color: var(--color-ink-2);
          max-width: var(--container-text);
          margin: 0;
          line-height: 1.7;
        }

        /* ── hum-stages Timeline Spine & Scroll Animations ─── */
        .hum-stages {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
          margin-top: var(--space-12);
        }

        .hum-stage {
          display: flex;
          gap: var(--space-6);
          position: relative;
        }

        .hum-stage__rail {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          width: 48px;
        }

        /* hum-07 stage node scroll animation */
        .hum-stage__node {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background-color: var(--color-paper);
          border: 2px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-heading);
          box-shadow: 0 4px 12px oklch(0% 0 0 / 0.05);
          z-index: 2;
          transform: scale(0.55);
          opacity: 0;
          transition: transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease;
        }

        .hum-stage--mint .hum-stage__node { border-color: var(--color-primary); color: var(--color-primary); }
        .hum-stage--cyan .hum-stage__node { border-color: oklch(60% 0.16 240); color: oklch(60% 0.16 240); }
        .hum-stage--pear .hum-stage__node { border-color: var(--color-accent-dim); color: oklch(40% 0.14 80); }
        .hum-stage--coral .hum-stage__node { border-color: oklch(60% 0.18 45); color: oklch(60% 0.18 45); }

        /* hum-07 timeline track grow scroll animation */
        .hum-stage__line {
          width: 2px;
          flex: 1;
          background-color: var(--color-border);
          margin-top: var(--space-2);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 600ms var(--ease-out) 130ms;
        }

        .hum-stage:last-child .hum-stage__line {
          display: none;
        }

        /* hum-07 stage panel slide-in scroll animation */
        .hum-stage__panel {
          flex: 1;
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-8);
          box-shadow: 0 4px 20px oklch(0% 0 0 / 0.04);
          opacity: 0;
          transform: translateX(28px);
          transition: opacity 620ms var(--ease-out), transform 620ms var(--ease-out), border-color var(--dur-fast) var(--ease-out);
        }

        /* hum-07 stage reveal active trigger class */
        .hum-stage.is-in .hum-stage__node {
          transform: scale(1);
          opacity: 1;
        }

        .hum-stage.is-in .hum-stage__line {
          transform: scaleY(1);
        }

        .hum-stage.is-in .hum-stage__panel {
          opacity: 1;
          transform: translateX(0);
        }

        .hum-stage__panel:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary);
        }

        .hum-stage__copy {
          max-width: 580px;
        }

        .hum-stage__label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-ink-3);
          letter-spacing: 0.08em;
          margin: 0 0 var(--space-2);
        }

        .hum-stage__title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          color: var(--color-heading);
          margin: 0 0 var(--space-3);
          line-height: 1.25;
        }

        .hum-stage__text {
          font-size: var(--text-base);
          color: var(--color-ink-2);
          margin: 0 0 var(--space-6);
          line-height: 1.6;
        }

        .hum-stage__chips {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .hum-chip {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-ink-2);
        }

        .hum-chip__dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background-color: var(--color-primary);
        }

        .hum-chip--hands .hum-chip__dot {
          background-color: var(--color-accent-dim);
        }

        .hum-stage__art {
          flex-shrink: 0;
        }

        .hum-art-card {
          width: 140px;
          height: 120px;
          border-radius: var(--radius-lg);
          background-color: var(--color-paper-2);
          border: 1px dashed var(--color-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3);
          text-align: center;
        }

        .hum-icon--mint { color: var(--color-primary); }
        .hum-icon--cyan { color: oklch(60% 0.16 240); }
        .hum-icon--pear { color: var(--color-accent-dim); }
        .hum-icon--coral { color: oklch(60% 0.18 45); }

        .hum-art-badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--color-ink-2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── Section 4: Honest Math Statistics Band — Dark Full Bleed ── */
        .hum-numbers-section {
          position: relative;
          padding-block: var(--space-24);
          background-color: oklch(28% 0.130 148);
          border-bottom: none;
          overflow: hidden;
        }

        /* Ghost photo — positioned behind content */
        .hum-numbers-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 0.12;
          pointer-events: none;
          z-index: 0;
          filter: grayscale(30%);
        }
        /* Gradient vignette over photo to keep text readable */
        .hum-numbers-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            oklch(28% 0.130 148 / 0.55) 0%,
            oklch(28% 0.130 148 / 0.35) 50%,
            oklch(28% 0.130 148 / 0.55) 100%
          );
          z-index: 1;
          pointer-events: none;
        }

        .hum-numbers-section .landing__container {
          position: relative;
          z-index: 2;
        }

        .hum-section__head--center {
          text-align: center;
          max-width: var(--container-text);
          margin-inline: auto;
        }

        .hum-section__head--center .hum-eyebrow {
          justify-content: center;
          color: oklch(88% 0.180 98) !important;
        }
        .hum-section__head--center .hum-eyebrow__dot {
          background-color: oklch(88% 0.180 98) !important;
        }

        .hum-section__title {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          color: oklch(98% 0.005 145);
          margin: 0;
        }

        .hum-numbers {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-8);
          margin: var(--space-12) 0 0;
          padding: 0;
        }

        /* Glassmorphism stat cards on dark surface */
        .hum-bignum {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          background: oklch(98% 0.005 145 / 0.07);
          border: 1px solid oklch(98% 0.005 145 / 0.14);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          border-left: 3px solid oklch(88% 0.180 98 / 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: background var(--dur-base) var(--ease-out),
                      transform var(--dur-fast) var(--ease-out);
        }
        .hum-bignum:hover {
          background: oklch(98% 0.005 145 / 0.12);
          transform: translateY(-3px);
        }

        .hum-bignum__v {
          font-family: var(--font-mono);
          font-size: var(--text-display);
          font-weight: 700;
          color: oklch(98% 0.005 145);
          line-height: 1;
          margin: 0;
        }

        .hum-bignum__pre {
          font-size: var(--text-3xl);
          margin-right: 2px;
          color: oklch(88% 0.180 98);
        }

        .hum-bignum__u {
          font-size: var(--text-2xl);
          color: oklch(88% 0.180 98);
          margin-left: 2px;
        }

        .hum-bignum__k {
          font-size: var(--text-sm);
          color: oklch(98% 0.005 145 / 0.65);
          line-height: 1.5;
          margin: 0;
        }

        /* ── Section 5: Hallmark hum-07 Closer ─────────────────── */
        .hum-closer {
          padding-top: var(--space-20);
          padding-bottom: calc(var(--space-20) + var(--space-3xl));
          text-align: center;
          background-color: var(--color-paper-2);
        }

        .hum-closer__title {
          font-family: var(--font-display);
          font-size: var(--text-display-s);
          color: var(--color-heading);
          margin: 0 0 var(--space-4);
        }

        .hum-closer__lede {
          font-size: var(--text-lg);
          color: var(--color-ink-2);
          max-width: 540px;
          margin: 0 auto var(--space-8);
        }

        .landing__cta-btn {
          display: inline-flex;
          align-items: center;
          padding: var(--space-4) var(--space-8);
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          font-weight: 600;
          font-size: var(--text-base);
          border-radius: var(--radius-md);
          text-decoration: none;
          box-shadow: 0 4px 16px oklch(0% 0 0 / 0.12);
          transition: transform 140ms cubic-bezier(0.2, 0.7, 0.3, 1),
                      box-shadow 140ms cubic-bezier(0.2, 0.7, 0.3, 1),
                      background-color 160ms ease,
                      color 160ms ease;
        }
        .landing__cta-btn:hover {
          background-color: var(--color-primary-hover);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 24px oklch(0% 0 0 / 0.22);
          color: var(--color-primary-fg);
        }
        .landing__cta-btn:active {
          transform: translateY(1px) scale(0.99);
          box-shadow: 0 2px 8px oklch(0% 0 0 / 0.12);
          transition-duration: 70ms;
        }
        .landing__cta-btn:hover svg {
          transform: translateX(4px);
          transition: transform 200ms cubic-bezier(0.2, 0.7, 0.3, 1);
        }

        /* ── Section 6: Map & Contact Us / Feedback ─────────────────── */
        .landing__location-contact {
          padding-block: var(--space-16);
          background-color: var(--color-paper);
          border-top: 1px solid var(--color-border);
        }
        .landing__location-contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-8);
          align-items: stretch;
        }
        .landing__map-card, .landing__contact-card {
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .landing__card-header {
          margin-bottom: var(--space-6);
        }
        .landing__eyebrow-rule-group {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }
        .landing__card-eyebrow {
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-primary);
        }
        .landing__card-title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          color: var(--color-heading);
          margin: 0 0 var(--space-2);
        }
        .landing__card-sub {
          font-size: var(--text-sm);
          color: var(--color-ink-2);
          margin: 0;
          line-height: 1.5;
        }

        .landing__map-wrapper {
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: var(--space-4);
          border: 1px solid var(--color-border);
          box-shadow: 0 4px 12px oklch(0% 0 0 / 0.05);
        }
        .landing__map-actions {
          display: flex;
          justify-content: flex-end;
        }
        .landing__directions-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          font-size: var(--text-sm);
          font-weight: 600;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: background-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
        }
        .landing__directions-btn:hover {
          background-color: var(--color-primary-hover);
          transform: translateY(-2px);
        }

        .landing__contact-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .form-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .form-group label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-ink);
        }
        .form-group input, .form-group textarea {
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--color-border-strong);
          border-radius: var(--radius-md);
          background-color: var(--color-paper);
          font-family: var(--font-body);
          font-size: var(--text-sm);
          color: var(--color-ink);
          transition: border-color var(--dur-fast) var(--ease-out);
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px oklch(from var(--color-primary) l c h / 0.15);
        }
        .contact-submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-6);
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          font-size: var(--text-sm);
          font-weight: 600;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
        }
        .contact-submit-btn:hover:not(:disabled) {
          background-color: var(--color-primary-hover);
          transform: translateY(-2px);
        }
        .contact-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .landing__contact-success {
          text-align: center;
          padding: var(--space-8) var(--space-4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
        }
        .landing__contact-success .success-icon {
          color: var(--color-success);
        }
        .landing__contact-success h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--color-ink);
          margin: 0;
          line-height: 1.5;
        }
        .send-another-btn {
          background: none;
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          font-size: var(--text-xs);
          font-weight: 600;
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        /* ── Responsive ──────────────────────────────────────── */
        @media (max-width: 900px) {
          .landing__mandate-grid { grid-template-columns: 1fr; text-align: center; }
          .landing__mandate-eyebrow { justify-content: center; }
          .landing__mandate-footer { justify-content: center; }
          .landing__hero-graphic { display: none; }
          .hum-numbers { grid-template-columns: 1fr; }
          .hum-stage__panel { flex-direction: column; align-items: flex-start; }
          .hum-stage__art { width: 100%; }
          .hum-art-card { width: 100%; height: 90px; flex-direction: row; }
          .landing__location-contact-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .landing__category-grid { grid-template-columns: 1fr; }
          .landing__mandate-stats { gap: var(--space-8); }
          .hum-process-bar { display: none; }
          .hum-stage__rail { width: 36px; }
          .hum-stage__node { width: 36px; height: 36px; font-size: var(--text-xs); }
          .form-group-row { grid-template-columns: 1fr; }

          /* Hero mobile adjustments */
          .landing__hero { min-height: 100svh; padding-block: var(--space-20); }
          .hero__media-slot { top: var(--space-4); right: var(--space-4); }
          .hero__heading { font-size: clamp(var(--text-2xl), 8vw, var(--text-3xl)) !important; }
          .landing__mandate-footer { flex-direction: column; align-items: flex-start; }
          .hero__scroll-hint { display: none; }
          .landing__carousel-bleed .carousel-slide { min-height: 240px !important; }
        }
      `}</style>
    </div>
  );
}
