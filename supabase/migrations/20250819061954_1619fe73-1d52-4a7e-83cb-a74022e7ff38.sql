-- Corregir el constraint de status en tournaments para permitir 'scheduled'
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_status_check;

-- Recrear el constraint con los valores correctos incluyendo 'scheduled'
ALTER TABLE tournaments ADD CONSTRAINT tournaments_status_check 
CHECK (status IN ('enrolling', 'scheduled', 'live', 'finished'));