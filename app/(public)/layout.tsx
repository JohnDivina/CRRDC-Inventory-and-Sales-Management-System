// app/(public)/layout.tsx — Public layout wrapper (Server Component)
// Wraps all guest-accessible routes with Masthead + Footer
import Masthead from "@/components/layout/Masthead";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Masthead />
      <main id="main-content" className="page-enter">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
