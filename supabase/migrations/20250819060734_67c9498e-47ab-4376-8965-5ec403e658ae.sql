-- CRÍTICO: Eliminar la política que permite acceso público a datos personales
DROP POLICY IF EXISTS "Anyone can view team members of approved teams" ON team_members;

-- Crear políticas más restrictivas y seguras

-- 1. Los administradores de equipos pueden ver sus propios miembros (con todos los datos)
CREATE POLICY "Team admins can view their team members" ON team_members
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM teams t 
    JOIN users u ON t.admin_user_id = u.id 
    WHERE t.id = team_id 
    AND u.auth_user_id = auth.uid()
  )
);

-- 2. Los organizadores de torneos pueden ver miembros de equipos inscritos en sus torneos
-- (necesario para verificación y gestión de torneos)
CREATE POLICY "Tournament organizers can view registered team members" ON team_members
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM team_registrations tr
    JOIN tournaments t ON tr.tournament_id = t.id
    JOIN users u ON t.organizer_id = u.id
    WHERE tr.team_id = team_id 
    AND tr.status = 'approved'
    AND u.auth_user_id = auth.uid()
  )
);

-- 3. Los árbitros pueden ver miembros de equipos en partidos que arbitran
-- (necesario para verificación durante partidos)
CREATE POLICY "Referees can view team members in their matches" ON team_members
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM fixtures f
    JOIN users u ON f.referee_id = u.id
    WHERE (f.home_team_id = team_id OR f.away_team_id = team_id)
    AND u.auth_user_id = auth.uid()
    AND u.role = 'referee'
  )
);

-- 4. Los administradores del sistema pueden ver todos los miembros
CREATE POLICY "System admins can view all team members" ON team_members
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Mantener la política existente para que los admins de equipo gestionen sus miembros
-- (Esta política ya existe y está bien configurada)