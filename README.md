# LandyKe — Property Management, Simplified

Professional property management web app for Kenya. Features a public marketing site and an authenticated client dashboard for landlords.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + CSS variables
- **Auth & Database:** Supabase
- **Charts:** Recharts
- **Icons:** Lucide React
- **Deployment:** Vercel

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd landyke
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase project URL and anon key.

4. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Run the migration to create tables:
   - Go to SQL Editor in your Supabase dashboard
   - Paste and run `supabase/migrations/001_schema.sql`
3. Create a test user in Authentication → Users:
   - Email: `margaret@landyke.co.ke`
   - Password: `password123`
4. Update the UUID in `supabase/seed.sql` with the new user's ID, then run the seed SQL.
5. Copy your project URL and anon key from Settings → API into `.env.local`.

## Vercel Deployment

1. Push your repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Project Structure

```
app/
  (marketing)/     → Public marketing site (/)
  (auth)/login/    → Login page (/login)
  (portal)/        → Auth-protected dashboard
    dashboard/     → Main dashboard (/dashboard)
    properties/    → Properties page (/properties)
    tenants/       → Tenants page (/tenants)
    payments/      → Payments page (/payments)

components/
  marketing/       → Navbar, Hero, Stats, Services, etc.
  dashboard/       → Sidebar, KPIs, Charts, Lists
  ui/              → Reusable UI components

lib/supabase/      → Supabase client setup
supabase/          → Migrations and seed data
```
