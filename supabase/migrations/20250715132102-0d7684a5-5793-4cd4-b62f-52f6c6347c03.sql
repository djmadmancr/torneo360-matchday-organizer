-- Add invite_code to teams table
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS invite_code text UNIQUE
DEFAULT (substr(md5(random()::text), 1, 6));

-- Update existing teams with invite codes
UPDATE public.teams 
SET invite_code = substr(md5(random()::text), 1, 6)
WHERE invite_code IS NULL;

-- Add tournament fields
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'invite')),
ADD COLUMN IF NOT EXISTS max_teams integer DEFAULT 16,
ADD COLUMN IF NOT EXISTS enrollment_deadline date,
ADD COLUMN IF NOT EXISTS invite_codes text[];

-- Create registration status enum
DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create team_registrations table
CREATE TABLE IF NOT EXISTS public.team_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
    team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    status registration_status DEFAULT 'pending',
    requested_at timestamp with time zone DEFAULT now(),
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(tournament_id, team_id)
);

-- Enable RLS on team_registrations
ALTER TABLE public.team_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public tournaments readable by anyone, invite tournaments only by participants/organizers/admins
CREATE POLICY "Public tournaments readable" ON public.tournaments FOR SELECT USING (
    visibility = 'public' 
    OR EXISTS (
        SELECT 1 FROM team_registrations r
        JOIN teams t ON t.id = r.team_id
        WHERE r.tournament_id = tournaments.id 
        AND t.admin_user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM users u 
        WHERE u.auth_user_id = auth.uid() 
        AND u.role = 'admin'
    )
    OR organizer_id = (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
);

-- RLS Policy: Teams can request registration if they have access
CREATE POLICY "Team requests registration" ON public.team_registrations FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM teams tm
        JOIN tournaments tt ON tt.id = tournament_id
        WHERE tm.id = team_id
        AND tm.admin_user_id = auth.uid()
        AND (
            tt.visibility = 'public'
            OR tm.invite_code = ANY(tt.invite_codes)
        )
    )
);

-- RLS Policy: Teams can view their own registrations
CREATE POLICY "Teams view own registrations" ON public.team_registrations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM teams t
        WHERE t.id = team_id AND t.admin_user_id = auth.uid()
    )
);

-- RLS Policy: Organizers can update registrations for their tournaments
CREATE POLICY "Organizer updates registration" ON public.team_registrations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM tournaments t
        WHERE t.id = tournament_id 
        AND t.organizer_id = (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    )
);

-- RLS Policy: Organizers and admins can view all registrations for their tournaments
CREATE POLICY "Organizer views tournament registrations" ON public.team_registrations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM tournaments t
        WHERE t.id = tournament_id 
        AND (
            t.organizer_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
            OR EXISTS (SELECT 1 FROM users u WHERE u.auth_user_id = auth.uid() AND u.role = 'admin')
        )
    )
);

-- Create updated_at trigger for team_registrations
CREATE TRIGGER update_team_registrations_updated_at
    BEFORE UPDATE ON public.team_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_team_registrations_tournament_id ON public.team_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_team_registrations_team_id ON public.team_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_registrations_status ON public.team_registrations(status);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON public.teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_tournaments_visibility ON public.tournaments(visibility);