
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Tournament = Tables<'tournaments'>;
export type TournamentInsert = TablesInsert<'tournaments'>;
export type TournamentUpdate = TablesUpdate<'tournaments'>;

export const useTournaments = (organizerId?: string, userCity?: string) => {
  const queryClient = useQueryClient();

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: organizerId ? ['tournaments', 'organizer', organizerId] : ['tournaments', userCity],
    queryFn: async () => {
      let query = supabase
        .from('tournaments')
        .select(`
          *,
          organizer:organizer_id(id, full_name, email),
          teams(id, name, enrollment_status)
        `);
      
      if (organizerId) {
        query = query.eq('organizer_id', organizerId);
      } else if (userCity) {
        // Filter by coverage based on user's city
        // This is a simplified filter - you might want more complex logic
        query = query.in('coverage', ['local', 'state', 'national', 'regional', 'international']);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (tournament: TournamentInsert) => {
      const { data, error } = await supabase
        .from('tournaments')
        .insert(tournament)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });

  const updateTournamentMutation = useMutation({
    mutationFn: async ({ id, ...updates }: TournamentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });

  const deleteTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const { error } = await supabase.rpc('delete_tournament_cascade', {
        tournament_id: tournamentId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success('Torneo eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el torneo');
    },
  });

  return {
    tournaments,
    isLoading,
    createTournament: createTournamentMutation.mutateAsync,
    updateTournament: updateTournamentMutation.mutateAsync,
    deleteTournament: deleteTournamentMutation.mutateAsync,
  };
};

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          organizer:organizer_id(id, full_name, email),
          teams(
            id, 
            name, 
            logo_url, 
            enrollment_status,
            team_members(id, name, position, jersey_number, member_type)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
