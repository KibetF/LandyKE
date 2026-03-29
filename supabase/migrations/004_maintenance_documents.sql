-- Maintenance requests table (skip if already exists)
CREATE TABLE IF NOT EXISTS landyke.maintenance_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id uuid NOT NULL,
  property_id uuid NOT NULL,
  tenant_id uuid,
  unit_number text,
  description text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low','medium','high','urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in-progress','completed')),
  date_submitted date DEFAULT CURRENT_DATE,
  date_resolved date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_landlord ON landyke.maintenance_requests (landlord_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON landyke.maintenance_requests (status);

ALTER TABLE landyke.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Landlords can view own maintenance requests" ON landyke.maintenance_requests;
DROP POLICY IF EXISTS "Landlords can insert own maintenance requests" ON landyke.maintenance_requests;
DROP POLICY IF EXISTS "Landlords can update own maintenance requests" ON landyke.maintenance_requests;
DROP POLICY IF EXISTS "Service role full access maintenance" ON landyke.maintenance_requests;

CREATE POLICY "Landlords can view own maintenance requests"
  ON landyke.maintenance_requests FOR SELECT
  USING (landlord_id IN (
    SELECT id FROM landyke.landlords WHERE user_id = auth.uid()
  ));

CREATE POLICY "Landlords can insert own maintenance requests"
  ON landyke.maintenance_requests FOR INSERT
  WITH CHECK (landlord_id IN (
    SELECT id FROM landyke.landlords WHERE user_id = auth.uid()
  ));

CREATE POLICY "Landlords can update own maintenance requests"
  ON landyke.maintenance_requests FOR UPDATE
  USING (landlord_id IN (
    SELECT id FROM landyke.landlords WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role full access maintenance"
  ON landyke.maintenance_requests FOR ALL
  USING (true) WITH CHECK (true);

-- Documents table
CREATE TABLE IF NOT EXISTS landyke.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id uuid NOT NULL,
  property_id uuid,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('lease','invoice','receipt','report','legal')),
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_landlord ON landyke.documents (landlord_id);

ALTER TABLE landyke.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Landlords can view own documents" ON landyke.documents;
DROP POLICY IF EXISTS "Landlords can insert own documents" ON landyke.documents;
DROP POLICY IF EXISTS "Landlords can delete own documents" ON landyke.documents;
DROP POLICY IF EXISTS "Service role full access documents" ON landyke.documents;

CREATE POLICY "Landlords can view own documents"
  ON landyke.documents FOR SELECT
  USING (landlord_id IN (
    SELECT id FROM landyke.landlords WHERE user_id = auth.uid()
  ));

CREATE POLICY "Landlords can insert own documents"
  ON landyke.documents FOR INSERT
  WITH CHECK (landlord_id IN (
    SELECT id FROM landyke.landlords WHERE user_id = auth.uid()
  ));

CREATE POLICY "Landlords can delete own documents"
  ON landyke.documents FOR DELETE
  USING (landlord_id IN (
    SELECT id FROM landyke.landlords WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role full access documents"
  ON landyke.documents FOR ALL
  USING (true) WITH CHECK (true);
