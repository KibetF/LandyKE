import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// Only routes listed here get the session-refresh middleware. Server
// components can't write cookies, so every page rendered by one must be
// matched; API route handlers refresh cookies themselves via createClient(),
// and marketing pages never read auth. If you add a new protected route
// group, add its prefix here.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/properties/:path*",
    "/tenants/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/maintenance/:path*",
    "/documents/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/my/:path*",
    "/caretaker/:path*",
    "/login",
    "/tenant-login",
  ],
};
