// app/(admin)/layout.tsx — Admin Layout (Server Component)
import AdminShellClient from "@/components/admin/AdminShellClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Safely attempt to get the current user — falls back to a dev placeholder
  // when Supabase credentials aren't configured yet.
  let adminEmail = "admin@clsu.edu.ph";
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isRealSupabase =
      url.length > 0 && !url.includes("your-project.supabase.co");
    if (isRealSupabase) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) adminEmail = user.email;
    }
  } catch {
    // Supabase not available — use placeholder in dev mode
  }

  return (
    <AdminShellClient adminEmail={adminEmail}>
      {children}
    </AdminShellClient>
  );
}
