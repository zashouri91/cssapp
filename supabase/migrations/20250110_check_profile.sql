-- Check if profile exists
SELECT * FROM profiles;

-- Check webhook logs for any errors
SELECT * FROM auth.audit_log_entries ORDER BY created_at DESC LIMIT 5;
