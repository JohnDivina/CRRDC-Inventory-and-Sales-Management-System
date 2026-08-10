"use client";

// app/(admin)/admin/inventory/InventoryClient.tsx — Admin Inventory & Audit Log Management Component
import { useState } from "react";
import Link from "next/link";
import { formatPHP, type Product, type InventoryAuditLog } from "@/types";
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, History, AlertTriangle } from "lucide-react";
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

  // Audit Log Drawer state
  const [activeAuditProduct, setActiveAuditProduct] = useState<{ id: string; name: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<InventoryAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const lowStockProducts = products.filter(
    (p) => p.stock_qty <= (p.low_stock_threshold || 10)
  );

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAuditLog = async (productId: string, productName: string) => {
    setActiveAuditProduct({ id: productId, name: productName });
    setLoadingAudit(true);
    try {
      const res = await fetch(`/api/admin/audit-log?productId=${productId}`);
      const result = await res.json();
      if (res.ok && result.ok) {
        setAuditLogs(result.data || []);
      }
    } catch {
      showToast("Failed to fetch audit log history.", "error");
    } finally {
      setLoadingAudit(false);
    }
  };

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
        showToast(`Product status updated to ${!currentStatus ? "Active" : "Inactive"}.`, "success");
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
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
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
          <h1 className="inventory-title">Inventory Management &amp; Audit Logs</h1>
          <p className="inventory-subtitle">Manage seeds, rice varieties, low stock thresholds, and edit history.</p>
        </div>

        <Link href="/admin/inventory/new" className="add-btn">
          <Plus size={18} aria-hidden="true" />
          <span>Add New Product</span>
        </Link>
      </header>

      {/* ⚠️ LOW STOCK WARNING BANNER */}
      {lowStockProducts.length > 0 && (
        <div className="low-stock-banner">
          <div className="banner-title-row">
            <AlertTriangle size={20} className="banner-icon" />
            <h3 className="banner-heading">Low Stock Alert ({lowStockProducts.length} Items At Threshold)</h3>
          </div>
          <div className="low-stock-chips">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="stock-chip">
                <span className="chip-name">{p.name}</span>
                <span className="chip-qty">{p.stock_qty} left (Threshold: {p.low_stock_threshold || 10})</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <td colSpan={7} className="empty-row">No products found matching criteria.</td>
              </tr>
            ) : (
              filtered.map((p) => {
                const isLow = p.stock_qty <= (p.low_stock_threshold || 10);
                return (
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
                      <span className="stock-badge" data-low={isLow} data-out={p.stock_qty <= 0}>
                        {p.stock_qty > 0 ? `${p.stock_qty} units` : "Out of stock"}
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
                        <button
                          type="button"
                          className="icon-btn"
                          title="View Inventory Audit Log History"
                          onClick={() => handleOpenAuditLog(p.id, p.name)}
                        >
                          <History size={16} aria-hidden="true" />
                        </button>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Log History Drawer */}
      {activeAuditProduct && (
        <div className="modal-overlay" onClick={() => setActiveAuditProduct(null)}>
          <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3 className="drawer-title">Inventory Audit History</h3>
                <span className="drawer-subtitle">{activeAuditProduct.name}</span>
              </div>
              <button type="button" onClick={() => setActiveAuditProduct(null)} className="close-btn">
                &times;
              </button>
            </div>

            <div className="drawer-body">
              {loadingAudit ? (
                <p className="loading-text">Loading audit logs...</p>
              ) : auditLogs.length === 0 ? (
                <p className="empty-text">No previous audit logs recorded for this product.</p>
              ) : (
                <div className="audit-timeline">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="log-item">
                      <div className="log-header">
                        <span className="log-type">{log.change_type.replace("_", " ").toUpperCase()}</span>
                        <span className="log-date">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <div className="log-change">
                        Stock changed: <code>{log.old_stock_qty}</code> &rarr; <strong>{log.new_stock_qty}</strong>
                      </div>
                      {log.note && <p className="log-note">Note: {log.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toasts.map((toast) => (
        <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} onDismiss={() => dismissToast(toast.id)} />
      ))}


      <style>{`
        .inventory-view { display: flex; flex-direction: column; gap: var(--space-6); max-width: 1100px; }
        .inventory-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-4); }
        .inventory-title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-primary-dark); margin: 0 0 var(--space-1); }
        .inventory-subtitle { font-size: var(--text-sm); color: var(--color-ink-2); margin: 0; }

        .add-btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-5); background-color: var(--color-primary); color: var(--color-primary-fg); border-radius: var(--radius-md); font-weight: 600; text-decoration: none; }

        /* LOW STOCK BANNER */
        .low-stock-banner { background-color: oklch(from var(--color-error) l c h / 0.08); border: 1px solid var(--color-error); border-radius: var(--radius-xl); padding: var(--space-4) var(--space-6); display: flex; flex-direction: column; gap: var(--space-3); }
        .banner-title-row { display: flex; align-items: center; gap: var(--space-2); color: var(--color-error); }
        .banner-heading { font-family: var(--font-display); font-size: var(--text-base); margin: 0; font-weight: 700; }

        .low-stock-chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
        .stock-chip { background-color: var(--color-paper); border: 1px solid oklch(from var(--color-error) l c h / 0.3); padding: 4px 10px; border-radius: var(--radius-full); display: flex; gap: var(--space-2); font-size: var(--text-xs); }
        .chip-name { font-weight: 600; color: var(--color-heading); }
        .chip-qty { color: var(--color-error); font-weight: 700; }

        .inventory-controls { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
        .search-box { position: relative; flex: 1; max-width: 360px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-ink-3); }
        .search-input { width: 100%; padding: var(--space-2) var(--space-3) var(--space-2) 36px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); }

        .filter-group { display: flex; gap: var(--space-2); }
        .filter-btn { padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-paper); font-size: var(--text-xs); font-weight: 600; cursor: pointer; color: var(--color-ink-2); }
        .filter-btn[data-active="true"] { background-color: var(--color-primary-dark); color: var(--color-primary-fg); border-color: var(--color-primary-dark); }

        .table-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--text-sm); }
        .admin-table th { padding: var(--space-4); border-bottom: 2px solid var(--color-border); font-size: var(--text-xs); text-transform: uppercase; color: var(--color-ink-2); font-weight: 600; background-color: var(--color-paper-2); }
        .admin-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }

        .cat-pill { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: var(--radius-full); }
        .cat-pill--seed { background-color: oklch(from var(--color-primary) l c h / 0.15); color: var(--color-primary); }
        .cat-pill--rice { background-color: oklch(from var(--color-accent) l c h / 0.2); color: var(--color-ink); }

        .stock-badge { font-weight: 700; font-size: var(--text-xs); color: var(--color-primary); }
        .stock-badge[data-low="true"] { color: var(--color-error); }
        .stock-badge[data-out="true"] { color: var(--color-ink-3); text-decoration: line-through; }

        .status-toggle-btn { background: none; border: none; padding: 0; cursor: pointer; }
        .status-tag { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-xs); font-weight: 600; padding: 2px 8px; border-radius: var(--radius-full); }
        .status-tag--active { background-color: oklch(from var(--color-success) l c h / 0.15); color: var(--color-primary); }
        .status-tag--inactive { background-color: var(--color-paper-2); color: var(--color-ink-3); }

        .action-cell { display: flex; align-items: center; gap: var(--space-2); }
        .icon-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-md); border: 1px solid var(--color-border); background-color: var(--color-paper); color: var(--color-ink-2); text-decoration: none; cursor: pointer; }
        .icon-btn--danger:hover { color: var(--color-error); border-color: var(--color-error); }

        /* AUDIT DRAWER MODAL */
        .modal-overlay { position: fixed; inset: 0; z-index: 9999; background: oklch(0% 0 0 / 0.5); display: flex; justify-content: flex-end; }
        .drawer-card { background: var(--color-paper); width: 440px; height: 100%; padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); box-shadow: -10px 0 30px oklch(0% 0 0 / 0.2); }
        .drawer-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-4); }
        .drawer-title { font-family: var(--font-display); font-size: var(--text-lg); margin: 0 0 2px; }
        .drawer-subtitle { font-size: var(--text-xs); color: var(--color-primary); font-weight: 600; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-ink-3); }

        .drawer-body { flex: 1; overflow-y: auto; }
        .audit-timeline { display: flex; flex-direction: column; gap: var(--space-3); }
        .log-item { background: var(--color-paper-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-3); font-size: var(--text-xs); }
        .log-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .log-type { font-weight: 700; color: var(--color-primary); font-size: 0.65rem; }
        .log-date { color: var(--color-ink-3); font-size: 0.65rem; }
        .log-change { color: var(--color-heading); }
        .log-note { font-style: italic; color: var(--color-ink-2); margin: 4px 0 0; }
      `}</style>
    </div>
  );
}
