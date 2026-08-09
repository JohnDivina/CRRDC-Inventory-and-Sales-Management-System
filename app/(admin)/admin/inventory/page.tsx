// app/(admin)/inventory/page.tsx — Admin Inventory Server Page
import type { Metadata } from "next";
import { getAllProductsAdmin } from "@/lib/products.api";
import InventoryClient from "./InventoryClient";

export const metadata: Metadata = {
  title: "Inventory Management | Admin — CRRDC",
};

export const revalidate = 0;

export default async function InventoryPage() {
  const products = await getAllProductsAdmin();
  return <InventoryClient initialProducts={products} />;
}
