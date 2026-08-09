// schemas/order.schema.ts — Zod validation schemas for Checkout & Orders
import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
