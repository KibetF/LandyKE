-- Inbound WhatsApp messages received via Twilio webhook

CREATE TABLE IF NOT EXISTS landyke.whatsapp_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_sid text UNIQUE NOT NULL,
  from_number text NOT NULL,
  to_number text NOT NULL,
  body text,
  num_media int NOT NULL DEFAULT 0,
  media_urls text[] DEFAULT '{}',
  media_content_types text[] DEFAULT '{}',
  profile_name text,
  wa_id text,
  raw_payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS whatsapp_messages_from_idx ON landyke.whatsapp_messages (from_number);
CREATE INDEX IF NOT EXISTS whatsapp_messages_received_idx ON landyke.whatsapp_messages (received_at DESC);

ALTER TABLE landyke.whatsapp_messages ENABLE ROW LEVEL SECURITY;
-- No public policies: inserts/reads go through service-role only for now.
