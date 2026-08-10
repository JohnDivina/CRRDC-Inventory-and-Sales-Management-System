// app/(auth)/admin/pending-approval/page.tsx — Staff Account Pending Approval Screen
import Link from "next/link";
import { Clock, ShieldAlert, ArrowLeft } from "lucide-react";

export default function PendingApprovalPage() {
  return (
    <div className="pending-page">
      <div className="pending-card">
        <Link href="/" className="home-link">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Return to Home</span>
        </Link>

        <div className="icon-wrapper">
          <Clock size={36} className="clock-icon" aria-hidden="true" />
        </div>

        <h1 className="title">Account Pending Master Admin Approval</h1>

        <p className="description">
          Your <code>@clsu.edu.ph</code> Google account request has been registered in the CRRDC Platform.
        </p>

        <div className="notice-box">
          <ShieldAlert size={18} className="notice-icon" aria-hidden="true" />
          <span>
            For institutional security, access to the CRRDC Admin Portal requires authorization from the <strong>Master Administrator</strong>.
          </span>
        </div>

        <div className="actions">
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="signout-btn">
              Sign Out &amp; Check Later
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .pending-page {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-primary-dark);
          padding: var(--space-6);
        }
        .pending-card {
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 50px oklch(0% 0 0 / 0.4);
        }
        .home-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-primary);
          text-decoration: none;
          margin-bottom: var(--space-6);
          padding: var(--space-2) var(--space-3);
          background-color: var(--color-paper-2);
          border-radius: var(--radius-full);
        }
        .icon-wrapper {
          width: 64px;
          height: 64px;
          margin: 0 auto var(--space-4);
          border-radius: var(--radius-full);
          background-color: oklch(from var(--color-warning) l c h / 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .clock-icon { color: var(--color-warning); }
        .title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          color: var(--color-heading);
          margin-bottom: var(--space-3);
        }
        .description {
          font-size: var(--text-sm);
          color: var(--color-ink-2);
          margin-bottom: var(--space-6);
          line-height: 1.5;
        }
        .notice-box {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4);
          background-color: oklch(from var(--color-primary) l c h / 0.08);
          border: 1px solid oklch(from var(--color-primary) l c h / 0.2);
          border-radius: var(--radius-lg);
          font-size: var(--text-xs);
          color: var(--color-ink);
          text-align: left;
          margin-bottom: var(--space-6);
        }
        .notice-icon { color: var(--color-primary); flex-shrink: 0; margin-top: 2px; }
        .signout-btn {
          width: 100%;
          padding: var(--space-3) var(--space-6);
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: var(--text-sm);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
