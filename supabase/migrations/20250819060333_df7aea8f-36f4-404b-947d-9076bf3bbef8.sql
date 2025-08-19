-- Volver a habilitar RLS
ALTER TABLE team_registrations ENABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas anteriores para empezar limpio
DROP POLICY IF EXISTS "Debug team registration" ON team_registrations;
DROP POLICY IF EXISTS "Teams can view own registrations debug" ON team_registrations;
DROP POLICY IF EXISTS "Teams view own registrations" ON team_registrations;
DROP POLICY IF EXISTS "Organizer views tournament registrations" ON team_registrations;
DROP POLICY IF EXISTS "Organizer updates registration" ON team_registrations;

-- Crear función security definer para verificar ownership de equipo
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

-- Crear función security definer para verificar ownership de torneo
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

-- Políticas para INSERT (crear inscripciones)
CREATE POLICY "Teams can request registration" ON team_registrations
FOR INSERT 
WITH CHECK (
  status = 'pending'::registration_status
  AND public.user_owns_team(team_id)
  AND EXISTS (
    SELECT 1 FROM tournaments t 
    WHERE t.id = tournament_id 
    AND (t.visibility = 'public' OR team_id = ANY(
      SELECT teams.id FROM teams 
      WHERE teams.team_code = ANY(t.invite_codes)
    ))
  )
);

-- Política para organizadores que aprueban inscripciones
CREATE POLICY "Organizers can approve registrations" ON team_registrations
FOR INSERT 
WITH CHECK (
  status = 'approved'::registration_status
  AND public.user_organizes_tournament(tournament_id)
);

-- Políticas para SELECT (ver inscripciones)
CREATE POLICY "Teams can view own registrations" ON team_registrations
FOR SELECT 
USING (public.user_owns_team(team_id));

CREATE POLICY "Organizers can view tournament registrations" ON team_registrations
FOR SELECT 
USING (
  public.user_organizes_tournament(tournament_id) 
  OR get_current_user_role() = 'admin'
);

-- Política para UPDATE (aprobar/rechazar inscripciones)
CREATE POLICY "Organizers can update registrations" ON team_registrations
FOR UPDATE 
USING (public.user_organizes_tournament(tournament_id));