-- WiFi Subscription Management: plans, property pricing, tenant subscriptions

-- 1. WiFi plan catalog (global tiers)
CREATE TABLE IF NOT EXISTS landyke.wifi_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  default_price numeric NOT NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE landyke.wifi_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view wifi plans"
  ON landyke.wifi_plans FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. Per-property WiFi plan pricing
CREATE TABLE IF NOT EXISTS landyke.property_wifi_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES landyke.properties(id) ON DELETE CASCADE,
  wifi_plan_id uuid NOT NULL REFERENCES landyke.wifi_plans(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (property_id, wifi_plan_id)
);

ALTER TABLE landyke.property_wifi_plans ENABLE ROW LEVEL SECURITY;

-- Landlords can view plans for their properties
CREATE POLICY "Landlords can view own property wifi plans"
  ON landyke.property_wifi_plans FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM landyke.properties WHERE landlord_id = auth.uid()
    )
  );

-- NOTE: Tenant RLS policy for property_wifi_plans will be added when
-- tenants.user_id column is deployed (migration 006_tenant_portal)

-- Caretakers can view plans for assigned properties
CREATE POLICY "Caretakers can view assigned property wifi plans"
  ON landyke.property_wifi_plans FOR SELECT
  USING (
    property_id IN (
      SELECT property_id FROM landyke.caretaker_assignments
      WHERE caretaker_id = auth.uid()
    )
  );

-- 3. Tenant WiFi subscriptions
CREATE TABLE IF NOT EXISTS landyke.wifi_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES landyke.tenants(id) ON DELETE CASCADE,
  property_wifi_plan_id uuid NOT NULL REFERENCES landyke.property_wifi_plans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  started_at date NOT NULL DEFAULT CURRENT_DATE,
  ended_at date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE landyke.wifi_subscriptions ENABLE ROW LEVEL SECURITY;

-- Landlords can view subscriptions for tenants in their properties
CREATE POLICY "Landlords can view wifi subscriptions"
  ON landyke.wifi_subscriptions FOR SELECT
  USING (
    tenant_id IN (
      SELECT t.id FROM landyke.tenants t
      WHERE t.property_id IN (
        SELECT id FROM landyke.properties WHERE landlord_id = auth.uid()
      )
    )
  );

-- NOTE: Tenant RLS policy for wifi_subscriptions will be added when
-- tenants.user_id column is deployed (migration 006_tenant_portal)

-- Caretakers can view subscriptions for assigned properties
CREATE POLICY "Caretakers can view assigned wifi subscriptions"
  ON landyke.wifi_subscriptions FOR SELECT
  USING (
    tenant_id IN (
      SELECT t.id FROM landyke.tenants t
      WHERE t.property_id IN (
        SELECT property_id FROM landyke.caretaker_assignments
        WHERE caretaker_id = auth.uid()
      )
    )
  );

-- 4. Add payment_type to payments table
ALTER TABLE landyke.payments
  ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'rent'
  CHECK (payment_type IN ('rent', 'wifi', 'other'));

-- 5. Seed default WiFi plans
INSERT INTO landyke.wifi_plans (name, description, default_price, sort_order) VALUES
  ('Basic', 'WhatsApp, browsing, email, social media', 800, 1),
  ('Standard', 'Streaming, video calls, remote work', 1200, 2),
  ('Premium', 'Gaming, heavy downloads, 4K streaming', 1800, 3);
