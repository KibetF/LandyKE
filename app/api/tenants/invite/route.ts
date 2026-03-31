import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const adminClient = createAdminClient();

  // Verify the caller is the admin
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId, email } = await req.json();
  if (!tenantId || !email) {
    return NextResponse.json({ error: "tenantId and email are required" }, { status: 400 });
  }

  // Verify tenant exists
  const { data: tenant, error: tenantError } = await adminClient
    .schema("landyke")
    .from("tenants")
    .select("id, full_name, user_id")
    .eq("id", tenantId)
    .single();

  if (tenantError || !tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  if (tenant.user_id) {
    return NextResponse.json({ error: "Tenant already has a portal account" }, { status: 400 });
  }

  // Create a Supabase auth user for the tenant
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user.id;

  // Link tenant record to the new auth user
  const { error: linkError } = await adminClient
    .schema("landyke")
    .from("tenants")
    .update({ user_id: userId, email })
    .eq("id", tenantId);

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  // Insert user role
  const { error: roleError } = await adminClient
    .schema("landyke")
    .from("user_roles")
    .insert({ user_id: userId, role: "tenant" });

  if (roleError) {
    console.error("Failed to insert user role:", roleError.message);
  }

  // Generate an invite link for the tenant to set their password
  const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/setup-password`,
    },
  });

  if (linkErr) {
    return NextResponse.json(
      { message: "Account created but failed to generate invite link", error: linkErr.message },
      { status: 200 }
    );
  }

  return NextResponse.json({
    message: "Tenant invited successfully",
    inviteLink: linkData.properties?.action_link || null,
  });
}
