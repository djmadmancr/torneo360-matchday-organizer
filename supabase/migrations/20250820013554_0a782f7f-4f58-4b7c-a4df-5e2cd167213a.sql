-- Check if there's a unique constraint on users.email that might be causing conflicts
-- First, let's see the current constraints on the users table
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'users' AND table_schema = 'public';

-- Check for unique indexes on email
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'users' AND schemaname = 'public' 
AND indexdef LIKE '%email%';

-- If there's a unique constraint on email, we should modify the edge function behavior
-- But first let's check if the email constraint is actually needed
-- since auth_user_id should be the primary way to link to auth.users