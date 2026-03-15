-- LandyKe Database Schema

CREATE TABLE landlords (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id uuid REFERENCES landlords(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text,
  total_units int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  unit_number text,
  full_name text NOT NULL,
  phone text,
  monthly_rent numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date date NOT NULL,
  method text DEFAULT 'M-Pesa',
  status text CHECK (status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Landlords: can only access their own row
CREATE POLICY "Landlords can view own profile"
  ON landlords FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Landlords can update own profile"
  ON landlords FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Landlords can insert own profile"
  ON landlords FOR INSERT
  WITH CHECK (id = auth.uid());

-- Properties: landlord can manage their own properties
CREATE POLICY "Landlords can view own properties"
  ON properties FOR SELECT
  USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "Landlords can update own properties"
  ON properties FOR UPDATE
  USING (landlord_id = auth.uid());

-- Tenants: landlord can manage tenants in their properties
CREATE POLICY "Landlords can view own tenants"
  ON tenants FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can insert own tenants"
  ON tenants FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update own tenants"
  ON tenants FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

-- Payments: landlord can manage payments for their properties
CREATE POLICY "Landlords can view own payments"
  ON payments FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can insert own payments"
  ON payments FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update own payments"
  ON payments FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );
