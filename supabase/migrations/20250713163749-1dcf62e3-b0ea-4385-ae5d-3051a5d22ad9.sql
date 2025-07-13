-- Fix infinite recursion in users table RLS policies
-- Drop problematic policies first
DROP POLICY IF EXISTS "Admin bypass users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Organizers can view users" ON public.users;

-- Create non-recursive policies
-- Allow users to view their own profile (no recursion)
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = auth_user_id);

-- Allow users to update their own profile (no recursion)
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Allow user creation during signup (no recursion)
CREATE POLICY "Allow user creation during signup" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = auth_user_id);

-- Admin bypass for service role (no recursion - uses service_role)
CREATE POLICY "Service role bypass" 
ON public.users 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);