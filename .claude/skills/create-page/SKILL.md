---
name: create-page
description: Scaffold a new page in the tenant, landlord, or caretaker portal
disable-model-invocation: true
arguments: [portal, page-name]
argument-hint: "[tenant|landlord|caretaker] [page-name]"
---

Scaffold a new page in the LandyKE app for the specified portal.

## Steps

1. Determine the route group and file path based on the portal argument:
   - `tenant` → `app/(tenant)/my/$page-name/page.tsx`
   - `landlord` → `app/(portal)/$page-name/page.tsx`
   - `caretaker` → `app/(caretaker)/caretaker/$page-name/page.tsx`

2. Create the **server component page** at the path above.

3. Create a corresponding **client component** in:
   - `tenant` → `components/tenant/TenantPageName.tsx`
   - `landlord` → `components/dashboard/PageName.tsx`
   - `caretaker` → `components/caretaker/PageName.tsx`

## Server Component Pattern

### Tenant page
```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantByUserId } from "@/lib/queries-tenant";

export default async function TenantPageNamePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/tenant-login");

  const tenant = await getTenantByUserId(supabase, user.id);
  if (!tenant) redirect("/unauthorized");

  // Fetch data using Promise.all for parallel queries
  const [items] = await Promise.all([
    // Add queries from lib/queries-tenant.ts here
  ]);

  return <TenantPageName tenant={tenant} items={items} />;
}
```

### Landlord page
```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLandlord, getProperties } from "@/lib/queries";

export default async function PageNamePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const landlord = await getLandlord(supabase, user.id);
  if (!landlord) redirect("/unauthorized");

  const properties = await getProperties(supabase, landlord.id);

  return <PageName landlord={landlord} properties={properties} />;
}
```

## Client Component Pattern

```tsx
"use client";

import { useState } from "react";

interface Props {
  // Define props matching what the server component passes
}

export default function ComponentName({ ...props }: Props) {
  return (
    <div>
      <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 300, color: "var(--ink)" }}>
        Page Title
      </h1>
      {/* Page content */}
    </div>
  );
}
```

## Style Conventions

- Use inline styles with CSS variables: `--ink`, `--gold`, `--muted`, `--warm`, `--white`, `--green`, `--green-light`, `--amber-light`
- Background: `#f7f5f2` (set by layout, not individual pages)
- Headings: `className="font-serif"` with `fontSize: "2rem"`, `fontWeight: 300`
- Layout: flex-based with `padding: "2rem 2.5rem"`

## Data Access

- Tenant queries: `lib/queries-tenant.ts` — add new query functions here if needed
- Landlord queries: `lib/queries.ts` — add new query functions here if needed
- Caretaker queries: `lib/queries-caretaker.ts` — add new query functions here if needed
- All query functions take `SupabaseClient` as first argument
- Always use `.schema("landyke")` on every Supabase query

## Middleware

No changes needed — route protection is already handled in `lib/supabase/middleware.ts` for `/my/*`, `/dashboard`, `/caretaker/*` paths. If the new page is under a new top-level path, add it to the middleware's protected paths array.
