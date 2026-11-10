-- Client funds: money a client sends into the LandyKE collection account for a
-- purpose other than rent (e.g. a lump sum to be placed in a fixed deposit).
--
-- Kept in its own table, NOT in payments, so it never inflates rent figures:
-- "collected", "total in our account", arrears and collection rates are all
-- computed from payments only. The client statement shows these funds in a
-- separate section.
--
-- Lifecycle: 'held' while the money sits in our account, 'sent' once it has
-- been forwarded on (sent_date + sent_to record where it went).

CREATE TABLE IF NOT EXISTS landyke.client_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES landyke.landlords(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  received_date date NOT NULL,
  purpose text NOT NULL DEFAULT 'Fixed deposit',
  status text NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'sent')),
  sent_date date,
  sent_to text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'sent' OR sent_date IS NOT NULL),
  CHECK (sent_date IS NULL OR sent_date >= received_date)
);

CREATE INDEX IF NOT EXISTS idx_client_funds_landlord_id
  ON landyke.client_funds (landlord_id, received_date DESC);

ALTER TABLE landyke.client_funds ENABLE ROW LEVEL SECURITY;

-- Landlords can see their own funds; all writes go through the service-role
-- admin client.
CREATE POLICY "Landlords can view own client funds" ON landyke.client_funds
  FOR SELECT USING (landlord_id = (SELECT auth.uid()));

GRANT ALL ON landyke.client_funds TO service_role;
GRANT SELECT ON landyke.client_funds TO authenticated;
