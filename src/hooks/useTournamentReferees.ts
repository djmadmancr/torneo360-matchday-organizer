import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTournamentReferees = (tournamentId: string) => {
  const queryClient = useQueryClient();

  // Get tournament referees
  const { data: referees = [], isLoading } = useQuery({
    queryKey: ['tournament-referees', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_referees')
        .select(`
          id,
          referee_id,
          created_at,
          users!referee_id(
            id,
            full_name,
            email,
            referee_credential,
            city,
            country
          )
        `)
        .eq('tournament_id', tournamentId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId,
  });

  // Add referee to tournament
  const addRefereeMutation = useMutation({
    mutationFn: async (refereeId: string) => {
      const { error } = await supabase
        .from('tournament_referees')
        .insert({
          tournament_id: tournamentId,
          referee_id: refereeId
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-referees', tournamentId] });
      toast.success('Árbitro agregado al torneo');
    },
    onError: (error: any) => {
      toast.error('Error al agregar árbitro: ' + error.message);
    }
  });

  // Remove referee from tournament
  const removeRefereeMutation = useMutation({
    mutationFn: async (refereeId: string) => {
      const { error } = await supabase
        .from('tournament_referees')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('referee_id', refereeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-referees', tournamentId] });
      toast.success('Árbitro removido del torneo');
    },
    onError: (error: any) => {
      toast.error('Error al remover árbitro: ' + error.message);
    }
  });

  // Auto-assign referees to matches when fixture is generated
  const autoAssignRefereesMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      // Get tournament referees
      const { data: tournamentReferees, error: refError } = await supabase
        .from('tournament_referees')
        .select('referee_id')
        .eq('tournament_id', tournamentId);

      if (refError) throw refError;

      if (!tournamentReferees || tournamentReferees.length === 0) {
        throw new Error('No hay árbitros asignados al torneo');
      }

      // Get matches without referees
      const { data: matches, error: matchError } = await supabase
        .from('fixtures')
        .select('id')
        .eq('tournament_id', tournamentId)
        .is('referee_id', null);

      if (matchError) throw matchError;

      if (!matches || matches.length === 0) {
        return { message: 'No hay partidos sin árbitro asignado' };
      }

      // Randomly assign referees to matches
      const updates = matches.map((match, index) => {
        const refereeIndex = index % tournamentReferees.length;
        return {
          id: match.id,
          referee_id: tournamentReferees[refereeIndex].referee_id
        };
      });

      // Update matches with assigned referees
      for (const update of updates) {
        const { error } = await supabase
          .from('fixtures')
          .update({ referee_id: update.referee_id })
          .eq('id', update.id);

        if (error) throw error;
      }

      return { assignedMatches: updates.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      if (result.assignedMatches) {
        toast.success(`Árbitros asignados automáticamente a ${result.assignedMatches} partidos`);
      } else {
        toast.info(result.message);
      }
    },
    onError: (error: any) => {
      toast.error('Error en asignación automática: ' + error.message);
    }
  });

  return {
    referees,
    isLoading,
    addReferee: addRefereeMutation.mutate,
    removeReferee: removeRefereeMutation.mutate,
    autoAssignReferees: autoAssignRefereesMutation.mutate,
    isAddingReferee: addRefereeMutation.isPending,
    isRemovingReferee: removeRefereeMutation.isPending,
    isAutoAssigning: autoAssignRefereesMutation.isPending,
  };
};