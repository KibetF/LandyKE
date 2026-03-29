-- Add unit_type to tenants (e.g. studio, 1-bedroom, 2-bedroom, etc.)
ALTER TABLE landyke.tenants
ADD COLUMN IF NOT EXISTS unit_type text;
