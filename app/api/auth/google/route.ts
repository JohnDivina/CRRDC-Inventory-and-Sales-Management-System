// app/api/auth/google/route.ts — Initiate Google OAuth sign-in for admins
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/api/auth/callback`,
    },
  });

  if (error || !data?.url) {
    console.error("Google OAuth init error:", error);
    return NextResponse.redirect(new URL("/admin/login?error=auth_failed", request.url));
  }

  return NextResponse.redirect(data.url);
}

