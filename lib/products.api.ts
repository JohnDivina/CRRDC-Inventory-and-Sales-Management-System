// lib/products.api.ts — Product data access layer (server + client)
import type { Product, ProductCategory } from "@/types";

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "RC 222 Foundation Seeds",
    description: "Certified foundation seeds of RC 222, a high-yielding inbred rice variety developed by CLSU. Ideal for irrigated lowland conditions.",
    category: "seed",
    unit_type: "packet",
    price_php: 450.00,
    sack_price_php: null,
    stock_qty: 200,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "NSIC Rc 216 Registered Seeds",
    description: "Registered class seeds of NSIC Rc 216. Short duration variety with excellent eating quality.",
    category: "seed",
    unit_type: "packet",
    price_php: 380.00,
    sack_price_php: null,
    stock_qty: 150,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Sweet Corn Hybrid Seeds",
    description: "Premium sweet corn hybrid seeds. High sugar content, suitable for fresh market and processing.",
    category: "seed",
    unit_type: "packet",
    price_php: 250.00,
    sack_price_php: null,
    stock_qty: 80,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "RC 222 Milled Rice (Loose)",
    description: "Premium milled rice from CRRDC's own RC 222 variety. Soft texture, slightly sticky. Sold per kilogram.",
    category: "rice",
    unit_type: "kg",
    price_php: 52.00,
    sack_price_php: 1250.00,
    stock_qty: 500,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "RC 222 Milled Rice (25 kg Sack)",
    description: "Premium milled rice from CRRDC's own RC 222 variety — 25 kg sack. Ideal for families and small canteens.",
    category: "rice",
    unit_type: "sack",
    price_php: 1250.00,
    sack_price_php: 1250.00,
    stock_qty: 40,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Vermicompost (5 kg bag)",
    description: "Organic vermicompost produced by CRRDC's vermiculture unit. Improves soil structure and fertility.",
    category: "other",
    unit_type: "unit",
    price_php: 95.00,
    sack_price_php: null,
    stock_qty: 60,
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function isRealSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return url.length > 0 && !url.includes("your-project.supabase.co");
}

// Server-side: fetch products directly from Supabase with graceful fallback
export async function getProducts(
  category?: ProductCategory
): Promise<Product[]> {
  if (!isRealSupabaseConfigured()) {
    return category
      ? FALLBACK_PRODUCTS.filter((p) => p.category === category)
      : FALLBACK_PRODUCTS;
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return category
        ? FALLBACK_PRODUCTS.filter((p) => p.category === category)
        : FALLBACK_PRODUCTS;
    }
    return data as Product[];
  } catch {
    return category
      ? FALLBACK_PRODUCTS.filter((p) => p.category === category)
      : FALLBACK_PRODUCTS;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isRealSupabaseConfigured()) {
    return FALLBACK_PRODUCTS.find((p) => p.id === id) || null;
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return FALLBACK_PRODUCTS.find((p) => p.id === id) || null;
    }
    return data as Product;
  } catch {
    return FALLBACK_PRODUCTS.find((p) => p.id === id) || null;
  }
}

// Admin: get all products including inactive
export async function getAllProductsAdmin(): Promise<Product[]> {
  if (!isRealSupabaseConfigured()) {
    return FALLBACK_PRODUCTS;
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK_PRODUCTS;
    return data as Product[];
  } catch {
    return FALLBACK_PRODUCTS;
  }
}
