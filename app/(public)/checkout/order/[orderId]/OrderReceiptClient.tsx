"use client";

// app/(public)/checkout/order/[orderId]/OrderReceiptClient.tsx — Interactive Order Receipt Client
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPHP, breakdownRiceQty, type Order, type OrderItem } from "@/types";
import { generateQRDataURL } from "@/lib/qr";
import { useLanguage } from "@/components/layout/LanguageContext";
import { CheckCircle2, Clock, ArrowLeft, RefreshCw, Printer, XCircle } from "lucide-react";

interface OrderReceiptClientProps {
  order: Order;
  items: OrderItem[];
}

export default function OrderReceiptClient({ order: initialOrder, items }: OrderReceiptClientProps) {
  const { t } = useLanguage();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generateQRDataURL(order.qr_payload)
      .then(setQrDataUrl)
      .catch((err) => console.error(err));
  }, [order.qr_payload]);

  // Optional status refresh helper
  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok) setOrder(data.data);
      }
    } catch {
      // Ignore transient errors
    } finally {
      setRefreshing(false);
    }
  };

  const isCompleted = order.status === "completed";

  return (
    <div className="receipt-page">
      <div className="receipt-container">
        <Link href="/catalog" className="back-link no-print">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{t("backToCatalog")}</span>
        </Link>

        <div className="receipt-card">
          <div className="receipt-header">
            <div className="receipt-status-badge" data-status={order.status}>
              {isCompleted ? (
                <>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>COMPLETED &amp; PAID</span>
                </>
              ) : (
                <>
                  <Clock size={18} aria-hidden="true" />
                  <span>PENDING IN-PERSON PAYMENT</span>
                </>
              )}
            </div>

            <h1 className="receipt-title">Order Receipt</h1>
            <span className="receipt-id">ID: <code>{order.id}</code></span>
            <span className="receipt-date">
              Created: {new Date(order.created_at).toLocaleString("en-PH")}
            </span>
          </div>

          {!isCompleted && qrDataUrl && (
            <div className="receipt-qr-block">
              <img src={qrDataUrl} alt="Order QR Code" className="qr-img" />
              <p className="qr-instruction no-print">
                Present this QR code to the CRRDC administrator upon paying at the center.
              </p>
            </div>
          )}

          <div className="receipt-section">
            <h2 className="section-heading">Order Line Items</h2>
            <div className="items-table">
              {items.map((item) => {
                const isRice = item.unit_type === "kg";
                const breakdown = isRice ? breakdownRiceQty(item.quantity) : null;

                return (
                  <div key={item.id} className="item-row">
                    <div className="item-details">
                      <span className="item-name">{item.product?.name || "Agricultural Product"}</span>
                      <span className="item-meta">
                        {item.quantity} {item.unit_type === "kg" ? "kg" : "unit(s)"} @ {formatPHP(item.unit_price_php)}
                        {isRice && breakdown && breakdown.sacks > 0
                          ? ` (${breakdown.sacks} sack${breakdown.sacks > 1 ? "s" : ""} ${breakdown.looseKg > 0 ? `+ ${breakdown.looseKg} kg` : ""})`
                          : ""}
                      </span>
                    </div>
                    <span className="item-total">{formatPHP(item.line_total_php)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="receipt-summary-block">
            <div className="summary-line summary-line--total">
              <span>Total Paid / Due:</span>
              <span className="total-val">{formatPHP(order.total_price_php)}</span>
            </div>
          </div>

          <div className="receipt-footer-actions no-print">
            <button
              type="button"
              className="refresh-btn"
              onClick={handleRefreshStatus}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? "spin" : ""} aria-hidden="true" />
              <span>Check Order Status</span>
            </button>
            <button
              type="button"
              className="print-btn"
              onClick={() => window.print()}
            >
              <Printer size={14} aria-hidden="true" />
              <span>Print Receipt</span>
            </button>
            <Link href="/catalog" className="cancel-receipt-btn">
              <XCircle size={14} aria-hidden="true" />
              <span>Cancel / Exit Receipt</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .receipt-page { padding-block: var(--space-12); }
        .receipt-container { max-width: 640px; margin-inline: auto; padding-inline: var(--gutter); }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--color-primary);
          text-decoration: none;
          margin-bottom: var(--space-6);
        }

        .receipt-card {
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
        }

        .receipt-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: var(--space-8);
          border-bottom: 1px solid var(--color-border);
          padding-bottom: var(--space-6);
        }
        .receipt-status-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-4);
        }
        .receipt-status-badge[data-status="pending"] {
          background-color: oklch(from var(--color-warning) l c h / 0.15);
          color: var(--color-warning);
        }
        .receipt-status-badge[data-status="completed"] {
          background-color: oklch(from var(--color-success) l c h / 0.15);
          color: var(--color-success);
        }

        .receipt-title {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          color: var(--color-heading);
          margin: 0 0 var(--space-2);
        }
        .receipt-id { font-size: var(--text-xs); color: var(--color-ink-3); margin-bottom: var(--space-1); }
        .receipt-id code { font-family: var(--font-mono); color: var(--color-ink); }
        .receipt-date { font-size: var(--text-xs); color: var(--color-ink-3); }

        .receipt-qr-block {
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          margin-bottom: var(--space-8);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          text-align: center;
        }
        .qr-img { width: 200px; height: 200px; border-radius: var(--radius-md); border: 2px solid var(--color-border); }
        .qr-instruction { font-size: var(--text-xs); color: var(--color-ink-2); max-width: 320px; margin: 0; }

        .receipt-section { margin-bottom: var(--space-6); }
        .section-heading { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-heading); margin: 0 0 var(--space-4); }

        .items-table { display: flex; flex-direction: column; gap: var(--space-4); }
        .item-row { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-border); }
        .item-row:last-child { border-bottom: none; }
        .item-name { font-weight: 600; font-size: var(--text-sm); color: var(--color-ink); display: block; }
        .item-meta { font-size: var(--text-xs); color: var(--color-ink-3); }
        .item-total { font-family: var(--font-mono); font-weight: 600; font-size: var(--text-sm); color: var(--color-ink); }

        .receipt-summary-block {
          background-color: var(--color-paper-2);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin-bottom: var(--space-6);
        }
        .summary-line { display: flex; justify-content: space-between; align-items: baseline; font-size: var(--text-base); font-weight: 700; }
        .total-val { font-family: var(--font-mono); font-size: var(--text-xl); color: var(--color-primary); }

        .receipt-footer-actions {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
        .refresh-btn, .print-btn, .cancel-receipt-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background-color var(--dur-fast) var(--ease-out);
        }
        .refresh-btn {
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
          border: none;
        }
        .print-btn {
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          color: var(--color-ink);
        }
        .cancel-receipt-btn {
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          color: var(--color-error);
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        @media print {
          .no-print { display: none !important; }
          .receipt-page { padding: 0 !important; }
          .receipt-card { border: none !important; padding: 0 !important; box-shadow: none !important; background: white !important; color: black !important; }
          .qr-img { width: 60% !important; height: auto !important; margin-inline: auto !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
