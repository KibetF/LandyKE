import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import PortalHeader from "@/components/dashboard/PortalHeader";

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
  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  return (
    <div className="flex min-h-screen bg-[#f7f5f2] portal-layout">
      <Sidebar userName={userName} isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 lg:px-12 portal-main">
        <PortalHeader />
        {children}
      </main>
    </div>
  );
}
