-- Marks payments whose cash was already in the carryover opening balance
-- (e.g. an advance paid to the prior account before LandyKE took over).
-- These rows are kept for tenant-statement accuracy but excluded from the
-- daily summary's "new inflow" totals so they don't double-count.

ALTER TABLE landyke.payments
  ADD COLUMN from_carryover boolean NOT NULL DEFAULT false;
