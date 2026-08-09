// app/(public)/products/[id]/page.tsx — Product Detail Page
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products.api";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};
  return {
    title: `${product.name} | CRRDC — CLSU`,
    description: product.description || `Purchase ${product.name} from CRRDC.`,
  };
}

export const revalidate = 3600;

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
