-- Actualizar política RLS para permitir que los organizadores agreguen equipos directamente a sus torneos
DROP POLICY IF EXISTS "Team requests registration" ON team_registrations;

CREATE POLICY "Team requests registration" ON team_registrations
FOR INSERT
WITH CHECK (
  -- Permitir a equipos solicitar registro para torneos públicos o con código de invitación
  (status = 'pending' AND EXISTS (
    SELECT 1 FROM teams tm
    JOIN tournaments tt ON (tt.id = tm.tournament_id)
    WHERE tm.id = team_registrations.team_id 
    AND tm.admin_user_id = auth.uid() 
    AND ((tt.visibility = 'public') OR (tm.invite_code = ANY (tt.invite_codes)))
  ))
  OR
  -- Permitir a organizadores agregar equipos directamente con status 'approved'
  (status = 'approved' AND EXISTS (
    SELECT 1 FROM tournaments t
    WHERE t.id = team_registrations.tournament_id 
    AND t.organizer_id = (SELECT users.id FROM users WHERE users.auth_user_id = auth.uid())
  ))
);