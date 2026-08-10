// app/api/orders/route.ts — Create Order API Route Handler
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderSchema } from "@/schemas/order.schema";
import type { QRPayload } from "@/types";

// Task 3: In-memory rate limiter (5 orders / 60s per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // Cleanup expired entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }

  const current = rateLimitMap.get(ip);
  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (current.count >= 5) {
    return false;
  }

  current.count += 1;
  return true;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>?/gm, "").trim();
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded ? forwarded.split(",")[0].trim() : realIp || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait before submitting again." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Task 2: Validate customer_name and customer_phone if present in body
    if (body.customer_name !== undefined || body.customer_phone !== undefined) {
      const rawName = String(body.customer_name || "");
      const cleanName = stripHtml(rawName);

      if (cleanName.length < 2 || cleanName.length > 100) {
        return NextResponse.json(
          { ok: false, error: "Customer name must be between 2 and 100 characters.", field: "customer_name" },
          { status: 400 }
        );
      }

      const rawPhone = String(body.customer_phone || "").trim();
      const phoneRegex = /^(09|\+639)\d{9}$/;
      if (!phoneRegex.test(rawPhone)) {
        return NextResponse.json(
          { ok: false, error: "Invalid Philippine phone number format (e.g., 09171234567 or +639171234567).", field: "customer_phone" },
          { status: 400 }
        );
      }
    }

    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      items,
      customerName,
      orderType,
      customerOrg,
      purpose,
      preferredPickupDate,
      requestionerName,
      projectCode,
      projectTitle,
      notes,
    } = parsed.data;

    // Use service role admin client to perform atomic order creation
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isRealSupabase = url.length > 0 && !url.includes("your-project.supabase.co");

    let productMap = new Map<string, any>();

    if (isRealSupabase) {
      const supabase = createAdminClient();
      const productIds = items.map((i) => i.productId);
      const { data: dbProducts, error: prodError } = await supabase
        .from("products")
        .select("id, name, price_php, stock_qty, unit_type, is_active")
        .in("id", productIds);

      if (!prodError && dbProducts && dbProducts.length > 0) {
        productMap = new Map(dbProducts.map((p) => [p.id, p]));
      }
    }

    // Dev fallback if Supabase DB is not connected or products not found
    if (productMap.size === 0) {
      const { getProducts } = await import("@/lib/products.api");
      const fallbackList = await getProducts();
      productMap = new Map(fallbackList.map((p) => [p.id, p]));
    }

    // Validate that all products exist, are active, and have sufficient stock
    let totalOrderPHP = 0;
    const validatedLineItems: {
      product_id: string;
      quantity: number;
      unit_type: string;
      unit_price_php: number;
      line_total_php: number;
    }[] = [];

    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod || !prod.is_active) {
        return NextResponse.json(
          { ok: false, error: `Product "${item.productId}" is not available.` },
          { status: 400 }
        );
      }

      if (prod.stock_qty < item.quantity) {
        return NextResponse.json(
          {
            ok: false,
            error: `Insufficient stock for "${prod.name}". Available: ${prod.stock_qty}, Requested: ${item.quantity}.`,
          },
          { status: 400 }
        );
      }

      const lineTotal = prod.price_php * item.quantity;
      totalOrderPHP += lineTotal;

      validatedLineItems.push({
        product_id: prod.id,
        quantity: item.quantity,
        unit_type: prod.unit_type,
        unit_price_php: prod.price_php,
        line_total_php: lineTotal,
      });
    }

    // 2. Generate initial UUID for order
    const orderId = crypto.randomUUID();
    const guestId = crypto.randomUUID(); // Lightweight guest ID
    const issuedAt = new Date().toISOString();

    const { signQRPayload } = await import("@/lib/qr");
    const signature = signQRPayload(orderId, totalOrderPHP, issuedAt);

    const qrPayloadObj: QRPayload = {
      orderId,
      totalPhp: totalOrderPHP,
      issuedAt,
      signature,
    };
    const qrPayloadStr = JSON.stringify(qrPayloadObj);

    // 3. Insert order record (if real Supabase is configured)
    if (isRealSupabase) {
      const supabase = createAdminClient();
      const { error: orderInsertError } = await supabase.from("orders").insert({
        id: orderId,
        guest_id: guestId,
        status: "pending",
        order_type: orderType || "regular",
        customer_name: customerName,
        customer_org: customerOrg || null,
        purpose: purpose || null,
        preferred_pickup_date: preferredPickupDate || null,
        total_price_php: totalOrderPHP,
        amount_paid_php: orderType === "complimentary" ? 0 : totalOrderPHP,
        qr_payload: qrPayloadStr,
        notes: notes || null,
      });

      if (orderInsertError) {
        console.error("Order Insert Error:", orderInsertError);
        return NextResponse.json(
          { ok: false, error: "Failed to create order record." },
          { status: 500 }
        );
      }

      // If project-based, create project_orders entry with 20th-of-month follow-up date
      if (orderType === "project") {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 20);
        const followUpDateStr = nextMonth.toISOString().split("T")[0];

        await supabase.from("project_orders").insert({
          order_id: orderId,
          requestioner_name: requestionerName || customerName,
          organization: customerOrg || "N/A",
          project_code: projectCode || null,
          project_title: projectTitle || null,
          follow_up_date: followUpDateStr,
        });
      }

      // 4. Insert order items
      const lineItemsToInsert = validatedLineItems.map((item) => ({
        ...item,
        order_id: orderId,
      }));

      const { error: itemsInsertError } = await supabase
        .from("order_items")
        .insert(lineItemsToInsert);

      if (itemsInsertError) {
        console.error("Order Items Insert Error:", itemsInsertError);
        // Clean up orphaned order
        await supabase.from("orders").delete().eq("id", orderId);
        return NextResponse.json(
          { ok: false, error: "Failed to create order items." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        orderId,
        guestId,
        totalPricePhp: totalOrderPHP,
        qrPayload: qrPayloadStr,
        createdAt: issuedAt,
      },
    });
  } catch (err: any) {
    console.error("Create Order Exception:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

