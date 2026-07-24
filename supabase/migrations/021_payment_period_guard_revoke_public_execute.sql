-- The trigger function only needs to run implicitly as part of INSERT/UPDATE
-- on landyke.payments; it should not be directly callable via PostgREST RPC.
REVOKE EXECUTE ON FUNCTION landyke.check_payment_period_not_overpaid() FROM PUBLIC, anon, authenticated;
