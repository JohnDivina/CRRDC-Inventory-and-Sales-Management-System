// app/(admin)/admin/accounts/page.tsx — Master Admin Accounts Page (Master Admin Guarded)
import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AccountsClient from "./AccountsClient";

export const metadata: Metadata = {
  title: "Staff Accounts & Approvals | Admin — CRRDC",
  description: "Manage CLSU staff permissions and authorize admin accounts.",
};

export default async function AdminAccountsPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isRealSupabase = url.length > 0 && !url.includes("your-project.supabase.co");

  if (isRealSupabase) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.email) redirect("/admin/login");

      const isMasterAdminEmail =
        user.email.toLowerCase().includes("johnrey_divina") ||
        user.email.toLowerCase().includes("johnreydivina") ||
        user.email.toLowerCase() === "johnrey_divina@clsu.edu.ph";

      if (!isMasterAdminEmail) {
        const adminClient = createAdminClient();
        const { data: profile } = await adminClient
          .from("admin_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!profile || profile.role !== "master_admin") {
          redirect("/admin/dashboard");
        }
      }
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      redirect("/admin/dashboard");
    }
  }

  return (
    <Suspense fallback={<div className="page-loading">Loading accounts...</div>}>
      <AccountsClient />
    </Suspense>
  );
}
