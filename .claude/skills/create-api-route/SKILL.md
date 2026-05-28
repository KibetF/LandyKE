---
name: create-api-route
description: Scaffold a new API route for admin, tenant, or landlord operations
disable-model-invocation: true
arguments: [role, resource]
argument-hint: "[admin|tenant|landlord|caretaker] [resource-name]"
---

Scaffold a new Next.js API route for the LandyKE project.

## Steps

1. Create the route file at `app/api/$role/$resource/route.ts`.
2. Include GET and POST handlers by default. Add PATCH and DELETE if the resource is a CRUD entity.

## Route Patterns by Role

### Admin routes

Admin routes verify the user's email against `process.env.ADMIN_EMAIL` and use the service-role client for data operations.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;

  return user;
}

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .schema("landyke")
    .from("table_name")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  // Validate required fields
  if (!body.required_field) {
    return NextResponse.json({ error: "required_field is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .schema("landyke")
    .from("table_name")
    .insert({ ...body })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Create notification for the landlord
  if (data) {
    await createNotification(
      adminClient,
      body.landlord_id,
      "event_type",
      "Notification Title",
      "Notification description",
      { id: data.id }
    );
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
```

### Tenant routes

Tenant routes verify auth via the regular client and look up the tenant record by `user_id`.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: tenant } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("id, property_id")
    .eq("user_id", user.id)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 403 });
  }

  // Query data scoped to this tenant
  const { data, error } = await supabase
    .schema("landyke")
    .from("table_name")
    .select("*")
    .eq("tenant_id", tenant.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: tenant } = await supabase
    .schema("landyke")
    .from("tenants")
    .select("id, property_id, unit_number, full_name")
    .eq("user_id", user.id)
    .single();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 403 });
  }

  const body = await req.json();
  // Validate input

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .schema("landyke")
    .from("table_name")
    .insert({
      tenant_id: tenant.id,
      property_id: tenant.property_id,
      ...body,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Created successfully" }, { status: 201 });
}
```

### Landlord routes

Landlord routes verify auth and look up the landlord record.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLandlord } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const landlord = await getLandlord(supabase, user.id);
  if (!landlord) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .schema("landyke")
    .from("table_name")
    .select("*")
    .eq("landlord_id", landlord.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}
```

## Key Rules

- **Always** use `.schema("landyke")` on every Supabase query
- **Response format**: `{ error: "message" }` for errors, `{ resource: data }` for success
- **Status codes**: 201 for creation, 400 for validation errors, 401 for unauthenticated, 403 for unauthorized, 500 for server errors
- **Admin writes** use `createAdminClient()` (service role, bypasses RLS)
- **Tenant/landlord reads** use `createClient()` (respects RLS)
- **Notifications**: call `createNotification()` from `@/lib/notifications` when creating or updating important records
