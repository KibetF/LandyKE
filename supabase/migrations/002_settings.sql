-- Add notification preferences to landlords
ALTER TABLE landyke.landlords
ADD COLUMN IF NOT EXISTS notification_preferences jsonb
DEFAULT '{"email":true,"sms":true,"paymentAlerts":true,"maintenanceUpdates":true,"monthlyReports":false}'::jsonb;
