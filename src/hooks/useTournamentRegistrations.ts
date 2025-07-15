import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  team_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  approved_at?: string;
  team?: {
    id: string;
    name: string;
    logo_url?: string;
    invite_code: string;
  };
  tournament?: {
    id: string;
    name: string;
    visibility: 'public' | 'invite';
  };
}

// Hook para obtener torneos públicos
export const usePublicTournaments = () => {
  return useQuery({
    queryKey: ['public-tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          id,
          name,
          description,
          status,
          start_date,
          end_date,
          enrollment_deadline,
          max_teams,
          visibility,
          organizer_id,
          users!tournaments_organizer_id_fkey(full_name)
        `)
        .eq('visibility', 'public')
        .eq('status', 'enrolling')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Hook para buscar torneos por código de invitación
export const useInviteSearch = (inviteCode: string) => {
  return useQuery({
    queryKey: ['invite-tournaments', inviteCode],
    queryFn: async () => {
      if (!inviteCode || inviteCode.length < 3) return [];

      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          id,
          name,
          description,
          status,
          start_date,
          end_date,
          enrollment_deadline,
          max_teams,
          visibility,
          invite_codes,
          organizer_id,
          users!tournaments_organizer_id_fkey(full_name)
        `)
        .eq('visibility', 'invite')
        .eq('status', 'enrolling')
        .contains('invite_codes', [inviteCode]);

      if (error) throw error;
      return data;
    },
    enabled: Boolean(inviteCode && inviteCode.length >= 3),
  });
};

// Hook para solicitar inscripción a un torneo
export const useRequestRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tournamentId,
      teamId,
    }: {
      tournamentId: string;
      teamId: string;
    }) => {
      const { data, error } = await supabase
        .from('team_registrations')
        .insert({
          tournament_id: tournamentId,
          team_id: teamId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Solicitud de inscripción enviada correctamente');
      queryClient.invalidateQueries({ queryKey: ['team-registrations'] });
    },
    onError: (error: any) => {
      console.error('Error requesting registration:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('Ya has solicitado inscripción a este torneo');
      } else {
        toast.error('Error al solicitar inscripción: ' + error.message);
      }
    },
  });
};

// Hook para obtener solicitudes de inscripción de un torneo (organizador)
export const useRegistrationRequests = (tournamentId: string) => {
  return useQuery({
    queryKey: ['registration-requests', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_registrations')
        .select(`
          id,
          tournament_id,
          team_id,
          status,
          requested_at,
          approved_at,
          teams!inner(
            id,
            name,
            logo_url,
            invite_code,
            admin_user_id
          ),
          team_users:teams!inner(users!teams_admin_user_id_fkey(full_name, email))
        `)
        .eq('tournament_id', tournamentId)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as TournamentRegistration[];
    },
    enabled: Boolean(tournamentId),
  });
};

// Hook para aprobar/rechazar inscripción
export const useApproveRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      registrationId,
      status,
      tournamentId,
    }: {
      registrationId: string;
      status: 'approved' | 'rejected';
      tournamentId: string;
    }) => {
      const updateData: any = { status };
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('team_registrations')
        .update(updateData)
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status, tournamentId }) => {
      toast.success(
        status === 'approved' 
          ? 'Equipo aprobado correctamente' 
          : 'Solicitud rechazada'
      );
      queryClient.invalidateQueries({ 
        queryKey: ['registration-requests', tournamentId] 
      });
    },
    onError: (error: any) => {
      console.error('Error updating registration:', error);
      toast.error('Error al actualizar la solicitud: ' + error.message);
    },
  });
};

// Hook para generar fixture
export const useGenerateFixture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-fixture', {
        body: { tournament_id: tournamentId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, tournamentId) => {
      toast.success(`Fixture generado: ${data.fixtures_created} partidos en ${data.match_days} jornadas`);
      queryClient.invalidateQueries({ 
        queryKey: ['registration-requests', tournamentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['tournament-fixtures', tournamentId] 
      });
    },
    onError: (error: any) => {
      console.error('Error generating fixture:', error);
      toast.error('Error al generar fixture: ' + error.message);
    },
  });
};

// Hook para obtener mis registraciones como equipo
export const useMyRegistrations = () => {
  return useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_registrations')
        .select(`
          id,
          status,
          requested_at,
          approved_at,
          tournaments!inner(
            id,
            name,
            description,
            status,
            start_date,
            end_date,
            visibility
          )
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener fixtures de un torneo
export const useTournamentFixtures = (tournamentId: string) => {
  return useQuery({
    queryKey: ['tournament-fixtures', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          id,
          match_day,
          home_score,
          away_score,
          status,
          kickoff,
          venue,
          home_teams:teams!fixtures_home_team_id_fkey(id, name, logo_url),
          away_teams:teams!fixtures_away_team_id_fkey(id, name, logo_url)
        `)
        .eq('tournament_id', tournamentId)
        .order('match_day', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: Boolean(tournamentId),
  });
};