-- Eliminar la política compleja actual
DROP POLICY IF EXISTS "Team requests registration" ON team_registrations;

-- Crear una política más simple y directa
CREATE POLICY "Teams can request registration" ON team_registrations
FOR INSERT 
WITH CHECK (
  -- Solo permitir status pending para solicitudes de equipos
  status = 'pending'::registration_status
  AND
  -- Verificar que el usuario es admin del equipo
  EXISTS (
    SELECT 1 FROM teams t 
    JOIN users u ON t.admin_user_id = u.id 
    WHERE t.id = team_id 
    AND u.auth_user_id = auth.uid()
  )
  AND
  -- Verificar que el torneo existe y es público o el equipo tiene código válido
  EXISTS (
    SELECT 1 FROM tournaments t 
    WHERE t.id = tournament_id 
    AND (
      t.visibility = 'public' 
      OR 
      EXISTS (
        SELECT 1 FROM teams team_check 
        WHERE team_check.id = team_id 
        AND team_check.team_code = ANY(t.invite_codes)
      )
    )
  )
);

-- Crear política separada para organizadores que aprueban inscripciones
CREATE POLICY "Organizers can approve registrations" ON team_registrations
FOR INSERT 
WITH CHECK (
  status = 'approved'::registration_status
  AND
  EXISTS (
    SELECT 1 FROM tournaments t 
    JOIN users u ON t.organizer_id = u.id 
    WHERE t.id = tournament_id 
    AND u.auth_user_id = auth.uid()
  )
);