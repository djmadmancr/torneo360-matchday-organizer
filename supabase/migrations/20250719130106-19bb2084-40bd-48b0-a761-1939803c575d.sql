-- UI Flow Migration: Add city, team_code, coverage and home_fields tables

-- Add new columns to teams
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS team_code text UNIQUE DEFAULT substr(md5(random()::text), 1, 8);

-- Create coverage enum for tournaments
CREATE TYPE public.coverage_type AS ENUM ('international', 'regional', 'national', 'state', 'local');

-- Add coverage column to tournaments
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS coverage coverage_type DEFAULT 'local';

-- Add referee_id to fixtures  
ALTER TABLE public.fixtures
ADD COLUMN IF NOT EXISTS referee_id uuid REFERENCES public.users(id);

-- Create home_fields table
CREATE TABLE IF NOT EXISTS public.home_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, name)
);

-- Enable RLS on home_fields
ALTER TABLE public.home_fields ENABLE ROW LEVEL SECURITY;

-- RLS policies for home_fields
CREATE POLICY "Team admins can manage their home fields" 
ON public.home_fields 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM teams t 
  JOIN users u ON t.admin_user_id = u.id 
  WHERE t.id = home_fields.team_id 
  AND u.auth_user_id = auth.uid()
));

CREATE POLICY "Anyone can view home fields of approved teams" 
ON public.home_fields 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM teams t 
  WHERE t.id = home_fields.team_id 
  AND t.enrollment_status = 'approved'
));

-- Update tournaments RLS to allow organizers to update while in draft/enrolling status
DROP POLICY IF EXISTS "Organizers can update their tournaments" ON public.tournaments;
CREATE POLICY "Organizers can update their tournaments" 
ON public.tournaments 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = tournaments.organizer_id 
  AND users.auth_user_id = auth.uid()
  AND tournaments.status IN ('draft', 'enrolling', 'scheduled')
));

-- Update fixtures RLS to allow home teams to update venue
CREATE POLICY "Home teams can update venue" 
ON public.fixtures 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM teams t 
  JOIN users u ON t.admin_user_id = u.id 
  WHERE t.id = fixtures.home_team_id 
  AND u.auth_user_id = auth.uid() 
  AND fixtures.status = 'scheduled'
));

-- RLS for referees to see their assigned fixtures
CREATE POLICY "Referees can view their fixtures" 
ON public.fixtures 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = fixtures.referee_id 
  AND users.auth_user_id = auth.uid()
  AND users.role = 'referee'
));

CREATE POLICY "Referees can update their fixtures" 
ON public.fixtures 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = fixtures.referee_id 
  AND users.auth_user_id = auth.uid()
  AND users.role = 'referee'
));

-- Add update trigger for home_fields
CREATE TRIGGER update_home_fields_updated_at
BEFORE UPDATE ON public.home_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();