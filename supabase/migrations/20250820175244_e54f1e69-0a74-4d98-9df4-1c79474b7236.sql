-- Add referee credentials to users table
ALTER TABLE users ADD COLUMN referee_credential VARCHAR(20);

-- Create index on referee_credential for better search performance
CREATE INDEX idx_users_referee_credential ON users(referee_credential) WHERE referee_credential IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.referee_credential IS 'Referee license/credential number for referee users';

-- Create a table to track tournament referees
CREATE TABLE tournament_referees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, referee_id)
);

-- Enable RLS on tournament_referees
ALTER TABLE tournament_referees ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for tournament_referees
CREATE POLICY "Tournament organizers can manage their tournament referees"
ON tournament_referees
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN users u ON t.organizer_id = u.id
    WHERE t.id = tournament_referees.tournament_id
    AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Referees can view tournaments they're assigned to"
ON tournament_referees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = tournament_referees.referee_id
    AND u.auth_user_id = auth.uid()
    AND u.role = 'referee'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_tournament_referees_updated_at
BEFORE UPDATE ON tournament_referees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();