import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  // Verify the requester is admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, email, phone, password } = body;

  if (!full_name || !email || !password) {
    return NextResponse.json(
      { error: "full_name, email, and password are required" },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  // Create auth user
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    return NextResponse.json(
      { error: `Auth error: ${authError.message}` },
      { status: 400 }
    );
  }

  // Insert landlord row
  const { data: landlord, error: landlordError } = await adminClient
    .schema("landyke")
    .from("landlords")
    .insert({
      user_id: authData.user.id,
      full_name,
      email,
      phone: phone || null,
    })
    .select()
    .single();

  if (landlordError) {
    // Clean up the auth user if landlord insert fails
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { error: `Landlord insert error: ${landlordError.message}` },
      { status: 400 }
    );
  }

  return NextResponse.json({ landlord }, { status: 201 });
}
