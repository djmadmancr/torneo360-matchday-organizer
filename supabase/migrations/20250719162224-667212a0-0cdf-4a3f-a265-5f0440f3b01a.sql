-- Enable RLS for tournaments (if not already enabled)
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Policy for organizers to edit their tournaments in draft/enrolling status
CREATE POLICY "Organizer can edit draft/enrolling tournaments"
ON public.tournaments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = tournaments.organizer_id 
    AND users.auth_user_id = auth.uid()
    AND tournaments.status IN ('draft', 'enrolling')
  )
);

-- Policy for organizers to update tournament status to scheduled
CREATE POLICY "Organizer can start tournament"
ON public.tournaments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = tournaments.organizer_id 
    AND users.auth_user_id = auth.uid()
    AND tournaments.status = 'enrolling'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = tournaments.organizer_id 
    AND users.auth_user_id = auth.uid()
    AND tournaments.status IN ('scheduled', 'enrolling')
  )
);