# CRRDC Platform — Production Deployment Guide

## 1. Supabase Environment Setup

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com) and create a new project named `crrdc-platform`.
   - Under **Project Settings → API**, copy your **Project URL**, **Anon Key**, and **Service Role Key**.

2. **Execute Migrations:**
   Open the **SQL Editor** in your Supabase Dashboard and execute the SQL files from the `/supabase/migrations/` folder in order:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_confirm_order_fn.sql`
   - *(Optional dev seed data: `seed.sql`)*

3. **Configure Google OAuth (for Admin Sign-In):**
   - Go to **Authentication → Providers → Google** in Supabase.
   - Enter your **Google Client ID** & **Client Secret** (from Google Cloud Console).
   - Set Authorized Redirect URI to: `https://<your-supabase-project>.supabase.co/auth/v1/callback`

---

## 2. Vercel Deployment

1. **Import Repository to Vercel:**
   - Connect your GitHub repository to Vercel.
   - Framework Preset: **Next.js**
   - Node.js Version: 20.x or 22.x

2. **Environment Variables in Vercel:**
   Set the following environment variables in Vercel project settings:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

3. **Deploy:**
   - Click **Deploy**. Vercel will automatically build the Next.js App Router application.

---

## 3. Post-Deployment Verification

- **Public Surface:** Verify browsing products at `https://your-domain.vercel.app/catalog`, adding to cart, and generating a QR code.
- **Admin Panel:** Sign in at `https://your-domain.vercel.app/admin/login` or access `/admin/dashboard`.
- **QR Scanner:** Open `/admin/scanner` on a mobile device or desktop browser, scan a test order QR code, and verify atomic payment confirmation and stock decrement.
