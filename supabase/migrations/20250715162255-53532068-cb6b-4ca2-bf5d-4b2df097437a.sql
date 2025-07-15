-- Fix infinite recursion in tournament policies
DROP POLICY IF EXISTS "Public tournaments readable" ON public.tournaments;

-- Create simplified tournament policy without recursion
CREATE POLICY "Anyone can view public tournaments"
ON public.tournaments FOR SELECT
USING (visibility = 'public' OR visibility IS NULL);

-- Create separate policy for tournament owners
CREATE POLICY "Tournament owners can view their tournaments"
ON public.tournaments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = tournaments.organizer_id 
    AND users.auth_user_id = auth.uid()
  )
);

-- Create policy for admin bypass
CREATE POLICY "Admin bypass tournaments"
ON public.tournaments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users admin_user
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_user
    WHERE admin_user.auth_user_id = auth.uid() 
    AND admin_user.role = 'admin'
  )
);