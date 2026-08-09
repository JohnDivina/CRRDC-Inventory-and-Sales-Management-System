// app/(public)/checkout/order/[orderId]/page.tsx — Order receipt & status tracking page
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  // Fetch order and line items
  const supabase = createAdminClient();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) notFound();

  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("*, products(name, category)")
    .eq("order_id", orderId);

  return (
    <OrderReceiptClient
      order={order}
      items={(items || []).map((i: any) => ({
        ...i,
        product: i.products ? { name: i.products.name, category: i.products.category } : undefined,
      }))}
    />
  );
}
