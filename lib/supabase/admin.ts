// lib/supabase/admin.ts
// Service-role Supabase client — bypasses RLS.
// ONLY use in server-side API routes that have already verified admin identity.
// NEVER expose to the browser or import in Client Components.
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
