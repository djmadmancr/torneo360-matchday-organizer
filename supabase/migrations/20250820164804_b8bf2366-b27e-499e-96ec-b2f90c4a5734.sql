-- Add country restriction fields to tournaments table
ALTER TABLE tournaments 
ADD COLUMN restrict_by_country BOOLEAN DEFAULT false,
ADD COLUMN allowed_countries TEXT[] DEFAULT NULL;

-- Add country field to teams table for filtering
ALTER TABLE teams 
ADD COLUMN country TEXT DEFAULT NULL;

-- Update existing tournaments to have proper defaults
UPDATE tournaments SET restrict_by_country = false WHERE restrict_by_country IS NULL;