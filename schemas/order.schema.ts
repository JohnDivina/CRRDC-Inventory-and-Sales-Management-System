// schemas/order.schema.ts — Zod validation schemas for Checkout & Orders
import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
  customerName: z.string().min(2, "Customer name is required"),
  orderType: z.enum(["regular", "institutional", "project", "complimentary"]).default("regular"),
  customerOrg: z.string().optional(),
  purpose: z.string().optional(),
  preferredPickupDate: z.string().optional(),
  requestionerName: z.string().optional(),
  projectCode: z.string().optional(),
  projectTitle: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
