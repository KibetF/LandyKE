-- Notifications table
CREATE TABLE landyke.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id uuid NOT NULL REFERENCES landyke.landlords(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_notifications_landlord_read ON landyke.notifications (landlord_id, is_read);

-- RLS
ALTER TABLE landyke.notifications ENABLE ROW LEVEL SECURITY;

-- Landlords can read their own notifications (join through landlords.user_id)
CREATE POLICY "Landlords can view own notifications"
  ON landyke.notifications FOR SELECT
  USING (landlord_id IN (
    SELECT id FROM landyke.landlords WHERE user_id = auth.uid()
  ));

-- Landlords can update (mark read) their own notifications
CREATE POLICY "Landlords can update own notifications"
  ON landyke.notifications FOR UPDATE
  USING (landlord_id IN (
    SELECT id FROM landyke.landlords WHERE user_id = auth.uid()
  ));

-- Service role can insert (for API routes)
CREATE POLICY "Service role can insert notifications"
  ON landyke.notifications FOR INSERT
  WITH CHECK (true);
