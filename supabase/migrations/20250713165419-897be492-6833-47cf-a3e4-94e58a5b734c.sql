-- Add roles column to support multiple roles per user
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '["team_admin"]';

-- Update existing users to have roles array based on their current role
UPDATE public.users 
SET roles = CASE 
  WHEN role = 'admin' THEN '["admin"]'
  WHEN role = 'organizer' THEN '["organizer"]'
  WHEN role = 'referee' THEN '["referee"]'
  WHEN role = 'team_admin' THEN '["team_admin"]'
  ELSE '["team_admin"]'
END::jsonb
WHERE roles = '["team_admin"]' OR roles IS NULL;

-- Create index for roles column for better performance
CREATE INDEX IF NOT EXISTS idx_users_roles ON public.users USING GIN(roles);