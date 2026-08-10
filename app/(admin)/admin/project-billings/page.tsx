// app/(admin)/admin/project-billings/page.tsx — Project Billings Server Page
import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectBillingsClient from "./ProjectBillingsClient";

export const metadata: Metadata = {
  title: "Project Billings & Follow-Up | Admin — CRRDC",
  description: "Track deferred project-based payments and monthly 20th follow-up dates.",
};

export default function ProjectBillingsPage() {
  return (
    <Suspense fallback={<div className="page-loading">Loading project billings...</div>}>
      <ProjectBillingsClient />
    </Suspense>
  );
}
