// app/api/admin/reset/route.ts — Master Admin Data Reset ("Clean Slate" & Archiving API)
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    // Verify Master Admin role
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    const isMasterAdmin =
      profile?.role === "master_admin" ||
      (user.email || "").toLowerCase().includes("johnrey_divina") ||
      (user.email || "").toLowerCase().includes("johnreydivina") ||
      (user.email || "").toLowerCase() === "johnrey_divina@clsu.edu.ph";

    if (!isMasterAdmin) {
      return NextResponse.json(
        { ok: false, error: "Forbidden: Data Reset action is strictly restricted to Master Administrators." },
        { status: 403 }
      );
    }

    const { periodName } = await request.json().catch(() => ({ periodName: undefined }));
    const now = new Date();
    const defaultPeriodName = periodName || `Period Ending ${now.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}`;

    // 1. Fetch current orders & calculate summary
    const { data: orders } = await supabase.from("orders").select("*");
    const { data: items } = await supabase.from("order_items").select("*");
    const { data: projectOrders } = await supabase.from("project_orders").select("*");

    const activeOrders = orders || [];
    const ordersCount = activeOrders.length;
    const totalSalesPHP = activeOrders
      .filter((o) => o.status === "completed" || o.status === "payment_confirmed")
      .reduce((sum, o) => sum + Number(o.amount_paid_php || o.total_price_php || 0), 0);

    const snapshotData = {
      period_name: defaultPeriodName,
      archived_at: now.toISOString(),
      orders: activeOrders,
      order_items: items || [],
      project_orders: projectOrders || [],
    };

    // 2. Insert Archive Record
    const adminName = profile?.full_name || user.email || "Master Administrator";
    const { data: archiveRecord, error: archiveError } = await supabase.from("archived_periods").insert({
      period_name: defaultPeriodName,
      archived_by: user.id,
      archived_by_name: adminName,
      orders_count: ordersCount,
      total_sales_php: totalSalesPHP,
      snapshot_data: snapshotData,
    }).select().single();

    if (archiveError) {
      console.error("Archive Creation Error:", archiveError);
      return NextResponse.json({ ok: false, error: "Failed to create period archive snapshot." }, { status: 500 });
    }

    // 3. Clear working transaction tables ("Clean Slate")
    await supabase.from("order_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("project_orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 4. Log in System Audit Trail
    await supabase.from("system_audit_logs").insert({
      actor_id: user.id,
      actor_name: adminName,
      actor_designation: "Master Administrator",
      action_type: "data_reset",
      target_table: "orders",
      record_id: archiveRecord.id,
      notes: `Executed Period Data Reset for "${defaultPeriodName}". Archived ${ordersCount} orders (₱${totalSalesPHP.toFixed(2)} total sales).`,
    });

    return NextResponse.json({
      ok: true,
      message: `Clean slate period reset successful. ${ordersCount} orders archived.`,
      archiveId: archiveRecord.id,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to execute period reset." }, { status: 500 });
  }
}
