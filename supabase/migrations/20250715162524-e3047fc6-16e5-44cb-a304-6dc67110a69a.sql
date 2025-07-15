-- Remove all existing tournament policies to fix recursion issue
DROP POLICY IF EXISTS "Anyone can view public tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Tournament owners can view their tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Admin bypass tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Public tournaments readable" ON public.tournaments;
DROP POLICY IF EXISTS "Organizers can create tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Organizers can update their tournaments" ON public.tournaments;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new non-recursive policies
CREATE POLICY "Anyone can view public tournaments"
ON public.tournaments FOR SELECT
USING (visibility = 'public' OR visibility IS NULL);

CREATE POLICY "Organizers can view their tournaments"
ON public.tournaments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = tournaments.organizer_id 
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all tournaments"
ON public.tournaments FOR ALL
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Organizers can create tournaments"
ON public.tournaments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = tournaments.organizer_id 
    AND users.auth_user_id = auth.uid() 
    AND users.role = 'organizer'
  )
);

CREATE POLICY "Organizers can update their tournaments"
ON public.tournaments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = tournaments.organizer_id 
    AND users.auth_user_id = auth.uid()
  )
);