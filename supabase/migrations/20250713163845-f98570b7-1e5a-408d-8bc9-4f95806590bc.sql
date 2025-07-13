-- Fix infinite recursion in users table RLS policies
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Admin bypass users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Organizers can view users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;

-- Create new non-recursive policies
-- Allow users to view their own profile (no recursion)
CREATE POLICY "User can view own profile" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = auth_user_id);

-- Allow users to update their own profile (no recursion)
CREATE POLICY "User can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Allow user creation during signup (no recursion)
CREATE POLICY "User creation during signup" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = auth_user_id);

-- Service role bypass for admin operations (no recursion)
CREATE POLICY "Service role full access" 
ON public.users 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);