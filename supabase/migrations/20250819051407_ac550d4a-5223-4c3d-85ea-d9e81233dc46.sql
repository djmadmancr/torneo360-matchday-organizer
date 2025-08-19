-- Allow admins to view all users
CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.auth_user_id = auth.uid() 
    AND (admin_user.role = 'admin' OR admin_user.roles @> '["admin"]'::jsonb)
  )
);