// app/api/auth/google/route.ts — Initiate Google OAuth sign-in for admins
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function handleAuth(request: Request) {
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
    return NextResponse.redirect(new URL("/admin/login?error=auth_failed", request.url), 303);
  }

  // Use status 303 See Other so the browser switches from POST to GET when redirecting to Supabase
  return NextResponse.redirect(data.url, 303);
}

export async function GET(request: Request) {
  return handleAuth(request);
}

export async function POST(request: Request) {
  return handleAuth(request);
}


