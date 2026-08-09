// types/index.ts — Domain models for CRRDC platform
// All types mirror the Supabase schema exactly.

export type ProductCategory = "seed" | "rice" | "other";
export type ProductUnitType = "packet" | "kg" | "sack" | "unit";
export type OrderStatus = "pending" | "completed" | "cancelled";

// ─── Product ────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  unit_type: ProductUnitType;
  price_php: number;
  /** For rice products: fixed 25-kg sack price. null = price_php * 25 */
  sack_price_php: number | null;
  stock_qty: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Cart (client-side only — not persisted to DB) ──────────
export interface CartItem {
  product: Product;
  quantity: number;
  /**
   * For rice products, quantity is in kg.
   * Display logic: Math.floor(qty / 25) sacks + qty % 25 loose kg.
   * unit_override lets us track sack vs kg line items for the same product.
   */
  unit_override?: ProductUnitType;
}

export interface Cart {
  items: CartItem[];
}

// ─── Order ──────────────────────────────────────────────────
export interface Order {
  id: string;
  guest_id: string;
  status: OrderStatus;
  total_price_php: number;
  qr_payload: string;
  confirmed_by: string | null;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
}

// ─── Order Item ─────────────────────────────────────────────
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_type: ProductUnitType;
  unit_price_php: number;
  line_total_php: number;
  // Joined from products when fetching order detail
  product?: Pick<Product, "name" | "category" | "image_url">;
}

// ─── QR Payload (encoded into QR code) ──────────────────────
export interface QRPayload {
  orderId: string;
  totalPhp: number;
  /** ISO timestamp for freshness check */
  issuedAt: string;
  /** HMAC-SHA256 signature to prevent order spoofing */
  signature?: string;
}

// ─── Admin User ─────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

// ─── API Response shapes ─────────────────────────────────────
export interface ApiSuccess<T = void> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResult<T = void> = ApiSuccess<T> | ApiError;

// ─── Rice unit helpers ───────────────────────────────────────
export interface RiceQuantityBreakdown {
  sacks: number;
  looseKg: number;
  totalKg: number;
}

/**
 * Breaks a kg quantity into sacks + loose kg.
 * 1 sack = 25 kg (fixed threshold).
 * e.g., 30 kg → { sacks: 1, looseKg: 5, totalKg: 30 }
 */
export function breakdownRiceQty(totalKg: number): RiceQuantityBreakdown {
  const SACK_KG = 25;
  const sacks = Math.floor(totalKg / SACK_KG);
  const looseKg = totalKg % SACK_KG;
  return { sacks, looseKg, totalKg };
}

/**
 * Format rice quantity for display.
 * e.g., 30 → "1 sack + 5 kg"
 *       25 → "1 sack"
 *       15 → "15 kg"
 */
export function formatRiceQty(totalKg: number): string {
  const { sacks, looseKg } = breakdownRiceQty(totalKg);
  if (sacks === 0) return `${looseKg} kg`;
  if (looseKg === 0) return `${sacks} ${sacks === 1 ? "sack" : "sacks"}`;
  return `${sacks} ${sacks === 1 ? "sack" : "sacks"} + ${looseKg} kg`;
}

/**
 * Format price as Philippine peso.
 * e.g., 1250 → "₱1,250.00"
 */
export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}
