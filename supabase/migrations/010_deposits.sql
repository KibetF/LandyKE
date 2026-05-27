-- Deposits management: track tenant deposits with full lifecycle

CREATE TABLE IF NOT EXISTS landyke.deposits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES landyke.tenants(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES landyke.landlords(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES landyke.properties(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  deposit_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'held'
    CHECK (status IN ('held', 'returned', 'partially_refunded', 'forfeited')),
  notes text,
  -- Return/refund fields
  return_date date,
  amount_returned numeric,
  deductions numeric DEFAULT 0,
  return_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE landyke.deposits ENABLE ROW LEVEL SECURITY;

-- Landlords can view deposits for their properties
CREATE POLICY "Landlords can view own deposits"
  ON landyke.deposits FOR SELECT
  USING (landlord_id = auth.uid());

-- Caretakers can view deposits for assigned properties
CREATE POLICY "Caretakers can view assigned deposits"
  ON landyke.deposits FOR SELECT
  USING (
    property_id IN (
      SELECT property_id FROM landyke.caretaker_assignments
      WHERE caretaker_id = auth.uid()
    )
  );
