import type { SupabaseClient } from "@supabase/supabase-js";

export async function createNotification(
  adminClient: SupabaseClient,
  landlordId: string,
  type: string,
  title: string,
  description: string,
  metadata: Record<string, unknown> = {}
) {
  const { error } = await adminClient
    .schema("landyke")
    .from("notifications")
    .insert({
      landlord_id: landlordId,
      type,
      title,
      description,
      metadata,
    });

  if (error) {
    console.error("Failed to create notification:", error.message);
  }
}
