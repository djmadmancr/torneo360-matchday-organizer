
-- Add RLS policy for admin users to manage all users
CREATE POLICY "Admins can manage all users" 
ON public.users 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
);

-- Add policy for organizers to view users (but not modify)
CREATE POLICY "Organizers can view users" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM public.users requesting_user 
    WHERE requesting_user.auth_user_id = auth.uid() 
    AND requesting_user.role IN ('admin', 'organizer')
  )
);
