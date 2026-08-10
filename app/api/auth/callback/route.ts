// app/api/auth/callback/route.ts — Supabase OAuth callback route handler
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;
      const email = user.email || "";

      // Restrict access strictly to @clsu.edu.ph domain
      if (email.endsWith("@clsu.edu.ph")) {
        try {
          const adminClient = createAdminClient();
          const { data: profile } = await adminClient
            .from("admin_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!profile) {
            // Auto-create pending profile request for new CLSU staff
            const fullName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              email.split("@")[0];

            await adminClient.from("admin_profiles").insert({
              id: user.id,
              email: email,
              full_name: fullName,
              role: "admin",
              status: "pending",
            });

            return NextResponse.redirect(`${origin}/admin/pending-approval`);
          }

          if (profile.status === "pending") {
            return NextResponse.redirect(`${origin}/admin/pending-approval`);
          }

          if (profile.status === "suspended") {
            await supabase.auth.signOut();
            return NextResponse.redirect(
              `${origin}/admin/login?error=account_suspended`
            );
          }

          return NextResponse.redirect(`${origin}${next}`);
        } catch {
          // If admin_profiles table is not ready yet, fallback gracefully
          return NextResponse.redirect(`${origin}${next}`);
        }
      } else {
        // Sign out unauthorized user and redirect back with error
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/admin/login?error=unauthorized_domain`
        );
      }
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
}
