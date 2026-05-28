-- Migration 012 created landyke.whatsapp_messages but (unlike the older landyke
-- tables) never granted service_role any privileges. The service-role admin client
-- therefore hit "permission denied" (403) on every insert, so no WhatsApp message —
-- inbound or outbound — was ever logged. RLS is enabled with no policies, so anon /
-- authenticated are blocked too; the table is written service-role-only by design.
--
-- Grant service_role full privileges to match the other landyke tables. GRANT is
-- idempotent, so this is safe to re-run.
GRANT ALL ON landyke.whatsapp_messages TO service_role;
