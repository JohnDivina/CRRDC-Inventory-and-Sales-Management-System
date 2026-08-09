// schemas/product.schema.ts — Zod validation schema for Admin Product CRUD
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  category: z.enum(["seed", "rice", "other"], {
    error: "Category must be seed, rice, or other",
  }),
  unit_type: z.enum(["packet", "kg", "sack", "unit"], {
    error: "Unit type must be packet, kg, sack, or unit",
  }),
  price_php: z.number().positive("Price must be a positive number"),
  sack_price_php: z.number().nonnegative().optional().nullable(),
  stock_qty: z.number().int().min(0, "Stock quantity cannot be negative"),
  image_url: z.string().url("Invalid image URL").optional().nullable().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
