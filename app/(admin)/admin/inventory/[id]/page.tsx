// app/(admin)/inventory/[id]/page.tsx — Edit Product Page
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products.api";
import EditProductClient from "./EditProductClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};
  return { title: `Edit ${product.name} | Admin — CRRDC` };
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return <EditProductClient product={product} />;
}
