// app/api/admin/audit-log/route.ts — Fetch Inventory Audit Logs API
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const supabase = createAdminClient();
    let query = supabase
      .from("inventory_audit_log")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ ok: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to fetch audit log." }, { status: 500 });
  }
}
