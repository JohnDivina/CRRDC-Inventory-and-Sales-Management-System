// app/(admin)/scanner/page.tsx — Admin QR Scanner Server Page
import type { Metadata } from "next";
import { Suspense } from "react";
import ScannerClient from "./ScannerClient";

export const metadata: Metadata = {
  title: "QR Code Scanner | Admin — CRRDC",
  description: "Scan customer order QR codes to confirm in-person payments and fulfill orders.",
};

export default function ScannerPage() {
  return (
    <Suspense fallback={<div className="page-loading">Loading scanner...</div>}>
      <ScannerClient />
    </Suspense>
  );
}
