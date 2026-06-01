-- Performance: cover the hot FK filter columns and stop RLS from
-- re-evaluating auth.<fn>() per row (advisor: auth_rls_initplan).
-- Also drops a set of older "Landlords can ..." maintenance policies that
-- duplicate the newer maintenance_owner_* policies (multiple_permissive_policies).

-- ===== 1. Missing covering indexes on hot FK columns =====
CREATE INDEX IF NOT EXISTS idx_payments_landlord_paid_date
  ON landyke.payments (landlord_id, paid_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_marked_by
  ON landyke.payments (marked_by);
CREATE INDEX IF NOT EXISTS idx_tenants_property_id
  ON landyke.tenants (property_id);

-- ===== 2. Drop duplicate maintenance policies =====
DROP POLICY IF EXISTS "Landlords can insert own maintenance requests" ON landyke.maintenance_requests;
DROP POLICY IF EXISTS "Landlords can update own maintenance requests" ON landyke.maintenance_requests;
DROP POLICY IF EXISTS "Landlords can view own maintenance requests" ON landyke.maintenance_requests;

-- ===== 3. Rewrite remaining bare auth.uid() policies to use (select auth.uid()) =====

-- caretaker_assignments
DROP POLICY IF EXISTS "Caretakers can view own assignments" ON landyke.caretaker_assignments;
CREATE POLICY "Caretakers can view own assignments" ON landyke.caretaker_assignments
  FOR SELECT USING (caretaker_id = (SELECT auth.uid()));

-- deposits
DROP POLICY IF EXISTS "Caretakers can view assigned deposits" ON landyke.deposits;
CREATE POLICY "Caretakers can view assigned deposits" ON landyke.deposits
  FOR SELECT USING (property_id IN (
    SELECT caretaker_assignments.property_id FROM landyke.caretaker_assignments
    WHERE caretaker_assignments.caretaker_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Landlords can view own deposits" ON landyke.deposits;
CREATE POLICY "Landlords can view own deposits" ON landyke.deposits
  FOR SELECT USING (landlord_id = (SELECT auth.uid()));

-- documents
DROP POLICY IF EXISTS "Landlords can view own documents" ON landyke.documents;
CREATE POLICY "Landlords can view own documents" ON landyke.documents
  FOR SELECT USING (landlord_id IN (
    SELECT landlords.id FROM landyke.landlords
    WHERE landlords.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Landlords can insert own documents" ON landyke.documents;
CREATE POLICY "Landlords can insert own documents" ON landyke.documents
  FOR INSERT WITH CHECK (landlord_id IN (
    SELECT landlords.id FROM landyke.landlords
    WHERE landlords.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Landlords can delete own documents" ON landyke.documents;
CREATE POLICY "Landlords can delete own documents" ON landyke.documents
  FOR DELETE USING (landlord_id IN (
    SELECT landlords.id FROM landyke.landlords
    WHERE landlords.user_id = (SELECT auth.uid())
  ));

-- notifications
DROP POLICY IF EXISTS "Landlords can view own notifications" ON landyke.notifications;
CREATE POLICY "Landlords can view own notifications" ON landyke.notifications
  FOR SELECT USING (landlord_id IN (
    SELECT landlords.id FROM landyke.landlords
    WHERE landlords.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Landlords can update own notifications" ON landyke.notifications;
CREATE POLICY "Landlords can update own notifications" ON landyke.notifications
  FOR UPDATE USING (landlord_id IN (
    SELECT landlords.id FROM landyke.landlords
    WHERE landlords.user_id = (SELECT auth.uid())
  ));

-- payments (caretaker policies)
DROP POLICY IF EXISTS "Caretakers can view assigned payments" ON landyke.payments;
CREATE POLICY "Caretakers can view assigned payments" ON landyke.payments
  FOR SELECT USING (tenant_id IN (
    SELECT t.id FROM landyke.tenants t
    WHERE t.property_id IN (
      SELECT caretaker_assignments.property_id FROM landyke.caretaker_assignments
      WHERE caretaker_assignments.caretaker_id = (SELECT auth.uid())
    )
  ));

DROP POLICY IF EXISTS "Caretakers can insert payments for assigned properties" ON landyke.payments;
CREATE POLICY "Caretakers can insert payments for assigned properties" ON landyke.payments
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT t.id FROM landyke.tenants t
    WHERE t.property_id IN (
      SELECT caretaker_assignments.property_id FROM landyke.caretaker_assignments
      WHERE caretaker_assignments.caretaker_id = (SELECT auth.uid())
    )
  ));

-- properties (caretaker)
DROP POLICY IF EXISTS "Caretakers can view assigned properties" ON landyke.properties;
CREATE POLICY "Caretakers can view assigned properties" ON landyke.properties
  FOR SELECT USING (id IN (
    SELECT caretaker_assignments.property_id FROM landyke.caretaker_assignments
    WHERE caretaker_assignments.caretaker_id = (SELECT auth.uid())
  ));

-- property_wifi_plans
DROP POLICY IF EXISTS "Caretakers can view assigned property wifi plans" ON landyke.property_wifi_plans;
CREATE POLICY "Caretakers can view assigned property wifi plans" ON landyke.property_wifi_plans
  FOR SELECT USING (property_id IN (
    SELECT caretaker_assignments.property_id FROM landyke.caretaker_assignments
    WHERE caretaker_assignments.caretaker_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Landlords can view own property wifi plans" ON landyke.property_wifi_plans;
CREATE POLICY "Landlords can view own property wifi plans" ON landyke.property_wifi_plans
  FOR SELECT USING (property_id IN (
    SELECT properties.id FROM landyke.properties
    WHERE properties.landlord_id = (SELECT auth.uid())
  ));

-- tenants (caretaker)
DROP POLICY IF EXISTS "Caretakers can view assigned tenants" ON landyke.tenants;
CREATE POLICY "Caretakers can view assigned tenants" ON landyke.tenants
  FOR SELECT USING (property_id IN (
    SELECT caretaker_assignments.property_id FROM landyke.caretaker_assignments
    WHERE caretaker_assignments.caretaker_id = (SELECT auth.uid())
  ));

-- user_roles
DROP POLICY IF EXISTS "Users can read own role" ON landyke.user_roles;
CREATE POLICY "Users can read own role" ON landyke.user_roles
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- wifi_plans
DROP POLICY IF EXISTS "Anyone authenticated can view wifi plans" ON landyke.wifi_plans;
CREATE POLICY "Anyone authenticated can view wifi plans" ON landyke.wifi_plans
  FOR SELECT USING ((SELECT auth.role()) = 'authenticated');

-- wifi_subscriptions
DROP POLICY IF EXISTS "Caretakers can view assigned wifi subscriptions" ON landyke.wifi_subscriptions;
CREATE POLICY "Caretakers can view assigned wifi subscriptions" ON landyke.wifi_subscriptions
  FOR SELECT USING (tenant_id IN (
    SELECT t.id FROM landyke.tenants t
    WHERE t.property_id IN (
      SELECT caretaker_assignments.property_id FROM landyke.caretaker_assignments
      WHERE caretaker_assignments.caretaker_id = (SELECT auth.uid())
    )
  ));

DROP POLICY IF EXISTS "Landlords can view wifi subscriptions" ON landyke.wifi_subscriptions;
CREATE POLICY "Landlords can view wifi subscriptions" ON landyke.wifi_subscriptions
  FOR SELECT USING (tenant_id IN (
    SELECT t.id FROM landyke.tenants t
    WHERE t.property_id IN (
      SELECT properties.id FROM landyke.properties
      WHERE properties.landlord_id = (SELECT auth.uid())
    )
  ));
