import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddTeamsData {
  tournamentId: string;
  teamIds: string[];
}

export const useAddTeamsToTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, teamIds }: AddTeamsData) => {
      // Preparar los registros para insertar
      const registrations = teamIds.map(teamId => ({
        tournament_id: tournamentId,
        team_id: teamId,
        status: 'approved' as const,
        approved_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('team_registrations')
        .insert(registrations)
        .select(`
          *,
          teams(id, name, logo_url),
          tournaments(id, name)
        `);

      if (error) {
        console.error('Error adding teams to tournament:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['registration-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      
      const teamCount = data.length;
      toast.success(`${teamCount} equipo${teamCount > 1 ? 's' : ''} agregado${teamCount > 1 ? 's' : ''} al torneo exitosamente`);
    },
    onError: (error: any) => {
      console.error('Add teams error:', error);
      toast.error(error.message || 'Error al agregar equipos al torneo');
    },
  });
};