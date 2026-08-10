// app/(admin)/admin/releases/page.tsx — Seed Lab Release Queue Page
import type { Metadata } from "next";
import { Suspense } from "react";
import ReleasesClient from "./ReleasesClient";

export const metadata: Metadata = {
  title: "Seed Lab Item Releases | Admin — CRRDC",
  description: "Fulfill and release confirmed orders to customers in person.",
};

export default function SeedLabReleasesPage() {
  return (
    <Suspense fallback={<div className="page-loading">Loading release queue...</div>}>
      <ReleasesClient />
    </Suspense>
  );
}
