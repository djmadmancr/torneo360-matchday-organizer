-- Fix user roles for demo users
UPDATE users SET 
  role = 'organizer',
  roles = '["organizer"]'::jsonb
WHERE email = 'organizer@demo.com';

UPDATE users SET 
  role = 'referee', 
  roles = '["referee"]'::jsonb
WHERE email = 'referee@demo.com';

-- The admin and team_admin users are already correct

-- Update RLS policies for teams to allow team_admins to create teams
DROP POLICY IF EXISTS "Team admins can create teams" ON teams;

CREATE POLICY "Users can create teams for themselves" 
ON teams 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_user_id = auth.uid() 
    AND (
      users.role = ANY(ARRAY['team_admin', 'admin']) 
      OR users.roles ? 'team_admin' 
      OR users.roles ? 'admin'
    )
    AND teams.admin_user_id = users.id
  )
);

-- Allow team admins to view teams they own (even if not approved)
DROP POLICY IF EXISTS "Anyone can view approved teams" ON teams;

CREATE POLICY "Users can view teams" 
ON teams 
FOR SELECT 
USING (
  -- Anyone can see approved teams
  enrollment_status = 'approved' 
  OR 
  -- Team admins can see their own teams
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = teams.admin_user_id 
    AND users.auth_user_id = auth.uid()
  )
  OR
  -- Admins can see all teams
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_user_id = auth.uid() 
    AND (users.role = 'admin' OR users.roles ? 'admin')
  )
);