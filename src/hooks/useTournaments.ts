
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Tournament = Tables<'tournaments'>;
export type TournamentInsert = TablesInsert<'tournaments'>;
export type TournamentUpdate = TablesUpdate<'tournaments'>;

export const useTournaments = () => {
  const queryClient = useQueryClient();

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          organizer:organizer_id(id, full_name, email),
          teams(id, name, enrollment_status)
        `)
        .order('created_at', { ascending: false });
      
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

  return {
    tournaments,
    isLoading,
    createTournament: createTournamentMutation.mutateAsync,
    updateTournament: updateTournamentMutation.mutateAsync,
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
