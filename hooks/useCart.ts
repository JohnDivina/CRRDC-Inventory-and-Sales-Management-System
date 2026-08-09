// hooks/useCart.ts — Cart state (Zustand + sessionStorage persistence)
// Phase 2: Guest-only, no auth. Cart lives in session only.
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/types";
import { breakdownRiceQty } from "@/types";

interface CartState {
  items: CartItem[];
  // Derived
  totalItems: number;
  totalPHP: number;
  // Actions
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

function computeTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPHP = items.reduce((sum, item) => {
    if (item.product.unit_type === "kg") {
      // Rice: price_php is per kg
      return sum + item.product.price_php * item.quantity;
    }
    if (item.product.unit_type === "sack") {
      // Sack product: price_php is per sack
      return sum + item.product.price_php * item.quantity;
    }
    return sum + item.product.price_php * item.quantity;
  }, 0);
  return { totalItems, totalPHP };
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPHP: 0,

      addItem: (product, quantity) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          let newItems: CartItem[];

          if (existing) {
            newItems = state.items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          } else {
            newItems = [...state.items, { product, quantity }];
          }

          return { items: newItems, ...computeTotals(newItems) };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          const newItems =
            quantity <= 0
              ? state.items.filter((i) => i.product.id !== productId)
              : state.items.map((i) =>
                  i.product.id === productId ? { ...i, quantity } : i
                );
          return { items: newItems, ...computeTotals(newItems) };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.product.id !== productId);
          return { items: newItems, ...computeTotals(newItems) };
        });
      },

      clearCart: () =>
        set({ items: [], totalItems: 0, totalPHP: 0 }),
    }),
    {
      name: "crrdc-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : localStorage
      ),
      // Only persist items array; recompute totals on rehydration
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { totalItems, totalPHP } = computeTotals(state.items);
          state.totalItems = totalItems;
          state.totalPHP = totalPHP;
        }
      },
    }
  )
);

// ─── Selector helpers (avoid re-renders) ────────────────────
export const selectCartItems = (s: CartState) => s.items;
export const selectCartTotal = (s: CartState) => s.totalPHP;
export const selectCartCount = (s: CartState) => s.totalItems;
