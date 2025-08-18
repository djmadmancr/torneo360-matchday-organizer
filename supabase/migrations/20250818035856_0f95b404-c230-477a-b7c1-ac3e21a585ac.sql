-- Actualizar la función delete_tournament_cascade para incluir todas las dependencias
CREATE OR REPLACE FUNCTION public.delete_tournament_cascade(tournament_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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

  -- Eliminar dependencias en orden correcto
  -- 1. Eliminar fixtures (partidos)
  DELETE FROM fixtures WHERE fixtures.tournament_id = delete_tournament_cascade.tournament_id;
  
  -- 2. Eliminar solicitudes de inscripción (team_registrations)
  DELETE FROM team_registrations WHERE team_registrations.tournament_id = delete_tournament_cascade.tournament_id;
  
  -- 3. Eliminar notificaciones relacionadas
  DELETE FROM notifications WHERE notifications.tournament_id = delete_tournament_cascade.tournament_id;
  
  -- 4. Para torneos invitacionales, eliminar las invitaciones de equipos
  -- (esto se hace al eliminar el torneo ya que los invite_codes están en la tabla tournaments)
  
  -- 5. Eliminar el torneo (esto eliminará automáticamente los invite_codes)
  DELETE FROM tournaments WHERE tournaments.id = delete_tournament_cascade.tournament_id;
  
  -- Log para debugging
  RAISE NOTICE 'Torneo % eliminado exitosamente con todas sus dependencias', delete_tournament_cascade.tournament_id;
END;
$function$