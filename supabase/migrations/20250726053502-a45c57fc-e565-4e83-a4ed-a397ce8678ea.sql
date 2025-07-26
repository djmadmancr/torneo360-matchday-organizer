-- Fix RLS policy for team_registrations INSERT
DROP POLICY IF EXISTS "Team requests registration" ON team_registrations;

-- Create corrected RLS policy for team registrations
CREATE POLICY "Team requests registration" ON team_registrations
FOR INSERT
WITH CHECK (
  -- Allow pending registrations from team admins
  (
    status = 'pending'::registration_status 
    AND EXISTS (
      SELECT 1 FROM teams t
      JOIN users u ON t.admin_user_id = u.id
      WHERE t.id = team_registrations.team_id 
      AND u.auth_user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM tournaments tt
      WHERE tt.id = team_registrations.tournament_id
      AND (
        tt.visibility = 'public'::text 
        OR EXISTS (
          SELECT 1 FROM teams team_check
          WHERE team_check.id = team_registrations.team_id
          AND team_check.team_code = ANY(tt.invite_codes)
        )
      )
    )
  )
  OR
  -- Allow approved registrations from tournament organizers
  (
    status = 'approved'::registration_status 
    AND EXISTS (
      SELECT 1 FROM tournaments t
      JOIN users u ON t.organizer_id = u.id
      WHERE t.id = team_registrations.tournament_id 
      AND u.auth_user_id = auth.uid()
    )
  )
);