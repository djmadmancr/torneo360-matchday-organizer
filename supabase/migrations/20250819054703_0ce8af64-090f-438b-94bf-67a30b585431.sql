-- Actualizar jugadores existentes que no tienen edad
-- Para jugadores con fecha de nacimiento, calcular la edad
UPDATE team_members 
SET member_data = member_data || jsonb_build_object('age', 
  CASE 
    WHEN member_data ? 'birth_date' AND member_data->>'birth_date' != '' AND member_data->>'birth_date' != '0002-05-21' 
    THEN DATE_PART('year', AGE(NOW(), (member_data->>'birth_date')::date))
    ELSE 25  -- Edad por defecto para jugadores sin fecha de nacimiento válida
  END
)
WHERE member_type = 'player' 
AND (NOT member_data ? 'age' OR member_data->>'age' = '' OR (member_data->>'age')::int > 100);

-- También actualizar para staff sin edad
UPDATE team_members 
SET member_data = member_data || jsonb_build_object('age', 
  CASE 
    WHEN member_data ? 'birth_date' AND member_data->>'birth_date' != '' AND member_data->>'birth_date' != '0002-05-21'
    THEN DATE_PART('year', AGE(NOW(), (member_data->>'birth_date')::date))
    ELSE 30  -- Edad por defecto para staff sin fecha de nacimiento válida
  END
)
WHERE member_type = 'staff' 
AND (NOT member_data ? 'age' OR member_data->>'age' = '' OR (member_data->>'age')::int > 100);