// app/(auth)/admin/login/page.tsx — Admin Google OAuth sign-in with full-bleed green theme & Home link
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Sign In | CRRDC",
  description: "Sign in to the CRRDC admin panel.",
};

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Top return to home link */}
        <Link href="/" className="login-home-link">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Return to Home</span>
        </Link>

        {error === "unauthorized_domain" && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "20px"
          }}>
            <strong>Access Denied:</strong> Only institutional <code>@clsu.edu.ph</code> Google accounts are permitted to access the admin portal.
          </div>
        )}

        {error === "auth_failed" && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "20px"
          }}>
            Authentication failed. Please try again.
          </div>
        )}


        <div className="login-header">
          <div className="login-brand">
            <span className="login-logo-badge">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>CLSU · CRRDC ADMIN PORTAL</span>
            </span>
          </div>
          <h1 className="login-title">Admin Sign In</h1>
          <p className="login-subtitle">
            Sign in with your authorized CLSU Google account to access inventory, orders, scanner, and sales metrics.
          </p>
        </div>

        <form action="/api/auth/google" method="post">
          <button type="submit" className="login-google-btn">
            <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        <div className="login-footer-note">
          <Lock size={13} aria-hidden="true" />
          <span>Restricted to authorized CRRDC staff and administrators.</span>
        </div>
      </div>

      <style>{`
        .login-page {
          position: fixed;
          inset: 0;
          z-index: 99999;
          width: 100vw;
          height: 100vh;
          height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-primary-dark);
          padding: var(--space-6);
          overflow-y: auto;
        }
        .login-card {
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-8) var(--space-8);
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 50px oklch(0% 0 0 / 0.4);
          position: relative;
        }
        .login-home-link {
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
          transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
        }
        .login-home-link:hover {
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
        }
        .login-header {
          margin-bottom: var(--space-8);
        }
        .login-brand {
          margin-bottom: var(--space-3);
        }
        .login-logo-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--color-primary);
          text-transform: uppercase;
          background-color: oklch(from var(--color-primary) l c h / 0.1);
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }
        .login-title {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          color: var(--color-primary-dark);
          margin: var(--space-2) 0 var(--space-2);
          line-height: 1.2;
        }
        .login-subtitle {
          font-size: var(--text-sm);
          color: var(--color-ink-2);
          margin: 0;
          line-height: 1.5;
        }
        .login-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-6);
          border: 1px solid var(--color-border-strong);
          border-radius: var(--radius-md);
          background-color: var(--color-paper);
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--color-ink);
          cursor: pointer;
          transition: transform 140ms cubic-bezier(0.2, 0.7, 0.3, 1),
                      box-shadow 140ms cubic-bezier(0.2, 0.7, 0.3, 1),
                      border-color 160ms ease,
                      background-color 160ms ease;
          margin-bottom: var(--space-6);
        }
        .login-google-btn:hover {
          background-color: var(--color-paper-2);
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px oklch(0% 0 0 / 0.12);
        }
        .login-google-btn:active {
          transform: translateY(1px);
        }
        .login-footer-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          font-size: 0.75rem;
          color: var(--color-ink-3);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
