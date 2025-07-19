import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HomeField {
  id: string;
  team_id: string;
  name: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamWithFields {
  id: string;
  name: string;
  city?: string;
  team_code?: string;
  logo_url?: string;
  colors?: any;
  enrollment_status: string;
  created_at: string;
  team_members: any[];
  home_fields: HomeField[];
}

export const useMyTeams = () => {
  return useQuery({
    queryKey: ['my-teams'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          city,
          team_code,
          logo_url,
          colors,
          enrollment_status,
          created_at,
          team_members(id, name, position, jersey_number, member_type),
          home_fields(id, name, address, created_at, updated_at)
        `)
        .eq('admin_user_id', (await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()
        ).data?.id);

      if (error) throw error;
      return data as TeamWithFields[];
    },
  });
};

export const useUpsertHomeField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, name, address, id }: { 
      teamId: string; 
      name: string; 
      address?: string; 
      id?: string;
    }) => {
      if (id) {
        // Update existing field
        const { data, error } = await supabase
          .from('home_fields')
          .update({ name, address })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new field
        const { data, error } = await supabase
          .from('home_fields')
          .insert({ team_id: teamId, name, address })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      toast.success('Cancha guardada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al guardar la cancha');
    },
  });
};

export const useDeleteHomeField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from('home_fields')
        .delete()
        .eq('id', fieldId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      toast.success('Cancha eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar la cancha');
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, venue }: { matchId: string; venue: string }) => {
      const { data, error } = await supabase
        .from('fixtures')
        .update({ venue })
        .eq('id', matchId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      toast.success('Cancha del partido actualizada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar la cancha');
    },
  });
};