"use client";

// app/(admin)/inventory/InventoryClient.tsx — Admin Inventory Management Component
import { useState } from "react";
import Link from "next/link";
import { formatPHP, type Product } from "@/types";
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/admin/Toast";

interface InventoryClientProps {
  initialProducts: Product[];
}

export default function InventoryClient({ initialProducts }: InventoryClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toasts, showToast, dismissToast } = useToast();

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p))
        );
        showToast(
          `Product status updated to ${!currentStatus ? "Active" : "Inactive"}.`,
          "success"
        );
      } else {
        showToast("Failed to update product status.", "error");
      }
    } catch {
      showToast("Failed to update product status.", "error");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast(`Product "${name}" deleted successfully.`, "success");
      } else {
        showToast(`Failed to delete "${name}".`, "error");
      }
    } catch {
      showToast("Failed to delete product.", "error");
    }
  };

  return (
    <div className="inventory-view">
      <header className="inventory-header">
        <div>
          <h1 className="inventory-title">Inventory Management</h1>
          <p className="inventory-subtitle">Manage seeds, rice varieties, and agricultural produce catalog.</p>
        </div>

        <Link href="/admin/inventory/new" className="add-btn">
          <Plus size={18} aria-hidden="true" />
          <span>Add New Product</span>
        </Link>
      </header>

      {/* Controls Bar */}
      <div className="inventory-controls">
        <div className="search-box">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search product by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          {["all", "seed", "rice", "other"].map((cat) => (
            <button
              key={cat}
              type="button"
              className="filter-btn"
              data-active={categoryFilter === cat}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit Type</th>
              <th>Price (PHP)</th>
              <th>Stock Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-row">
                  No products found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-cell">
                      <span className="prod-name">{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`cat-pill cat-pill--${p.category}`}>{p.category}</span>
                  </td>
                  <td className="unit-cell">{p.unit_type}</td>
                  <td className="price-cell">{formatPHP(p.price_php)}</td>
                  <td>
                    <span className="stock-badge" data-low={p.stock_qty < 50} data-out={p.stock_qty <= 0}>
                      {p.stock_qty > 0 ? `${p.stock_qty} available` : "Out of stock"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="status-toggle-btn"
                      onClick={() => handleToggleStatus(p.id, p.is_active)}
                      title="Click to toggle Active status"
                    >
                      {p.is_active ? (
                        <span className="status-tag status-tag--active">
                          <CheckCircle size={12} aria-hidden="true" /> Active
                        </span>
                      ) : (
                        <span className="status-tag status-tag--inactive">
                          <XCircle size={12} aria-hidden="true" /> Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="action-cell">
                      <Link href={`/admin/inventory/${p.id}`} className="icon-btn" title="Edit Product">
                        <Edit2 size={16} aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        title="Delete Product"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .inventory-view { display: flex; flex-direction: column; gap: var(--space-6); }
        .inventory-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-4); }
        .inventory-title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-primary-dark); margin: 0 0 var(--space-1); }
        .inventory-subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .add-btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-5); background-color: var(--color-primary); color: var(--color-primary-fg); font-size: var(--text-sm); font-weight: 600; border-radius: var(--radius-md); text-decoration: none; transition: background-color var(--dur-fast) var(--ease-out); }
        .add-btn:hover { background-color: var(--color-primary-hover); }

        /* Controls */
        .inventory-controls { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
        .search-box { position: relative; flex: 1; max-width: 360px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-ink-3); }
        .search-input { width: 100%; padding: var(--space-2) var(--space-3) var(--space-2) 36px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }

        .filter-group { display: flex; gap: var(--space-2); }
        .filter-btn { padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-paper); font-size: var(--text-xs); font-weight: 600; cursor: pointer; color: var(--color-ink-2); }
        .filter-btn[data-active="true"] { background-color: var(--color-primary-dark); color: var(--color-primary-fg); border-color: var(--color-primary-dark); }

        /* Table */
        .table-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--text-sm); }
        .admin-table th { padding: var(--space-4); border-bottom: 2px solid var(--color-border); font-size: var(--text-xs); text-transform: uppercase; color: var(--color-ink-2); font-weight: 600; background-color: var(--color-paper-2); }
        .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .empty-row { text-align: center; color: var(--color-ink-3); padding: var(--space-12) !important; }

        .prod-name { font-weight: 600; color: var(--color-heading); }
        .cat-pill { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: var(--radius-full); }
        .cat-pill--seed { background-color: oklch(from var(--color-primary) l c h / 0.12); color: var(--color-primary); }
        .cat-pill--rice { background-color: oklch(from var(--color-accent-dim) l c h / 0.15); color: var(--color-accent-dim); }
        .cat-pill--other { background-color: var(--color-paper-3); color: var(--color-ink-2); }

        .price-cell { font-family: var(--font-mono); font-weight: 600; }
        .unit-cell { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-3); }

        .stock-badge { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-ink-2); }
        .stock-badge[data-low="true"] { color: var(--color-warning); font-weight: 600; }
        .stock-badge[data-out="true"] { color: var(--color-error); font-weight: 600; }

        .status-toggle-btn { background: none; border: none; cursor: pointer; padding: 0; }
        .status-tag { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-xs); font-weight: 600; padding: 2px 8px; border-radius: var(--radius-full); }
        .status-tag--active { background-color: oklch(from var(--color-success) l c h / 0.12); color: var(--color-primary-dark); }
        .status-tag--inactive { background-color: var(--color-paper-3); color: var(--color-ink-3); }

        .action-cell { display: flex; gap: var(--space-2); }
        .icon-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-md); border: 1px solid var(--color-border); background-color: var(--color-paper); color: var(--color-ink-2); text-decoration: none; cursor: pointer; }
        .icon-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .icon-btn--danger:hover { border-color: var(--color-error); color: var(--color-error); }

        .toast-container {
          position: fixed;
          bottom: var(--space-6);
          right: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          z-index: 1000;
          pointer-events: none;
        }
        .toast-container > * {
          pointer-events: auto;
        }
      `}</style>

      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              onDismiss={dismissToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}
