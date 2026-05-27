-- Rent period tagging: each payment row records which month it applies to,
-- distinct from paid_date (when the money arrived). Enables partial,
-- advance, and surplus payment detection via simple per-period aggregation.

ALTER TABLE landyke.payments
  ADD COLUMN IF NOT EXISTS rent_period text;

-- Backfill existing rows: assume payment applied to the month it was received.
-- This is approximate for any historical partial/advance, but the current
-- schema couldn't represent those distinctions anyway.
UPDATE landyke.payments
  SET rent_period = to_char(paid_date, 'YYYY-MM')
  WHERE rent_period IS NULL
    AND paid_date IS NOT NULL
    AND (payment_type IS NULL OR payment_type = 'rent');

CREATE INDEX IF NOT EXISTS idx_payments_tenant_period
  ON landyke.payments (tenant_id, rent_period);
