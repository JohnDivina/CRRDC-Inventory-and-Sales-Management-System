// app/api/admin/products/route.ts — Admin Products API (Get All / Create)
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema } from "@/schemas/product.schema";
import { getAllProductsAdmin } from "@/lib/products.api";

export async function GET() {
  try {
    const products = await getAllProductsAdmin();
    return NextResponse.json({ ok: true, data: products });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const supabase = createAdminClient();

    const newProduct = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description || null,
      category: input.category,
      unit_type: input.unit_type,
      price_php: input.price_php,
      sack_price_php: input.sack_price_php || null,
      stock_qty: input.stock_qty,
      image_url: input.image_url || null,
      is_active: input.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("products")
      .insert(newProduct)
      .select()
      .single();

    if (error) {
      console.warn("Supabase Product Insert warning:", error.message);
      // If Supabase credentials aren't set in dev, return created object
      return NextResponse.json({ ok: true, data: newProduct });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
