-- Extend whatsapp_messages to support outbound sends from the admin UI.

ALTER TABLE landyke.whatsapp_messages
  ADD COLUMN IF NOT EXISTS direction text NOT NULL DEFAULT 'inbound'
    CHECK (direction IN ('inbound', 'outbound')),
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS sent_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE landyke.whatsapp_messages ALTER COLUMN message_sid DROP NOT NULL;

-- Replace UNIQUE constraint (which blocks NULLs) with a partial unique index.
ALTER TABLE landyke.whatsapp_messages DROP CONSTRAINT IF EXISTS whatsapp_messages_message_sid_key;
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_messages_sid_unique
  ON landyke.whatsapp_messages (message_sid) WHERE message_sid IS NOT NULL;

CREATE INDEX IF NOT EXISTS whatsapp_messages_direction_idx
  ON landyke.whatsapp_messages (direction, received_at DESC);

-- Drop default so callers must specify direction explicitly.
ALTER TABLE landyke.whatsapp_messages ALTER COLUMN direction DROP DEFAULT;
