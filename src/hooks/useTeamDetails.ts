import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRegisteredTeams = (tournamentId: string) => {
  return useQuery({
    queryKey: ['registered-teams', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_registrations')
        .select(`
          id,
          status,
          team:teams (
            id,
            name,
            city,
            country,
            logo_url,
            colors,
            team_code,
            created_at,
            team_members (
              id,
              name,
              position,
              jersey_number,
              member_type
            ),
            home_fields (
              id,
              name,
              address,
              created_at
            ),
            admin_user:users!teams_admin_user_id_fkey (
              full_name,
              email
            )
          )
        `)
        .eq('tournament_id', tournamentId)
        .eq('status', 'approved');

      if (error) throw error;
      
      return data.map(registration => registration.team).filter(Boolean);
    },
    enabled: !!tournamentId,
  });
};