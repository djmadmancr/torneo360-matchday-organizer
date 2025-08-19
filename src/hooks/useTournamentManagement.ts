import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CoverageType = 'international' | 'regional' | 'national' | 'state' | 'local';

export interface TournamentUpdate {
  id: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  max_teams?: number;
  coverage?: CoverageType;
  invite_codes?: string[];
  description?: string;
}

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TournamentUpdate) => {
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
      toast.success('Torneo actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el torneo');
    },
  });
};

export const useStartTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      // First update tournament status
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ status: 'scheduled' })
        .eq('id', tournamentId);
      
      if (updateError) throw updateError;

      // Then call the generate-fixture edge function
      const { data, error } = await supabase.functions.invoke('generate-fixture', {
        body: { tournament_id: tournamentId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      toast.success('¡Torneo iniciado! Se ha generado el fixture automáticamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al iniciar el torneo');
    },
  });
};

export const useAssignReferee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, refereeId }: { matchId: string; refereeId: string | null }) => {
      const { data, error } = await supabase
        .from('fixtures')
        .update({ referee_id: refereeId })
        .eq('id', matchId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      toast.success('Fiscal asignado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al asignar fiscal');
    },
  });
};
