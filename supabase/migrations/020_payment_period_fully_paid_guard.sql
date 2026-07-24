-- Blocks recording a 'paid' rent payment once a tenant's rent for that
-- rent_period is already fully covered by prior paid rows. This is the
-- DB-level backstop for the same rule enforced in app/api/admin/payments
-- and app/api/caretaker/payments (lib/payments.ts assertRentPeriodNotFullyPaid)
-- — it exists to close the race window between those two independent
-- insert paths recording for the same tenant/month at the same time.
-- Partial installments remain allowed up until the period is fully paid.

CREATE OR REPLACE FUNCTION landyke.check_payment_period_not_overpaid()
RETURNS trigger AS $$
DECLARE
  v_rent_amount numeric;
  v_already_paid numeric;
BEGIN
  IF NEW.status <> 'paid' OR NEW.rent_period IS NULL OR COALESCE(NEW.payment_type, 'rent') <> 'rent' THEN
    RETURN NEW;
  END IF;

  SELECT rent_amount INTO v_rent_amount
  FROM landyke.tenants
  WHERE id = NEW.tenant_id;

  IF v_rent_amount IS NULL OR v_rent_amount <= 0 THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_already_paid
  FROM landyke.payments
  WHERE tenant_id = NEW.tenant_id
    AND rent_period = NEW.rent_period
    AND status = 'paid'
    AND COALESCE(payment_type, 'rent') = 'rent'
    AND id IS DISTINCT FROM NEW.id;

  IF v_already_paid >= v_rent_amount THEN
    RAISE EXCEPTION 'Rent for % is already fully paid for this tenant (KES % of KES % recorded)',
      NEW.rent_period, v_already_paid, v_rent_amount
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = landyke, pg_temp;

DROP TRIGGER IF EXISTS payments_period_not_overpaid ON landyke.payments;
CREATE TRIGGER payments_period_not_overpaid
  BEFORE INSERT OR UPDATE ON landyke.payments
  FOR EACH ROW
  EXECUTE FUNCTION landyke.check_payment_period_not_overpaid();
