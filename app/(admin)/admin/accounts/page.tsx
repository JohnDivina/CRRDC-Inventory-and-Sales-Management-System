// app/(admin)/admin/accounts/page.tsx — Master Admin Accounts Page
import type { Metadata } from "next";
import { Suspense } from "react";
import AccountsClient from "./AccountsClient";

export const metadata: Metadata = {
  title: "Staff Accounts & Approvals | Admin — CRRDC",
  description: "Manage CLSU staff permissions and authorize admin accounts.",
};

export default function AdminAccountsPage() {
  return (
    <Suspense fallback={<div className="page-loading">Loading accounts...</div>}>
      <AccountsClient />
    </Suspense>
  );
}
