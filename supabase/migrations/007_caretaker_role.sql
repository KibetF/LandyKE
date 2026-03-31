-- Caretaker Role: user_roles table, assignments, payment tracking, and RLS policies

-- 1. Create user_roles table (not yet in production)
CREATE TABLE IF NOT EXISTS landyke.user_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('landlord', 'tenant', 'caretaker')),
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

-- 2. Create caretaker_assignments table
CREATE TABLE IF NOT EXISTS landyke.caretaker_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  caretaker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES landyke.properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (caretaker_id, property_id)
);

ALTER TABLE landyke.caretaker_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caretakers can view own assignments"
  ON landyke.caretaker_assignments FOR SELECT
  USING (caretaker_id = auth.uid());

CREATE POLICY "Service role can manage assignments"
  ON landyke.caretaker_assignments FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Add marked_by column to payments for audit trail
ALTER TABLE landyke.payments
  ADD COLUMN IF NOT EXISTS marked_by uuid REFERENCES auth.users(id);

-- 4. Caretaker RLS policies

-- Caretakers can view properties they are assigned to
CREATE POLICY "Caretakers can view assigned properties"
  ON landyke.properties FOR SELECT
  USING (
    id IN (
      SELECT property_id FROM landyke.caretaker_assignments
      WHERE caretaker_id = auth.uid()
    )
  );

-- Caretakers can view tenants in their assigned properties
CREATE POLICY "Caretakers can view assigned tenants"
  ON landyke.tenants FOR SELECT
  USING (
    property_id IN (
      SELECT property_id FROM landyke.caretaker_assignments
      WHERE caretaker_id = auth.uid()
    )
  );

-- Caretakers can view payments for tenants in their assigned properties
CREATE POLICY "Caretakers can view assigned payments"
  ON landyke.payments FOR SELECT
  USING (
    tenant_id IN (
      SELECT t.id FROM landyke.tenants t
      WHERE t.property_id IN (
        SELECT property_id FROM landyke.caretaker_assignments
        WHERE caretaker_id = auth.uid()
      )
    )
  );

-- Caretakers can insert payments for tenants in their assigned properties
CREATE POLICY "Caretakers can insert payments for assigned properties"
  ON landyke.payments FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT t.id FROM landyke.tenants t
      WHERE t.property_id IN (
        SELECT property_id FROM landyke.caretaker_assignments
        WHERE caretaker_id = auth.uid()
      )
    )
  );
