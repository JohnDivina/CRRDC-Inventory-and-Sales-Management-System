"use client";

// app/(public)/checkout/order/[orderId]/OrderReceiptClient.tsx — Customer Live Order Status Tracker & Receipt
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPHP, breakdownRiceQty, type Order, type OrderItem } from "@/types";
import { generatePDFReceipt } from "@/lib/pdf-receipt";
import { CheckCircle2, Clock, ArrowLeft, RefreshCw, Download, Building2, PackageCheck, Receipt, AlertCircle } from "lucide-react";

interface OrderReceiptClientProps {
  order: Order;
  items: OrderItem[];
}

export default function OrderReceiptClient({ order: initialOrder, items }: OrderReceiptClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [refreshing, setRefreshing] = useState(false);

  // Poll status every 5 seconds for live progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [order.id]);

  const handleRefreshStatus = async () => {
    if (!order?.id) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.data && data.data.id) {
          setOrder((prev) => ({ ...prev, ...data.data }));
        }
      }
    } catch {
      // Ignore network glitches during polling
    } finally {
      setRefreshing(false);
    }
  };

  const isPaymentConfirmed = order?.status === "payment_confirmed" || order?.status === "completed";
  const isCompleted = order?.status === "completed";
  const currentOrderType = (order?.order_type || "regular").toLowerCase();

  return (
    <div className="tracker-page">
      <div className="tracker-container">
        <Link href="/catalog" className="back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Return to Catalog</span>
        </Link>

        {/* 🔴 RED IN-PERSON PAYMENT NOTICE */}
        <div className="red-payment-notice">
          <div className="notice-header">
            <AlertCircle size={20} className="notice-red-icon" aria-hidden="true" />
            <h3 className="notice-red-title">IN-PERSON CASH PAYMENT AT CRRDC CASHIER</h3>
          </div>
          <p className="notice-red-body">
            Please proceed to the <strong>CRRDC Main Cashier</strong> at CLSU and present your <strong>Order ID</strong> below to pay.
          </p>
        </div>

        {/* LIVE 3-STAGE STATUS PROGRESS TRACKER */}
        <div className="status-tracker-card">
          <h2 className="tracker-card-title">Live Transaction Status Tracker</h2>

          <div className="progress-steps">
            {/* Step 1: Cashier Payment */}
            <div className={`step-node ${isPaymentConfirmed ? "step--done" : "step--active"}`}>
              <div className="step-badge">
                {isPaymentConfirmed ? <CheckCircle2 size={20} /> : <Receipt size={20} />}
              </div>
              <div className="step-content">
                <h4 className="step-title">Step 1: CRRDC Cashier Payment</h4>
                <p className="step-desc">
                  {isPaymentConfirmed
                    ? `Payment Confirmed! Billing No: ${order?.billing_number || "Generated"}`
                    : "Proceed to CRRDC Cashier and present your Order ID."}
                </p>
              </div>
            </div>

            <div className={`step-connector ${isPaymentConfirmed ? "connector--active" : ""}`} />

            {/* Step 2: Seed Lab Item Release */}
            <div className={`step-node ${isCompleted ? "step--done" : isPaymentConfirmed ? "step--active" : "step--pending"}`}>
              <div className="step-badge">
                {isCompleted ? <CheckCircle2 size={20} /> : <PackageCheck size={20} />}
              </div>
              <div className="step-content">
                <h4 className="step-title">Step 2: Seed Laboratory Item Release</h4>
                <p className="step-desc">
                  {isCompleted
                    ? "Items successfully released by Seed Lab Staff!"
                    : isPaymentConfirmed
                    ? "Payment verified! Proceed to Seed Lab to collect your items."
                    : "Awaiting Step 1 payment confirmation."}
                </p>
              </div>
            </div>

            <div className={`step-connector ${isCompleted ? "connector--active" : ""}`} />

            {/* Step 3: Transaction Complete */}
            <div className={`step-node ${isCompleted ? "step--done" : "step--pending"}`}>
              <div className="step-badge">
                <CheckCircle2 size={20} />
              </div>
              <div className="step-content">
                <h4 className="step-title">Step 3: Transaction Complete</h4>
                <p className="step-desc">
                  {isCompleted
                    ? "Transaction fully completed. You can now download your official PDF receipt."
                    : "Awaiting completion of previous steps."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS & BILLING SUMMARY */}
        <div className="receipt-card">
          <div className="receipt-header">
            <div>
              <span className="order-id-label">ORDER ID:</span>
              <h1 className="order-id-val">{order?.id || "N/A"}</h1>
              {order?.billing_number && (
                <span className="billing-badge">Billing Reference No: <strong>{order.billing_number}</strong></span>
              )}
            </div>

            {isCompleted && (
              <button
                type="button"
                className="download-pdf-btn"
                onClick={() => generatePDFReceipt(order, items)}
              >
                <Download size={18} aria-hidden="true" />
                <span>Download PDF Receipt</span>
              </button>
            )}
          </div>

          <div className="meta-grid">
            <div className="meta-box">
              <span className="meta-label">Customer Name:</span>
              <strong className="meta-val">{order?.customer_name || "Guest Customer"}</strong>
            </div>
            <div className="meta-box">
              <span className="meta-label">Order Type:</span>
              <strong className="meta-val">{currentOrderType.toUpperCase()}</strong>
            </div>
            {order?.customer_org && (
              <div className="meta-box">
                <span className="meta-label">Organization / Center:</span>
                <strong className="meta-val">{order.customer_org}</strong>
              </div>
            )}
            {order?.preferred_pickup_date && (
              <div className="meta-box">
                <span className="meta-label">Preferred Pickup Date:</span>
                <strong className="meta-val">{order.preferred_pickup_date}</strong>
              </div>
            )}
          </div>

          <div className="items-section">
            <h3 className="section-heading">Order Line Items</h3>
            <div className="items-table">
              {(items || []).map((item) => {
                const isRice = item.unit_type === "kg";
                const breakdown = isRice ? breakdownRiceQty(item.quantity) : null;
                return (
                  <div key={item.id} className="item-row">
                    <div>
                      <strong className="item-name">{item.product?.name || "Agricultural Item"}</strong>
                      <span className="item-qty">
                        {item.quantity} {item.unit_type === "kg" ? "kg" : "unit(s)"} @ {formatPHP(item.unit_price_php)}
                        {isRice && breakdown && breakdown.sacks > 0
                          ? ` (${breakdown.sacks} sack${breakdown.sacks > 1 ? "s" : ""} ${breakdown.looseKg > 0 ? `+ ${breakdown.looseKg} kg` : ""})`
                          : ""}
                      </span>
                    </div>
                    <span className="item-price">{formatPHP(item.line_total_php)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-row">
              <span>Total Recorded Value:</span>
              <strong className="summary-price">{formatPHP(Number(order?.total_price_php || 0))}</strong>
            </div>
            <div className="summary-row">
              <span>Amount Paid:</span>
              <strong className="summary-price">
                {currentOrderType === "complimentary" ? "₱0.00 (Complimentary)" : formatPHP(Number(order?.amount_paid_php ?? order?.total_price_php ?? 0))}
              </strong>
            </div>
          </div>


          <div className="card-footer">
            <button type="button" onClick={handleRefreshStatus} disabled={refreshing} className="refresh-btn">
              <RefreshCw size={14} className={refreshing ? "spin" : ""} aria-hidden="true" />
              <span>Refresh Status Now</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .tracker-page { padding-block: var(--space-8); }
        .tracker-container { max-width: 680px; margin-inline: auto; padding-inline: var(--gutter); display: flex; flex-direction: column; gap: var(--space-6); }

        .back-link { display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); font-weight: 600; color: var(--color-primary); text-decoration: none; }

        /* RED PAYMENT NOTICE */
        .red-payment-notice { background-color: #fef2f2; border: 2px solid #ef4444; border-radius: var(--radius-xl); padding: var(--space-4) var(--space-6); display: flex; flex-direction: column; gap: 4px; }
        .notice-header { display: flex; align-items: center; gap: var(--space-2); }
        .notice-red-icon { color: #dc2626; }
        .notice-red-title { font-family: var(--font-display); font-size: var(--text-base); color: #991b1b; margin: 0; font-weight: 800; }
        .notice-red-body { font-size: var(--text-xs); color: #7f1d1d; margin: 0; }

        /* STATUS TRACKER */
        .status-tracker-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); }
        .tracker-card-title { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-heading); margin: 0 0 var(--space-6); }

        .progress-steps { display: flex; flex-direction: column; gap: 0; position: relative; }
        .step-node { display: flex; align-items: flex-start; gap: var(--space-4); }
        .step-badge { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background-color: var(--color-paper-3); color: var(--color-ink-3); }
        .step--done .step-badge { background-color: var(--color-primary); color: var(--color-primary-fg); }
        .step--active .step-badge { background-color: oklch(from var(--color-warning) l c h / 0.2); color: var(--color-warning); border: 2px solid var(--color-warning); }

        .step-content { display: flex; flex-direction: column; gap: 2px; }
        .step-title { font-size: var(--text-sm); font-weight: 700; color: var(--color-heading); margin: 0; }
        .step-desc { font-size: var(--text-xs); color: var(--color-ink-2); margin: 0; }

        .step-connector { width: 2px; height: 28px; background-color: var(--color-border); margin-left: 17px; margin-block: 4px; }
        .connector--active { background-color: var(--color-primary); }

        /* RECEIPT CARD */
        .receipt-card { background-color: var(--color-paper); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6); }
        .receipt-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-4); }
        .order-id-label { font-size: 0.65rem; color: var(--color-ink-3); font-weight: 700; letter-spacing: 0.05em; }
        .order-id-val { font-family: var(--font-mono); font-size: var(--text-lg); color: var(--color-heading); margin: 0 0 var(--space-1); }
        .billing-badge { font-size: var(--text-xs); color: var(--color-primary); font-weight: 600; display: block; }

        .download-pdf-btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-5); background-color: var(--color-primary); color: var(--color-primary-fg); border: none; border-radius: var(--radius-md); font-weight: 600; font-size: var(--text-xs); cursor: pointer; }

        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); background-color: var(--color-paper-2); padding: var(--space-4); border-radius: var(--radius-lg); }
        .meta-box { display: flex; flex-direction: column; gap: 2px; }
        .meta-label { font-size: 0.7rem; color: var(--color-ink-3); text-transform: uppercase; }
        .meta-val { font-size: var(--text-xs); color: var(--color-heading); }

        .items-section { display: flex; flex-direction: column; gap: var(--space-3); }
        .section-heading { font-family: var(--font-display); font-size: var(--text-sm); color: var(--color-heading); margin: 0; }
        .items-table { display: flex; flex-direction: column; gap: var(--space-2); }
        .item-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--space-2); border-bottom: 1px dashed var(--color-border); }
        .item-name { font-size: var(--text-xs); color: var(--color-heading); display: block; }
        .item-qty { font-size: 0.7rem; color: var(--color-ink-3); }
        .item-price { font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 700; color: var(--color-heading); }

        .summary-section { background-color: var(--color-paper-2); padding: var(--space-4); border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: var(--space-2); }
        .summary-row { display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-ink-2); }
        .summary-price { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-primary); }

        .card-footer { display: flex; justify-content: flex-end; }
        .refresh-btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border); background: var(--color-paper); border-radius: var(--radius-md); font-size: var(--text-xs); font-weight: 600; cursor: pointer; color: var(--color-ink-2); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
