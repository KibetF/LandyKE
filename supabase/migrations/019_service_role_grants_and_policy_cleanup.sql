-- 019: Service-role grants, drop misnamed public-true policies, FK covering indexes
--
-- Problem 1: eight tables (notifications, deposits, documents, wifi_plans,
-- wifi_subscriptions, property_wifi_plans, user_roles, caretaker_assignments)
-- were created without GRANTs to service_role, so every write through the
-- admin (service-role) client fails with permission denied — e.g. the
-- recurring "Failed to create notification" error in production. Same class
-- of bug previously fixed for whatsapp_messages in 014.
--
-- Problem 2: five policies named "Service role ..." were created TO public
-- with USING/WITH CHECK (true). service_role bypasses RLS entirely, so they
-- never applied to it — instead they granted anon/authenticated unrestricted
-- access to those tables. Drop them; scoped per-role policies remain, and all
-- server-side writes go through the service-role client (covered by grants).
--
-- NOTE: grants must run BEFORE the policy drops so service-role writes keep
-- working within this migration's transaction.

-- 1) Grants (and default privileges so future tables don't repeat this bug)
grant usage on schema landyke to service_role;
grant all on all tables in schema landyke to service_role;
grant all on all sequences in schema landyke to service_role;
alter default privileges in schema landyke grant all on tables to service_role;
alter default privileges in schema landyke grant all on sequences to service_role;

-- 2) Drop public-true policies that only opened holes for anon/authenticated
drop policy if exists "Service role can insert notifications" on landyke.notifications;
drop policy if exists "Service role full access maintenance" on landyke.maintenance_requests;
drop policy if exists "Service role full access documents" on landyke.documents;
drop policy if exists "Service role can manage roles" on landyke.user_roles;
drop policy if exists "Service role can manage assignments" on landyke.caretaker_assignments;

-- 3) Covering indexes for the 10 unindexed foreign keys flagged by the advisor
create index if not exists idx_caretaker_assignments_property_id on landyke.caretaker_assignments (property_id);
create index if not exists idx_deposits_landlord_id on landyke.deposits (landlord_id);
create index if not exists idx_deposits_property_id on landyke.deposits (property_id);
create index if not exists idx_deposits_tenant_id on landyke.deposits (tenant_id);
create index if not exists idx_maintenance_requests_property_id on landyke.maintenance_requests (property_id);
create index if not exists idx_maintenance_requests_tenant_id on landyke.maintenance_requests (tenant_id);
create index if not exists idx_property_wifi_plans_wifi_plan_id on landyke.property_wifi_plans (wifi_plan_id);
create index if not exists idx_whatsapp_messages_sent_by_user_id on landyke.whatsapp_messages (sent_by_user_id);
create index if not exists idx_wifi_subscriptions_property_wifi_plan_id on landyke.wifi_subscriptions (property_wifi_plan_id);
create index if not exists idx_wifi_subscriptions_tenant_id on landyke.wifi_subscriptions (tenant_id);
