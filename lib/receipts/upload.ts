import { createAdminClient } from "@/lib/supabase/admin";
import { generateReceiptBuffer, type ReceiptData } from "@/lib/pdf/generate-receipt";

const RECEIPTS_BUCKET = "receipts";

/**
 * Generate the receipt PDF, upload it to the public `receipts` bucket, and
 * return the storage path used as the {{7}} media variable (everything after
 * /public/) plus the resolved public URL.
 *
 * Returns null on failure so the caller can still send a text-only receipt.
 */
export async function uploadReceiptPdf(
  admin: ReturnType<typeof createAdminClient>,
  receiptNumber: string,
  data: ReceiptData
): Promise<{ path: string; publicUrl: string } | null> {
  try {
    const pdf = generateReceiptBuffer(data);
    const objectKey = `${receiptNumber}.pdf`;
    const { error } = await admin.storage
      .from(RECEIPTS_BUCKET)
      .upload(objectKey, pdf, { contentType: "application/pdf", upsert: true });
    if (error) {
      console.error("[receipts] upload failed", error.message);
      return null;
    }
    const { data: pub } = admin.storage.from(RECEIPTS_BUCKET).getPublicUrl(objectKey);
    return { path: `${RECEIPTS_BUCKET}/${objectKey}`, publicUrl: pub.publicUrl };
  } catch (e) {
    console.error("[receipts] pdf error", (e as { message?: string })?.message);
    return null;
  }
}
