-- Agregar política para que organizadores puedan eliminar sus torneos
CREATE POLICY "Organizers can delete their tournaments" 
ON tournaments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM users 
    WHERE users.id = tournaments.organizer_id 
    AND users.auth_user_id = auth.uid() 
    AND tournaments.status IN ('draft', 'enrolling')
  )
);

-- Función para eliminar torneo y sus dependencias
CREATE OR REPLACE FUNCTION delete_tournament_cascade(tournament_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario es el organizador
  IF NOT EXISTS (
    SELECT 1 FROM tournaments t 
    JOIN users u ON t.organizer_id = u.id 
    WHERE t.id = tournament_id 
    AND u.auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para eliminar este torneo';
  END IF;

  -- Eliminar dependencias en orden
  DELETE FROM fixtures WHERE tournament_id = $1;
  DELETE FROM team_registrations WHERE tournament_id = $1;
  DELETE FROM notifications WHERE tournament_id = $1;
  
  -- Eliminar el torneo
  DELETE FROM tournaments WHERE id = $1;
END;
$$;