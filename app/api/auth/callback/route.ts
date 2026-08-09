// app/api/auth/callback/route.ts — Supabase OAuth callback route handler
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const email = data.user.email || "";
      // Restrict access strictly to @clsu.edu.ph domain
      if (email.endsWith("@clsu.edu.ph")) {
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        // Sign out unauthorized user and redirect back with error
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/admin/login?error=unauthorized_domain`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
}

