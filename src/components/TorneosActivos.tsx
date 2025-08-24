import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useState } from 'react';
import TournamentStatisticsModal from './TournamentStatisticsModal';
import TournamentActiveCard from './TournamentActiveCard';

interface ActiveTournament {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  team_registrations: {
    status: string;
    team: {
      id: string;
      name: string;
    };
  }[];
}

const TorneosActivos = () => {
  const { currentUser } = useAuth();
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  const { data: activeTournaments = [], isLoading } = useQuery({
    queryKey: ['active-tournaments', currentUser?.id],
    queryFn: async () => {
      console.log('🔍 TorneosActivos DEBUG - currentUser:', currentUser);
      if (!currentUser) {
        console.log('❌ No currentUser found');
        return [];
      }

      // Primero obtenemos los equipos donde el usuario actual es admin
      const { data: userTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('admin_user_id', currentUser.id);

      console.log('🔍 TorneosActivos DEBUG - userTeams query result:', { userTeams, teamsError });

      if (teamsError) {
        console.error('Error fetching user teams:', teamsError);
        throw teamsError;
      }

      if (!userTeams || userTeams.length === 0) {
        console.log('❌ No teams found for user:', currentUser.id);
        return [];
      }

      const teamIds = userTeams.map(team => team.id);
      console.log('🔍 TorneosActivos DEBUG - teamIds:', teamIds);

      // Ahora obtenemos los team_registrations aprobados para esos equipos
      const { data, error } = await supabase
        .from('team_registrations')
        .select(`
          status,
          team_id,
          tournament_id,
          tournaments!inner(
            id,
            name,
            status,
            start_date,
            end_date
          )
        `)
        .eq('status', 'approved')
        .in('team_id', teamIds)
        .in('tournaments.status', ['enrolling', 'scheduled', 'in_progress']);
      console.log('🔍 TorneosActivos DEBUG - registrations query result:', { data, error });

      if (error) {
        console.error('Error fetching active tournaments:', error);
        throw error;
      }

      // Transformar los datos al formato esperado y ordenar por fecha de inicio
      const transformedData = data?.map(registration => {
        // Buscar el equipo correspondiente en userTeams
        const team = userTeams.find(t => t.id === registration.team_id);
        
        return {
          id: registration.tournaments.id,
          name: registration.tournaments.name,
          status: registration.tournaments.status,
          start_date: registration.tournaments.start_date,
          end_date: registration.tournaments.end_date,
          team_registrations: [{
            status: registration.status,
            team: {
              id: registration.team_id,
              name: team?.name || 'Equipo desconocido'
            }
          }]
        };
      }) || [];

      // Ordenar por fecha de inicio en el cliente
      transformedData.sort((a, b) => {
        if (!a.start_date && !b.start_date) return 0;
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });

      console.log('🔍 TorneosActivos DEBUG - transformedData:', transformedData);

      return transformedData as ActiveTournament[];
    },
    enabled: !!currentUser,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activeTournaments.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay partidos</h3>
        <p className="text-gray-500">
          No tienes partidos programados o finalizados.
          Ve a "Buscar Torneos" para encontrar torneos disponibles.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolling':
        return <Badge variant="outline">Inscribiendo</Badge>;
      case 'scheduled':
        return <Badge variant="default">Programado</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">En Progreso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Partidos</h2>
        <Badge variant="secondary">{activeTournaments.length} torneo(s)</Badge>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {activeTournaments.map((tournament) => (
          <TournamentActiveCard 
            key={tournament.id} 
            tournament={tournament}
            onViewStatistics={() => setSelectedTournament(tournament.id)}
          />
        ))}
      </div>

      {selectedTournament && (
        <TournamentStatisticsModal
          tournamentId={selectedTournament}
          isOpen={!!selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  );
};

export default TorneosActivos;