import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tournament } from './useTournaments';

export const useTeamInvitations = (teamCode?: string) => {
  return useQuery({
    queryKey: ['team-invitations', teamCode],
    queryFn: async () => {
      if (!teamCode) return [];

      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          organizer:organizer_id(id, full_name, email)
        `)
        .contains('invite_codes', [teamCode])
        .eq('status', 'enrolling')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Tournament[];
    },
    enabled: !!teamCode,
  });
};