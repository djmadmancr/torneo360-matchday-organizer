-- Deshabilitar completamente RLS en team_registrations para confirmar que este es el problema
ALTER TABLE team_registrations DISABLE ROW LEVEL SECURITY;