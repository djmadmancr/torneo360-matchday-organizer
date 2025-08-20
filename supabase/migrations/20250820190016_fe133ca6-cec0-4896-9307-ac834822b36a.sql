-- Add city and country columns to users table for referees
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Create index for filtering referees by location
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(country, city) WHERE role = 'referee';