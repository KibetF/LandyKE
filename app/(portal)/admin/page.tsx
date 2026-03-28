import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminView from "@/components/admin/AdminView";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) {
    redirect("/dashboard");
  }

  // Fetch all landlords using admin client (bypasses RLS)
  const adminClient = createAdminClient();
  const { data: landlords } = await adminClient
    .schema("landyke")
    .from("landlords")
    .select("id, full_name, email, phone, created_at")
    .order("created_at", { ascending: false });

  return <AdminView landlords={landlords || []} />;
}
