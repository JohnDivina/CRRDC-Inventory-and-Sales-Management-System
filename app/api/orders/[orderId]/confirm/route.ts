// app/api/orders/[orderId]/confirm/route.ts — Cashier Order Payment Confirmation API
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

    // Call atomic SQL RPC function `confirm_order_payment`
    const { data: rpcResult, error: rpcError } = await supabase.rpc("confirm_order_payment", {
      p_order_id: orderId,
      p_cashier_id: staffId,
    });

    if (rpcError) {
      console.warn("RPC confirm_order_payment warning, using fallback:", rpcError.message);

      // Generate fallback daily billing number (MM-DD-XX)
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const seq = String(Math.floor(Math.random() * 90) + 10);
      const fallbackBillingNum = `${mm}-${dd}-${seq}`;

      const { data: orderData } = await supabase.from("orders").select("order_type, total_price_php").eq("id", orderId).single();

      const newStatus = orderData?.order_type === "project" ? "project_pending" : "payment_confirmed";
      const amountPaid = orderData?.order_type === "complimentary" ? 0 : orderData?.total_price_php || 0;

      await supabase.from("orders").update({
        status: newStatus,
        billing_number: fallbackBillingNum,
        confirmed_by: staffId,
        confirmed_at: new Date().toISOString(),
        amount_paid_php: amountPaid,
      }).eq("id", orderId);

      return NextResponse.json({
        ok: true,
        billingNumber: fallbackBillingNum,
        status: newStatus,
      });
    }

    if (rpcResult && !rpcResult.ok) {
      return NextResponse.json({ ok: false, error: rpcResult.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      billingNumber: rpcResult?.billing_number,
      status: rpcResult?.status,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to confirm order payment." }, { status: 500 });
  }
}
