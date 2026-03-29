import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsView from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: landlord } = await supabase
    .schema("landyke")
    .from("landlords")
    .select("full_name, email, phone, notification_preferences")
    .eq("user_id", user.id)
    .single();

  const landlordData = {
    full_name: landlord?.full_name || "",
    email: landlord?.email || user.email || "",
    phone: landlord?.phone || null,
    notification_preferences: landlord?.notification_preferences || {
      email: true,
      sms: true,
      paymentAlerts: true,
      maintenanceUpdates: true,
      monthlyReports: false,
    },
  };

  return <SettingsView landlord={landlordData} />;
}
