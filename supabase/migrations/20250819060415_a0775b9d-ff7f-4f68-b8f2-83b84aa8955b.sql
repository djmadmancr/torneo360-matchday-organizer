-- Eliminar TODAS las políticas existentes en team_registrations
DROP POLICY IF EXISTS "Teams can request registration" ON team_registrations;
DROP POLICY IF EXISTS "Organizers can approve registrations" ON team_registrations;
DROP POLICY IF EXISTS "Teams can view own registrations" ON team_registrations;
DROP POLICY IF EXISTS "Organizers can view tournament registrations" ON team_registrations;
DROP POLICY IF EXISTS "Organizers can update registrations" ON team_registrations;

-- Ver todas las políticas que quedan
SELECT policyname FROM pg_policies WHERE tablename = 'team_registrations';