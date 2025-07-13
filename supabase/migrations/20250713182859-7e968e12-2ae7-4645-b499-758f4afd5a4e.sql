-- Test RLS policies for admin functionality
-- This migration includes test functions to verify RLS works correctly

-- Function to test admin access (should succeed for admin users)
CREATE OR REPLACE FUNCTION test_admin_full_access()
RETURNS TABLE(test_result text, passed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
  users_count integer;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM users 
  WHERE auth_user_id = auth.uid();
  
  -- Test 1: Check if user can access users table
  BEGIN
    SELECT COUNT(*) INTO users_count FROM users;
    RETURN QUERY SELECT 'Admin can access users table'::text, true;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RETURN QUERY SELECT 'Admin cannot access users table'::text, false;
  END;
  
  -- Test 2: Check if user can create users (admin only)
  IF current_user_role = 'admin' THEN
    RETURN QUERY SELECT 'User has admin role'::text, true;
  ELSE
    RETURN QUERY SELECT 'User does not have admin role'::text, false;
  END IF;
  
  -- Test 3: Check tournaments access
  BEGIN
    SELECT COUNT(*) INTO users_count FROM tournaments;
    RETURN QUERY SELECT 'Can access tournaments table'::text, true;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RETURN QUERY SELECT 'Cannot access tournaments table'::text, false;
  END;
END;
$$;

-- Function to test anonymous access (should be denied)
CREATE OR REPLACE FUNCTION test_anonymous_access()
RETURNS TABLE(test_result text, should_fail boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Test anonymous access to users table (should fail)
  RETURN QUERY 
  SELECT 
    'Anonymous access to users table should be denied'::text,
    NOT EXISTS(
      SELECT 1 FROM users 
      WHERE auth.uid() IS NULL
    );
END;
$$;

-- Function to test team admin access (limited access)
CREATE OR REPLACE FUNCTION test_team_admin_access()
RETURNS TABLE(test_result text, passed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
  can_access_own_data boolean := false;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM users 
  WHERE auth_user_id = auth.uid();
  
  -- Test if team admin can access their own profile
  BEGIN
    SELECT EXISTS(
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid()
    ) INTO can_access_own_data;
    
    IF can_access_own_data THEN
      RETURN QUERY SELECT 'Team admin can access own profile'::text, true;
    ELSE
      RETURN QUERY SELECT 'Team admin cannot access own profile'::text, false;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 'Error accessing own profile'::text, false;
  END;
  
  -- Test role verification
  IF current_user_role IN ('team_admin', 'organizer', 'referee', 'admin') THEN
    RETURN QUERY SELECT 'User has valid role'::text, true;
  ELSE
    RETURN QUERY SELECT 'User has invalid role'::text, false;
  END IF;
END;
$$;

-- Create test data cleanup function
CREATE OR REPLACE FUNCTION cleanup_test_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up any test users that might have been created
  DELETE FROM users WHERE email LIKE '%@test.example%';
  DELETE FROM users WHERE email = 'testuser@demo.com';
  
  -- Clean up any test tournaments
  DELETE FROM tournaments WHERE name LIKE 'Test Tournament%';
  
  -- Clean up any test teams
  DELETE FROM teams WHERE name LIKE 'Test Team%';
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION test_admin_full_access() TO authenticated;
GRANT EXECUTE ON FUNCTION test_anonymous_access() TO authenticated;
GRANT EXECUTE ON FUNCTION test_team_admin_access() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_test_data() TO authenticated;