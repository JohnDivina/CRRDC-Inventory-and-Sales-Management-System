// app/api/orders/[orderId]/route.ts — Get Order Status API
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteProps {
  params: Promise<{ orderId: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { orderId } = await params;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isRealSupabase = url.length > 0 && !url.includes("your-project.supabase.co");

    if (isRealSupabase) {
      const supabase = createAdminClient();
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (order) {
        const { data: items } = await supabase
          .from("order_items")
          .select("*, products(name, category)")
          .eq("order_id", orderId);

        const formattedItems = (items || []).map((i: any) => ({
          ...i,
          product: i.products ? { name: i.products.name, category: i.products.category } : undefined,
        }));

        return NextResponse.json({
          ok: true,
          data: {
            ...order,
            items: formattedItems,
          },
        });
      }
    }

    // Dev fallback order data
    return NextResponse.json({
      ok: true,
      data: {
        id: orderId,
        guest_id: "guest",
        status: "pending",
        order_type: "regular",
        total_price_php: 450,
        amount_paid_php: 450,
        qr_payload: "",
        created_at: new Date().toISOString(),
        confirmed_at: null,
        items: [],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch order status" },
      { status: 500 }
    );
  }
}
