// app/api/orders/[orderId]/release/route.ts — Seed Lab Release API
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface RouteProps {
  params: Promise<{ orderId: string }>;
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { orderId } = await params;
    const supabase = createAdminClient();

    let staffId = "00000000-0000-0000-0000-000000000000";
    try {
      const serverClient = await createClient();
      const { data: { user } } = await serverClient.auth.getUser();
      if (user) staffId = user.id;
    } catch {}

    // Call atomic RPC release function
    const { data: rpcResult, error: rpcError } = await supabase.rpc("release_order_items", {
      p_order_id: orderId,
      p_staff_id: staffId,
    });

    if (rpcError) {
      console.warn("RPC release_order_items warning, executing fallback:", rpcError.message);

      // Fallback: Decrement product stock directly
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      if (items) {
        for (const item of items) {
          const { data: prod } = await supabase.from("products").select("stock_qty, name").eq("id", item.product_id).single();
          if (prod) {
            const newQty = Math.max(0, prod.stock_qty - item.quantity);
            await supabase.from("products").update({ stock_qty: newQty, updated_at: new Date().toISOString() }).eq("id", item.product_id);
            
            await supabase.from("inventory_audit_log").insert({
              product_id: item.product_id,
              changed_by: staffId,
              change_type: "order_deduction",
              old_stock_qty: prod.stock_qty,
              new_stock_qty: newQty,
              note: `Item release for Order #${orderId.slice(0, 8)}`,
            });
          }
        }
      }

      await supabase.from("orders").update({
        status: "completed",
        released_by: staffId,
        released_at: new Date().toISOString(),
      }).eq("id", orderId);

      return NextResponse.json({ ok: true, status: "completed" });
    }

    if (rpcResult && !rpcResult.ok) {
      return NextResponse.json({ ok: false, error: rpcResult.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, status: "completed" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to release items." }, { status: 500 });
  }
}
