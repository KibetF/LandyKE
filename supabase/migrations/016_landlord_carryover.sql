-- Carryover (opening balance) per landlord, for clients onboarded mid-stream
-- with money already received outside LandyKE (e.g. paid to a prior account).
-- The daily summary uses these to display a running total alongside today's
-- payments. Cumulative = carryover_amount + sum(payments paid after as_of).

ALTER TABLE landyke.landlords
  ADD COLUMN carryover_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN carryover_as_of  date;
