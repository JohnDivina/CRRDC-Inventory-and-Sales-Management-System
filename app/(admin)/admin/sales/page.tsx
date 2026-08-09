// app/(admin)/sales/page.tsx — Admin Sales History Server Page
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import SalesClient from "./SalesClient";

export const metadata: Metadata = {
  title: "Sales History & Analytics | Admin — CRRDC",
};

export const revalidate = 0;

export default async function SalesPage() {
  const supabase = createAdminClient();

  const { data: completedOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "completed")
    .order("confirmed_at", { ascending: false });

  return <SalesClient completedOrders={completedOrders || []} />;
}
