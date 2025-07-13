
-- Migration: Fix RLS policies for proper role-based access
-- Create admin bypass policies for all tables

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Admin bypass" ON public.users;
DROP POLICY IF EXISTS "Admin bypass" ON public.tournaments;
DROP POLICY IF EXISTS "Admin bypass" ON public.teams;
DROP POLICY IF EXISTS "Admin bypass" ON public.fixtures;
DROP POLICY IF EXISTS "Admin bypass" ON public.notifications;

-- Admin can bypass all restrictions on users table
CREATE POLICY "Admin bypass users"
ON public.users FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
);

-- Admin can bypass all restrictions on tournaments table
CREATE POLICY "Admin bypass tournaments"
ON public.tournaments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
);

-- Admin can bypass all restrictions on teams table
CREATE POLICY "Admin bypass teams"
ON public.teams FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
);

-- Admin can bypass all restrictions on fixtures table
CREATE POLICY "Admin bypass fixtures"
ON public.fixtures FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
);

-- Admin can bypass all restrictions on notifications table
CREATE POLICY "Admin bypass notifications"
ON public.notifications FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
);

-- Ensure demo users have correct roles (update existing records)
UPDATE public.users SET role = 'admin' WHERE email = 'admin@demo.com';
UPDATE public.users SET role = 'organizer' WHERE email = 'organizador@demo.com';
UPDATE public.users SET role = 'referee' WHERE email = 'fiscal@demo.com';
UPDATE public.users SET role = 'team_admin' WHERE email = 'equipo@demo.com';
