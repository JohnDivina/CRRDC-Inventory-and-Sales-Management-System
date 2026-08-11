// app/(admin)/admin/audit-logs/page.tsx — Unified System Audit Trail Page
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import AuditLogsClient from "./AuditLogsClient";

export const metadata: Metadata = {
  title: "Unified System Audit Trail | CRRDC Admin",
  description: "View system audit logs and staff attribution details.",
};

export default async function AuditLogsPage() {
  let logs: any[] = [];
  let isMaster = false;

  try {
    const supabase = createAdminClient();

    // 1. Check Master Admin identity
    try {
      const serverClient = await createClient();
      const { data: { user } } = await serverClient.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("admin_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        isMaster =
          profile?.role === "master_admin" ||
          (user.email || "").toLowerCase().includes("johnrey_divina") ||
          (user.email || "").toLowerCase().includes("johnreydivina") ||
          (user.email || "").toLowerCase() === "johnrey_divina@clsu.edu.ph";
      }
    } catch {}

    // 2. Fetch System Audit Logs
    const { data: systemLogs, error: sysErr } = await supabase
      .from("system_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!sysErr && systemLogs && systemLogs.length > 0) {
      logs = systemLogs;
    } else {
      // Fallback to legacy inventory logs
      const { data: legacyLogs } = await supabase
        .from("inventory_audit_log")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(50);

      logs = (legacyLogs || []).map((l: any) => ({
        id: l.id,
        actor_name: l.changed_by_name || "CRRDC Staff",
        actor_designation: "Staff Administrator",
        action_type: l.change_type,
        target_table: "products",
        record_id: l.product_id,
        quantity: Math.abs(l.new_stock_qty - l.old_stock_qty),
        notes: l.note || `Stock updated from ${l.old_stock_qty} to ${l.new_stock_qty} for ${l.products?.name || "item"}`,
        created_at: l.created_at,
      }));
    }
  } catch (err) {
    console.error("Audit Logs Page Fetch Error:", err);
  }

  return <AuditLogsClient initialLogs={logs} isMasterAdmin={isMaster} />;
}
