import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get landlord name — redirect if no landlord profile exists
  const { data: landlord } = await supabase
    .schema("landyke")
    .from("landlords")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  if (!landlord) {
    redirect("/unauthorized");
  }

  const userName = landlord.full_name || user.email || "User";

  return (
    <div className="flex portal-layout" style={{ minHeight: "100vh", background: "#f7f5f2" }}>
      <Sidebar userName={userName} />
      <main
        className="flex-1 overflow-y-auto portal-main"
        style={{ padding: "2.5rem 3rem" }}
      >
        {children}
      </main>
    </div>
  );
}
