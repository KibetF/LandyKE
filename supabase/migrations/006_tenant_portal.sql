-- Tenant Portal: auth support, user roles, and RLS policies

-- 1. Add user_id to tenants (links tenant record to a Supabase auth user)
ALTER TABLE landyke.tenants
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_user_id
  ON landyke.tenants (user_id) WHERE user_id IS NOT NULL;

-- 2. Add tenant_id to documents (scope documents to specific tenants)
ALTER TABLE landyke.documents
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES landyke.tenants(id) ON DELETE SET NULL;

-- 3. Create user_roles table to distinguish tenant vs landlord logins
CREATE TABLE IF NOT EXISTS landyke.user_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('landlord', 'tenant')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE landyke.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
  ON landyke.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage roles"
  ON landyke.user_roles FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Tenant RLS policies on tenants table
CREATE POLICY "Tenants can view own record"
  ON landyke.tenants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Tenants can update own profile fields"
  ON landyke.tenants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. Tenant RLS policies on payments table
CREATE POLICY "Tenants can view own payments"
  ON landyke.payments FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM landyke.tenants WHERE user_id = auth.uid()
    )
  );

-- 6. Tenant RLS policies on maintenance_requests table
CREATE POLICY "Tenants can view own maintenance requests"
  ON landyke.maintenance_requests FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM landyke.tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can create maintenance requests"
  ON landyke.maintenance_requests FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM landyke.tenants WHERE user_id = auth.uid()
    )
  );

-- 7. Tenant RLS policies on documents table
CREATE POLICY "Tenants can view own documents"
  ON landyke.documents FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM landyke.tenants WHERE user_id = auth.uid()
    )
    OR (
      tenant_id IS NULL
      AND property_id IN (
        SELECT property_id FROM landyke.tenants WHERE user_id = auth.uid()
      )
    )
  );
