// app/api/admin/audit-log/route.ts — Fetch Inventory Audit Logs API
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const supabase = createAdminClient();

    // 1. Try unified system_audit_logs table
    const { data: systemLogs, error: sysError } = await supabase
      .from("system_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!sysError && systemLogs && systemLogs.length > 0) {
      return NextResponse.json({ ok: true, data: systemLogs });
    }

    // 2. Fallback to legacy inventory_audit_log
    let query = supabase
      .from("inventory_audit_log")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data } = await query;
    const formatted = (data || []).map((log: any) => ({
      id: log.id,
      actor_id: log.changed_by,
      actor_name: log.changed_by_name || "CRRDC Staff",
      actor_designation: "Staff Administrator",
      action_type: log.change_type,
      target_table: "products",
      record_id: log.product_id,
      quantity: Math.abs(log.new_stock_qty - log.old_stock_qty),
      notes: log.note || `Stock updated from ${log.old_stock_qty} to ${log.new_stock_qty} for ${log.products?.name || "item"}`,
      created_at: log.created_at,
    }));

    return NextResponse.json({ ok: true, data: formatted });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to fetch audit log." }, { status: 500 });
  }
}
