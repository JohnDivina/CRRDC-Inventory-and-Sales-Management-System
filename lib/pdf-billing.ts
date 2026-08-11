// lib/pdf-billing.ts — Official CRRDC Billing Statement & Seed Lab Release Statement Generator
import { jsPDF } from "jspdf";
import type { Order, OrderItem } from "@/types";
import { formatPHP } from "@/types";

export function generateBillingStatement(
  order: Order,
  items: OrderItem[],
  processedByName: string = "CRRDC Main Cashier"
) {
  const doc = new jsPDF();

  // 1. Header Banner
  doc.setFillColor(30, 96, 49); // CRRDC Primary Dark Green
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("CENTRAL LUZON STATE UNIVERSITY", 105, 12, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("CROP RESEARCH & RESOURCES DEVELOPMENT CENTER (CRRDC)", 105, 20, { align: "center" });
  doc.setFontSize(8);
  doc.text("Science City of Muñoz, Nueva Ecija, Philippines · crrdc@clsu.edu.ph", 105, 26, { align: "center" });

  // 2. Statement Document Title
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL BILLING STATEMENT & SEED LAB RELEASE PASS", 14, 44);

  // 3. Billing Reference Box
  doc.setFillColor(245, 247, 245);
  doc.setDrawColor(200, 220, 200);
  doc.roundedRect(14, 48, 182, 30, 3, 3, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 96, 49);
  doc.text(`BILLING REFERENCE NO: ${order.billing_number || "PENDING-CONFIRMATION"}`, 20, 56);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(`System Order ID: ${order.id}`, 20, 63);
  doc.text(`Date & Time: ${new Date(order.confirmed_at || order.created_at).toLocaleString("en-PH")}`, 20, 70);

  doc.setFont("helvetica", "bold");
  doc.text(`Processed By Cashier:`, 120, 56);
  doc.setFont("helvetica", "normal");
  doc.text(processedByName, 120, 63);
  doc.text(`Order Category: ${String(order.order_type || "regular").toUpperCase()}`, 120, 70);

  // 4. Customer Information Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Customer Information:", 14, 86);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${order.customer_name || "Guest Customer"}`, 14, 92);
  if (order.customer_org) doc.text(`Organization / Center: ${order.customer_org}`, 14, 98);
  if (order.purpose) doc.text(`Purpose: ${order.purpose}`, 14, 104);
  if (order.preferred_pickup_date) doc.text(`Preferred Pickup Date: ${order.preferred_pickup_date}`, 120, 92);

  // 5. Line Items Table
  let y = 114;
  doc.setFillColor(30, 96, 49);
  doc.rect(14, y, 182, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Item Description / Variety", 18, y + 5);
  doc.text("Qty", 125, y + 5, { align: "center" });
  doc.text("Unit Price", 155, y + 5, { align: "right" });
  doc.text("Total Value", 192, y + 5, { align: "right" });

  y += 12;
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");

  (items || []).forEach((item) => {
    const itemName = item.product?.name || "Agricultural Product";
    const qtyText = `${item.quantity} ${item.unit_type === "kg" ? "kg" : "unit(s)"}`;
    const priceText = formatPHP(item.unit_price_php);
    const lineTotalText = formatPHP(item.line_total_php);

    doc.text(itemName, 18, y);
    doc.text(qtyText, 125, y, { align: "center" });
    doc.text(priceText, 155, y, { align: "right" });
    doc.text(lineTotalText, 192, y, { align: "right" });

    y += 7;
  });

  // 6. Summary Totals Box
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, 196, y);
  y += 8;

  const isComplimentary = (order.order_type || "").toLowerCase() === "complimentary";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Total Valuation:", 120, y);
  doc.text(formatPHP(Number(order.total_price_php || 0)), 192, y, { align: "right" });

  y += 6;
  doc.text("Amount Paid at Cashier:", 120, y);
  doc.text(isComplimentary ? "₱0.00 (Free Token)" : formatPHP(Number(order.amount_paid_php ?? order.total_price_php ?? 0)), 192, y, { align: "right" });

  // 7. Physical Presentation Instructions & Signature Authorization Blocks
  y += 18;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(248, 113, 113);
  doc.roundedRect(14, y, 182, 16, 2, 2, "FD");

  doc.setTextColor(153, 27, 27);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("NOTICE TO CUSTOMER & SEED LABORATORY STAFF:", 18, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text("Present this official billing statement to the CRRDC Seed Laboratory staff for physical item collection and verification.", 18, y + 11);

  // Signatures
  y += 30;
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  // Cashier signature
  doc.line(20, y, 85, y);
  doc.text("CRRDC Cashier Authorized Stamp / Signature", 20, y + 5);
  doc.text(processedByName, 20, y + 9);

  // Seed Lab receiver signature
  doc.line(125, y, 190, y);
  doc.text("Seed Laboratory Releasing Staff Signature", 125, y + 5);
  doc.text("Date & Time Received: _______________", 125, y + 9);

  // Trigger browser download
  const filename = `CRRDC-Billing-Statement-${order.billing_number || order.id.slice(0, 8)}.pdf`;
  doc.save(filename);
}
