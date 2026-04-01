-- Add 'vacated_unpaid' payment status for tenants who vacated without paying
-- This marks the debt as a write-off (unrecoverable) vs active overdue
ALTER TABLE landyke.payments ADD CONSTRAINT payments_status_check
  CHECK (status IN ('paid', 'pending', 'overdue', 'vacated_unpaid'));
