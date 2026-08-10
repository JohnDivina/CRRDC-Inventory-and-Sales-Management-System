// app/(admin)/layout.tsx — Strict Admin Layout Auth Guard (Server Component)
import { redirect } from "next/navigation";
import AdminShellClient from "@/components/admin/AdminShellClient";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let adminEmail = "admin@clsu.edu.ph";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isRealSupabase =
    url.length > 0 && !url.includes("your-project.supabase.co");

  if (isRealSupabase) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Unauthenticated -> Redirect immediately to login
      if (!user || !user.email) {
        redirect("/admin/login");
      }

      adminEmail = user.email;

      // Check admin profile approval status
      const isMasterAdminEmail =
        adminEmail.toLowerCase().includes("johnrey_divina") ||
        adminEmail.toLowerCase().includes("johnreydivina") ||
        adminEmail.toLowerCase() === "johnrey_divina@clsu.edu.ph";

      if (!isMasterAdminEmail) {
        const adminClient = createAdminClient();
        const { data: profile } = await adminClient
          .from("admin_profiles")
          .select("status")
          .eq("id", user.id)
          .single();

        if (!profile || profile.status !== "active") {
          redirect("/admin/pending-approval");
        }
      }
    } catch (err: any) {
      // If next/navigation redirect exception, rethrow
      if (err?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      // If DB error, redirect to login for safety
      redirect("/admin/login");
    }
  }

  return (
    <AdminShellClient adminEmail={adminEmail}>
      {children}
    </AdminShellClient>
  );
}
