// app/(admin)/dashboard/page.tsx — Admin Dashboard Server Page
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Admin Dashboard | CRRDC",
  description: "CRRDC Inventory & Sales Management Overview.",
};

export const revalidate = 0; // Fresh metrics on every load

export default async function DashboardPage() {
  const supabase = createAdminClient();

  // 1. Fetch pending orders count
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("id, total_price_php, created_at, status")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // 2. Fetch completed orders count and total sales
  const { data: completedOrders } = await supabase
    .from("orders")
    .select("total_price_php")
    .eq("status", "completed");

  const totalSalesPHP = (completedOrders || []).reduce(
    (sum: number, o: any) => sum + Number(o.total_price_php || 0),
    0
  );

  // 3. Fetch low stock products count (< 50 items)
  const { data: products } = await supabase
    .from("products")
    .select("id, name, stock_qty, category, is_active");

  const lowStockCount = (products || []).filter(
    (p: any) => p.is_active && p.stock_qty < 50
  ).length;

  return (
    <DashboardClient
      pendingCount={pendingOrders?.length || 0}
      completedCount={completedOrders?.length || 0}
      totalSalesPHP={totalSalesPHP}
      lowStockCount={lowStockCount}
      activeProductsCount={(products || []).filter((p: any) => p.is_active).length}
      recentOrders={(pendingOrders || []).slice(0, 5)}
    />
  );
}
