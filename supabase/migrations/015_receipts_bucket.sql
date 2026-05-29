-- Public bucket for rent-receipt PDFs delivered as WhatsApp media.
-- Public read is required so Twilio/WhatsApp can fetch the PDF (no signed URL).
-- The service-role admin client bypasses RLS, so no upload policy is needed.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do update set public = excluded.public;
