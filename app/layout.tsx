// app/layout.tsx — Root layout (Server Component)
// Hallmark: N6 Masthead nav + Ft5 Statement footer via public layout
import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { LanguageProvider } from "@/components/layout/LanguageContext";
import LanguageToggle from "@/components/layout/LanguageToggle";
import PageLoadingOverlay from "@/components/layout/PageLoadingOverlay";

export const metadata: Metadata = {
  title: {
    template: "%s | CRRDC — CLSU",
    default: "CRRDC Agricultural Products | Central Luzon State University",
  },
  description:
    "The Crops and Resources Research and Development Center (CRRDC) of Central Luzon State University distributes certified seeds, quality rice, and agricultural products to farmers and the public.",
  keywords: [
    "CRRDC", "CLSU", "seeds", "rice", "agricultural products",
    "Central Luzon State University", "Philippine agriculture",
  ],
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: "CRRDC — CLSU Agricultural Products",
  },
  icons: {
    icon: [
      { url: "/images/crrdc-logo.png", type: "image/png" },
    ],
    shortcut: ["/images/crrdc-logo.png"],
    apple: [
      { url: "/images/crrdc-logo.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <PageLoadingOverlay />
            {children}
            <LanguageToggle />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
