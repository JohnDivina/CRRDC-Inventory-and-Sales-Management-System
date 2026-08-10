// lib/pdf-receipt.ts — Official CRRDC PDF Receipt Generator
import { jsPDF } from "jspdf";
import type { Order, OrderItem } from "@/types";
import { formatPHP } from "@/types";

export function generatePDFReceipt(order: Order, items: OrderItem[]) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(30, 96, 49); // CRRDC Green
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CENTRAL LUZON STATE UNIVERSITY", 105, 12, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("CROP RESEARCH & RESOURCES DEVELOPMENT CENTER (CRRDC)", 105, 20, { align: "center" });
  doc.setFontSize(9);
  doc.text("Science City of Muñoz, Nueva Ecija, Philippines · crrdc@clsu.edu.ph", 105, 26, { align: "center" });

  // Receipt Details Box
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL TRANSACTION RECEIPT", 14, 44);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Billing Reference No: ${order.billing_number || "PENDING"}`, 14, 52);
  doc.text(`System Order ID: ${order.id}`, 14, 58);
  doc.text(`Date & Time: ${new Date(order.created_at).toLocaleString("en-PH")}`, 14, 64);
  doc.text(`Order Type: ${order.order_type.toUpperCase()}`, 14, 70);

  // Customer Information
  doc.setFont("helvetica", "bold");
  doc.text("Customer Details:", 120, 52);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${order.customer_name || "Guest Customer"}`, 120, 58);
  if (order.customer_org) doc.text(`Organization: ${order.customer_org}`, 120, 64);
  if (order.purpose) doc.text(`Purpose: ${order.purpose}`, 120, 70);

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 76, 196, 76);

  // Items Table Header
  doc.setFillColor(240, 245, 240);
  doc.rect(14, 80, 182, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Item Description", 18, 85.5);
  doc.text("Qty", 120, 85.5, { align: "center" });
  doc.text("Unit Price", 150, 85.5, { align: "right" });
  doc.text("Line Total", 192, 85.5, { align: "right" });

  let y = 94;
  doc.setFont("helvetica", "normal");

  items.forEach((item) => {
    const name = item.product?.name || "Agricultural Product";
    const qty = `${item.quantity} ${item.unit_type}`;
    const price = formatPHP(item.unit_price_php);
    const total = formatPHP(item.line_total_php);

    doc.text(name, 18, y);
    doc.text(qty, 120, y, { align: "center" });
    doc.text(price, 150, y, { align: "right" });
    doc.text(total, 192, y, { align: "right" });
    y += 7;
  });

  doc.line(14, y + 2, 196, y + 2);
  y += 10;

  // Summary Totals
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total Value:", 130, y);
  doc.text(formatPHP(order.total_price_php), 192, y, { align: "right" });

  y += 6;
  doc.text("Amount Paid:", 130, y);
  const amountPaid = order.order_type === "complimentary" ? "₱0.00 (Free)" : formatPHP(order.amount_paid_php || order.total_price_php);
  doc.text(amountPaid, 192, y, { align: "right" });

  // Status Stamp Box
  y += 16;
  doc.setLineWidth(0.8);
  if (order.status === "completed") {
    doc.setDrawColor(30, 96, 49);
    doc.setTextColor(30, 96, 49);
    doc.rect(14, y, 70, 16);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("STATUS: RELEASED & PAID", 49, y + 10, { align: "center" });
  } else if (order.status === "payment_confirmed") {
    doc.setDrawColor(224, 167, 13);
    doc.setTextColor(180, 120, 0);
    doc.rect(14, y, 70, 16);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("STATUS: PAYMENT CONFIRMED", 49, y + 10, { align: "center" });
  } else {
    doc.setDrawColor(150, 150, 150);
    doc.setTextColor(100, 100, 100);
    doc.rect(14, y, 70, 16);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("STATUS: PENDING CASHIER", 49, y + 10, { align: "center" });
  }

  // Footer stamp
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("This is an official system-generated billing document from the CLSU-CRRDC Platform.", 105, 280, { align: "center" });

  // Download PDF
  const filename = `CRRDC-Receipt-${order.billing_number || order.id.slice(0, 8)}.pdf`;
  doc.save(filename);
}
