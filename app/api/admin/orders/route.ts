// app/api/admin/orders/route.ts — Admin Orders API endpoint with status and orderType filtering
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderType = searchParams.get("orderType");

    const supabase = createAdminClient();
    let query = supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(name, category, image_url))")
      .order("created_at", { ascending: false });

    if (status) {
      // Support comma-separated status values (e.g. status=payment_confirmed,completed)
      if (status.includes(",")) {
        const statuses = status.split(",").map((s) => s.trim());
        query = query.in("status", statuses);
      } else {
        query = query.eq("status", status);
      }
    }
    if (orderType) {
      query = query.eq("order_type", orderType);
    }

    const { data: orders, error } = await query;
    if (error) {
      console.warn("Primary admin orders query warning, using fallback:", error.message);
      // Fallback query without complex join
      let fallbackQuery = supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (status) {
        if (status.includes(",")) {
          fallbackQuery = fallbackQuery.in("status", status.split(",").map((s) => s.trim()));
        } else {
          fallbackQuery = fallbackQuery.eq("status", status);
        }
      }
      if (orderType) fallbackQuery = fallbackQuery.eq("order_type", orderType);

      const { data: fallbackOrders } = await fallbackQuery;
      return NextResponse.json({ ok: true, data: fallbackOrders || [] });
    }

    return NextResponse.json({ ok: true, data: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to fetch admin orders." }, { status: 500 });
  }
}
