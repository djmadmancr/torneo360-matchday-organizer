import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TournamentWithTeamCount {
  id: string;
  name: string;
  description: string | null;
  status: string;
  visibility: string;
  max_teams: number;
  enrollment_deadline: string | null;
  start_date: string | null;
  end_date: string | null;
  tournament_data: any;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  coverage: 'international' | 'regional' | 'national' | 'state' | 'local';
  invite_codes: string[] | null;
  restrict_by_country: boolean | null;
  allowed_countries: string[] | null;
  approved_teams_count: number;
}

export const useOrganizerTournaments = (organizerId?: string) => {
  return useQuery({
    queryKey: ['organizer-tournaments', organizerId],
    queryFn: async (): Promise<TournamentWithTeamCount[]> => {
      if (!organizerId) return [];

      // First get tournaments
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (tournamentsError) throw tournamentsError;

      // Then get team counts for each tournament
      const tournamentsWithCounts = await Promise.all(
        tournaments.map(async (tournament) => {
          const { data: approvedTeams, error: teamsError } = await supabase
            .from('team_registrations')
            .select('id')
            .eq('tournament_id', tournament.id)
            .eq('status', 'approved');

          if (teamsError) {
            console.error('Error fetching team count for tournament:', tournament.id, teamsError);
            return {
              ...tournament,
              approved_teams_count: 0
            };
          }

          return {
            ...tournament,
            approved_teams_count: approvedTeams?.length || 0
          };
        })
      );

      return tournamentsWithCounts;
    },
    enabled: !!organizerId,
  });
};