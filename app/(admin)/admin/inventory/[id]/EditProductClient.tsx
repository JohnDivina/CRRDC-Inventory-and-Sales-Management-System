"use client";

// app/(admin)/inventory/[id]/EditProductClient.tsx — Edit product client component
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, AlertCircle } from "lucide-react";
import type { Product, ProductCategory, ProductUnitType } from "@/types";

interface EditProductClientProps {
  product: Product;
}

export default function EditProductClient({ product }: EditProductClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || "",
    category: product.category,
    unit_type: product.unit_type,
    price_php: product.price_php,
    sack_price_php: product.sack_price_php || 0,
    stock_qty: product.stock_qty,
    image_url: product.image_url || "",
    is_active: product.is_active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        unit_type: formData.unit_type,
        price_php: Number(formData.price_php),
        sack_price_php: formData.category === "rice" && formData.sack_price_php > 0 ? Number(formData.sack_price_php) : null,
        stock_qty: Number(formData.stock_qty),
        image_url: formData.image_url || null,
        is_active: formData.is_active,
      };

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Failed to update product");
      }

      router.push("/admin/inventory");
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin/inventory");
      }
    } catch {
      alert("Failed to delete product");
    }
  };

  return (
    <div className="product-form-page">
      <Link href="/admin/inventory" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Back to Inventory</span>
      </Link>

      <div className="form-card">
        <div className="form-header">
          <h1 className="form-title">Edit Product</h1>
          <button type="button" onClick={handleDelete} className="delete-btn">
            <Trash2 size={16} aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>

        {error && (
          <div className="form-error">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Product Name *</label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category" className="form-label">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                className="form-select"
              >
                <option value="seed">Seeds</option>
                <option value="rice">Rice</option>
                <option value="other">Other Produce</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="unit_type" className="form-label">Unit Type *</label>
              <select
                id="unit_type"
                value={formData.unit_type}
                onChange={(e) => setFormData({ ...formData, unit_type: e.target.value as ProductUnitType })}
                className="form-select"
              >
                <option value="packet">Packet (Fixed unit)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="sack">Sack (25 kg fixed)</option>
                <option value="unit">Unit / Bag</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price_php" className="form-label">Unit Price (PHP ₱) *</label>
              <input
                id="price_php"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price_php}
                onChange={(e) => setFormData({ ...formData, price_php: Number(e.target.value) })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock_qty" className="form-label">Stock Quantity Level *</label>
              <div className="stock-adj-row">
                <input
                  id="stock_qty"
                  type="number"
                  min="0"
                  required
                  value={formData.stock_qty}
                  onChange={(e) => setFormData({ ...formData, stock_qty: Number(e.target.value) })}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, stock_qty: formData.stock_qty + 50 })}
                  className="adj-btn"
                >
                  +50
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Product Description</label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div className="form-group form-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Active in public store catalog</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>
              <Save size={16} aria-hidden="true" />
              <span>{submitting ? "Updating..." : "Update Product"}</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .product-form-page { max-width: 680px; margin-inline: auto; }
        .back-link { display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-primary); text-decoration: none; margin-bottom: var(--space-6); }
        .form-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-8); }
        .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
        .form-title { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-primary-dark); margin: 0; }
        .delete-btn { display: flex; align-items: center; gap: var(--space-1); background: none; border: 1px solid var(--color-error); color: var(--color-error); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); font-size: var(--text-xs); font-weight: 600; cursor: pointer; }

        .form-error { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3); background-color: oklch(from var(--color-error) l c h / 0.1); color: var(--color-error); font-size: var(--text-xs); border-radius: var(--radius-md); margin-bottom: var(--space-6); }

        .product-form { display: flex; flex-direction: column; gap: var(--space-5); }
        .form-group { display: flex; flex-direction: column; gap: var(--space-2); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

        .form-label { font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-2); }
        .form-input, .form-select, .form-textarea { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-family: var(--font-body); }

        .stock-adj-row { display: flex; gap: var(--space-2); }
        .adj-btn { padding: 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background-color: var(--color-paper-2); font-weight: 600; cursor: pointer; }

        .checkbox-label { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-ink); cursor: pointer; }

        .submit-btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-3) var(--space-6); background-color: var(--color-primary); color: var(--color-primary-fg); border: none; border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-sm); cursor: pointer; }
        .submit-btn:hover { background-color: var(--color-primary-hover); }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
