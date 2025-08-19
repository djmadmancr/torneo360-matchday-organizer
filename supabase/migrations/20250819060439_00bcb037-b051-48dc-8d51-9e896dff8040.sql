-- Crear las funciones security definer si no existen
CREATE OR REPLACE FUNCTION public.user_owns_team(team_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM teams t 
    JOIN users u ON t.admin_user_id = u.id 
    WHERE t.id = team_id_param 
    AND u.auth_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.user_organizes_tournament(tournament_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tournaments t 
    JOIN users u ON t.organizer_id = u.id 
    WHERE t.id = tournament_id_param 
    AND u.auth_user_id = auth.uid()
  );
$$;

-- Política para equipos que solicitan inscripción
CREATE POLICY "Teams can request registration" ON team_registrations
FOR INSERT 
WITH CHECK (
  status = 'pending'::registration_status
  AND public.user_owns_team(team_id)
);

-- Política para organizadores que aprueban inscripciones
CREATE POLICY "Organizers can approve registrations" ON team_registrations
FOR INSERT 
WITH CHECK (
  status = 'approved'::registration_status
  AND public.user_organizes_tournament(tournament_id)
);

-- Política para que equipos vean sus propias inscripciones
CREATE POLICY "Teams can view own registrations" ON team_registrations
FOR SELECT 
USING (public.user_owns_team(team_id));

-- Política para que organizadores vean inscripciones de sus torneos
CREATE POLICY "Organizers can view tournament registrations" ON team_registrations
FOR SELECT 
USING (
  public.user_organizes_tournament(tournament_id) 
  OR get_current_user_role() = 'admin'
);

-- Política para que organizadores actualicen inscripciones
CREATE POLICY "Organizers can update registrations" ON team_registrations
FOR UPDATE 
USING (public.user_organizes_tournament(tournament_id));