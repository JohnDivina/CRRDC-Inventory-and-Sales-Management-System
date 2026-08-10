// app/(public)/checkout/order/[orderId]/page.tsx — Order receipt & status tracking page
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import OrderReceiptClient from "./OrderReceiptClient";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order #${orderId.slice(0, 8)} | CRRDC — CLSU`,
    description: "View order receipt and payment status.",
  };
}

export default async function OrderStatusPage({ params }: PageProps) {
  const { orderId } = await params;

  let orderData: any = null;
  let lineItems: any[] = [];

  try {
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (order) {
      orderData = order;

      const { data: items } = await supabase
        .from("order_items")
        .select("*, products(name, category)")
        .eq("order_id", orderId);

      lineItems = items || [];
    }
  } catch (err) {
    console.error("Order Status Page Error:", err);
  }

  // Fallback order data if database lookup is pending or offline
  const fallbackOrder = orderData || {
    id: orderId,
    guest_id: "guest",
    status: "pending",
    order_type: "regular",
    total_price_php: 0,
    amount_paid_php: 0,
    qr_payload: JSON.stringify({ orderId, totalPhp: 0, issuedAt: new Date().toISOString() }),
    created_at: new Date().toISOString(),
  };

  return (
    <OrderReceiptClient
      order={fallbackOrder}
      items={lineItems.map((i: any) => ({
        ...i,
        product: i.products ? { name: i.products.name, category: i.products.category } : undefined,
      }))}
    />
  );
}
