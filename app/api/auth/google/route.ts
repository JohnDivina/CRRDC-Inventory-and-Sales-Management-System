// app/api/auth/google/route.ts — Initiate Google OAuth sign-in for admins
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${requestUrl.origin}/api/auth/callback`,
    },
  });

  if (error || !data.url) {
    // Dev fallback if OAuth credentials aren't configured yet
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.redirect(data.url);
}
