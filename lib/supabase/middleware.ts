import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const landlordPaths = ["/dashboard", "/properties", "/tenants", "/payments", "/reports", "/maintenance", "/documents", "/settings", "/admin"];
  const tenantPaths = ["/my"];
  const caretakerPaths = ["/caretaker"];

  const isLandlordProtected = landlordPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );
  const isTenantProtected = tenantPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );
  const isCaretakerProtected = caretakerPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isLandlordProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isTenantProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/tenant-login";
    return NextResponse.redirect(url);
  }

  if (isCaretakerProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Post-login role-aware redirect. Only fires on /login itself —
  // landlord/admin pages don't need a per-request role check because the
  // portal layout already redirects users without a landlord row to /unauthorized.
  if (request.nextUrl.pathname === "/login" && user) {
    const { data: roleData } = await supabase
      .schema("landyke")
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const url = request.nextUrl.clone();
    url.pathname = roleData?.role === "caretaker" ? "/caretaker/dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname === "/tenant-login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/my/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
