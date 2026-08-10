import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Keep-alive endpoint hit by a daily Vercel Cron (see vercel.json).
 *
 * Free-tier Supabase pauses a project after 7 consecutive days of inactivity.
 * A daily real query against the database keeps it well inside that window.
 *
 * If CRON_SECRET is set in the environment, Vercel Cron sends it as a Bearer
 * token and we require it; if it's unset the endpoint is open (it only runs a
 * trivial `select id limit 1` and never returns row data), so the keep-alive
 * works out of the box without extra configuration.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .schema("landyke")
      .from("landlords")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
