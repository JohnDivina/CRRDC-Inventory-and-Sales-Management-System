// app/(admin)/orders/page.tsx — Admin Orders Server Page
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "Order Management | Admin — CRRDC",
};

export const revalidate = 0;

export default async function OrdersPage() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return <OrdersClient initialOrders={orders || []} />;
}
