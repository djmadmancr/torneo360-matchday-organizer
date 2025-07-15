import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Team {
  id: string;
  name: string;
  logo_url?: string;
  colors?: any;
  enrollment_status: string;
  admin_user_id: string;
  tournament_id?: string;
  team_data?: any;
  created_at: string;
  updated_at: string;
}

export interface TeamCreate {
  name: string;
  logo_url?: string;
  colors?: any;
  tournament_id?: string;
  team_data?: any;
}

export const useSupabaseTeams = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  console.log('🔑 useSupabaseTeams hook - currentUser:', currentUser?.id, currentUser?.email);

  // Get teams for current user
  const { data: teams = [], isLoading, error } = useQuery({
    queryKey: ['supabase-teams', currentUser?.id],
    queryFn: async () => {
      console.log('🏢 useSupabaseTeams query ejecutándose para usuario:', currentUser?.id);
      if (!currentUser) {
        console.log('❌ No hay currentUser, devolviendo array vacío');
        return [];
      }
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          tournament:tournament_id(id, name, status),
          team_members(id, name, position, jersey_number, member_type)
        `)
        .eq('admin_user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching teams:', error);
        throw error;
      }

      console.log('✅ Teams obtenidos:', data?.length || 0, 'equipos');
      return data;
    },
    enabled: !!currentUser,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: TeamCreate) => {
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          admin_user_id: currentUser.id,
          enrollment_status: 'approved'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating team:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supabase-teams'] });
      toast.success(`Equipo "${data.name}" creado exitosamente`);
    },
    onError: (error: any) => {
      console.error('Create team error:', error);
      toast.error(error.message || 'Error al crear el equipo');
    },
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TeamCreate>) => {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating team:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supabase-teams'] });
      toast.success(`Equipo "${data.name}" actualizado exitosamente`);
    },
    onError: (error: any) => {
      console.error('Update team error:', error);
      toast.error(error.message || 'Error al actualizar el equipo');
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) {
        console.error('Error deleting team:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-teams'] });
      toast.success('Equipo eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Delete team error:', error);
      toast.error(error.message || 'Error al eliminar el equipo');
    },
  });

  return {
    teams,
    isLoading,
    error,
    createTeam: createTeamMutation.mutateAsync,
    updateTeam: updateTeamMutation.mutateAsync,
    deleteTeam: deleteTeamMutation.mutateAsync,
    isCreating: createTeamMutation.isPending,
    isUpdating: updateTeamMutation.isPending,
    isDeleting: deleteTeamMutation.isPending,
  };
};