import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCaretakerAssignments } from "@/lib/queries-caretaker";
import CaretakerNav from "@/components/caretaker/CaretakerNav";

export default async function CaretakerLayout({
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

  const assignments = await getCaretakerAssignments(supabase, user.id);

  if (!assignments || assignments.length === 0) {
    redirect("/unauthorized");
  }

  const propertyNames = assignments
    .map((a: { properties?: { name: string } }) => a.properties?.name || "Property")
    .filter(Boolean);
  const caretakerName = user.user_metadata?.full_name || user.email || "Caretaker";

  return (
    <div className="flex min-h-screen bg-[#f7f5f2] caretaker-layout">
      <CaretakerNav caretakerName={caretakerName} propertyNames={propertyNames} />
      <main className="flex-1 overflow-y-auto px-5 py-8 pb-20 sm:px-10 caretaker-main">
        {children}
      </main>
    </div>
  );
}
