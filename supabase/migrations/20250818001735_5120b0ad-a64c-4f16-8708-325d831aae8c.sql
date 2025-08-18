-- Corregir función delete_tournament_cascade para evitar ambigüedad
CREATE OR REPLACE FUNCTION public.delete_tournament_cascade(tournament_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario es el organizador
  IF NOT EXISTS (
    SELECT 1 FROM tournaments t 
    JOIN users u ON t.organizer_id = u.id 
    WHERE t.id = delete_tournament_cascade.tournament_id 
    AND u.auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para eliminar este torneo';
  END IF;

  -- Eliminar dependencias en orden
  DELETE FROM fixtures WHERE fixtures.tournament_id = delete_tournament_cascade.tournament_id;
  DELETE FROM team_registrations WHERE team_registrations.tournament_id = delete_tournament_cascade.tournament_id;
  DELETE FROM notifications WHERE notifications.tournament_id = delete_tournament_cascade.tournament_id;
  
  -- Eliminar el torneo
  DELETE FROM tournaments WHERE tournaments.id = delete_tournament_cascade.tournament_id;
END;
$$;