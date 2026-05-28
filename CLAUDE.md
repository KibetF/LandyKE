# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LandyKE is a property management web app for the Kenyan market. It has a public marketing site and authenticated portals for three user roles: landlords, tenants, and caretakers.

## Commands

```bash
npm run dev      # Start dev server (Next.js on localhost:3000)
npm run build    # Production build
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
```

No test framework is configured.

## Architecture

**Framework:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase (auth + Postgres).

### Route Groups

- `app/(marketing)/` — Public pages (`/`, `/about`, `/services/*`, `/privacy`, `/terms`)
- `app/(auth)/` — Auth pages (`/login`, `/tenant-login`, `/setup-password`, `/unauthorized`)
- `app/(portal)/` — Landlord dashboard (`/dashboard`, `/properties`, `/tenants`, `/payments`, `/reports`, `/maintenance`, `/documents`, `/settings`, `/admin`)
- `app/(tenant)/my/` — Tenant portal (`/my/dashboard`, `/my/statement`, `/my/maintenance`, `/my/documents`, `/my/wifi`, `/my/profile`)
- `app/(caretaker)/caretaker/` — Caretaker portal (`/caretaker/dashboard`)
- `app/api/` — API routes namespaced by role: `admin/`, `tenant/`, `caretaker/`, `landlord/`

### Supabase

- All tables live in a **custom schema `landyke`** (not `public`). Every query uses `.schema("landyke")`.
- Three Supabase client helpers in `lib/supabase/`:
  - `client.ts` — browser client (anon key)
  - `server.ts` — server component client (anon key + cookie handling)
  - `admin.ts` — service-role client for admin operations (uses `SUPABASE_SERVICE_ROLE_KEY`)
  - `middleware.ts` — session refresh + role-based route protection
- Migrations are numbered sequentially in `supabase/migrations/` (e.g., `001_schema.sql` through `010_deposits.sql`).

### Data Access

- `lib/queries.ts` — landlord-scoped queries (properties, tenants, payments)
- `lib/queries-tenant.ts` — tenant-scoped queries
- `lib/queries-caretaker.ts` — caretaker-scoped queries
- All query functions take a `SupabaseClient` as first argument.

### Auth & Middleware

Middleware in `lib/supabase/middleware.ts` enforces role-based access:
- `/dashboard`, `/properties`, etc. require landlord/admin auth
- `/my/*` requires tenant auth (redirects to `/tenant-login`)
- `/caretaker/*` requires caretaker auth
- Role is determined from `landyke.user_roles` table

### Components

- `components/admin/` — Admin-only views (landlord management, WiFi, deposits)
- `components/dashboard/` — Landlord dashboard widgets
- `components/marketing/` — Public site components
- `components/tenant/` — Tenant portal components
- `components/ui/` — Shared reusable components (Pagination, StatusPill, etc.)

### Additional Services

- `lib/pdf/` — PDF generation (jspdf + jspdf-autotable) for rent statements
- `lib/sms/` — SMS via Africa's Talking / Twilio
- `lib/notifications.ts` — In-app notification helpers

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

## Fonts

Two Google Fonts loaded in root layout:
- Cormorant Garamond (`--font-cormorant`) — headings/display
- DM Sans (`--font-dm-sans`) — body text

## Deployment

Deployed to Vercel (region: `lhr1`). Push to GitHub triggers auto-deploy.
