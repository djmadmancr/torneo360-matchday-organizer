-- Temporalmente deshabilitar RLS para diagnosticar
ALTER TABLE team_registrations DISABLE ROW LEVEL SECURITY;

-- Luego volver a habilitarla
ALTER TABLE team_registrations ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Teams can request registration" ON team_registrations;
DROP POLICY IF EXISTS "Organizers can approve registrations" ON team_registrations;

-- Crear una política simple para diagnosticar
CREATE POLICY "Debug team registration" ON team_registrations
FOR INSERT 
WITH CHECK (true);

-- Mantener las políticas de SELECT existentes
CREATE POLICY "Teams can view own registrations debug" ON team_registrations
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id = team_id 
    AND t.admin_user_id = auth.uid()
  )
);