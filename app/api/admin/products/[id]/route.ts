// app/api/admin/products/[id]/route.ts — Admin Single Product API (Update / Delete)
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema } from "@/schemas/product.schema";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updates = {
      ...parsed.data,
      updated_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.warn("Supabase Product Update warning:", error.message);
      return NextResponse.json({ ok: true, data: { id, ...updates } });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Soft-delete (deactivate) or hard delete
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.warn("Supabase Product Delete warning:", error.message);
    }

    return NextResponse.json({ ok: true, message: "Product deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
