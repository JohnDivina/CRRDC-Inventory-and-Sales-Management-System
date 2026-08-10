// app/api/admin/accounts/route.ts — Master Admin accounts management API
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: profiles, error } = await supabase
      .from("admin_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, data: profiles || [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { profileId, role, status, position, designation, office } = body;

    if (!profileId) {
      return NextResponse.json({ ok: false, error: "Missing profileId" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updateData: any = {};

    if (role) updateData.role = role;
    if (status) {
      updateData.status = status;
      if (status === "active") {
        updateData.approved_at = new Date().toISOString();
      }
    }
    if (position !== undefined) updateData.position = position;
    if (designation !== undefined) updateData.designation = designation;
    if (office !== undefined) updateData.office = office;


    const { error } = await supabase
      .from("admin_profiles")
      .update(updateData)
      .eq("id", profileId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
