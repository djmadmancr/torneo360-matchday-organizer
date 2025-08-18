import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin, BarChart3 } from "lucide-react";
import { useState } from 'react';
import TournamentStatisticsModal from './TournamentStatisticsModal';

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
      if (!currentUser) return [];

      // Primero obtenemos los equipos donde el usuario actual es admin
      const { data: userTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .eq('admin_user_id', currentUser.id);

      if (teamsError) {
        console.error('Error fetching user teams:', teamsError);
        throw teamsError;
      }

      if (!userTeams || userTeams.length === 0) {
        return [];
      }

      const teamIds = userTeams.map(team => team.id);

      // Ahora obtenemos los team_registrations aprobados para esos equipos
      const { data, error } = await supabase
        .from('team_registrations')
        .select(`
          status,
          tournaments!inner(
            id,
            name,
            status,
            start_date,
            end_date
          ),
          teams!inner(
            id,
            name
          )
        `)
        .eq('status', 'approved')
        .in('team_id', teamIds)
        .in('tournaments.status', ['enrolling', 'scheduled', 'in_progress'])
        .order('tournaments.start_date', { ascending: true });

      if (error) {
        console.error('Error fetching active tournaments:', error);
        throw error;
      }

      // Transformar los datos al formato esperado
      const transformedData = data.map(registration => ({
        id: registration.tournaments.id,
        name: registration.tournaments.name,
        status: registration.tournaments.status,
        start_date: registration.tournaments.start_date,
        end_date: registration.tournaments.end_date,
        team_registrations: [{
          status: registration.status,
          team: {
            id: registration.teams.id,
            name: registration.teams.name
          }
        }]
      }));

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
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay torneos activos</h3>
        <p className="text-gray-500">
          Tu equipo no está registrado en ningún torneo activo. 
          Ve a "Buscar Torneos" para encontrar torneos disponibles.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
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
        <h2 className="text-2xl font-bold">Torneos Activos</h2>
        <Badge variant="secondary">{activeTournaments.length} torneo(s)</Badge>
      </div>

      <div className="grid gap-4">
        {activeTournaments.map((tournament) => (
          <Card key={tournament.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  {tournament.name}
                </CardTitle>
                {getStatusBadge(tournament.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Inicio:</span>
                  <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Fin:</span>
                  <span>{new Date(tournament.end_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Mi equipo: <span className="font-medium text-foreground">
                    {tournament.team_registrations[0]?.team.name}
                  </span>
                </div>
                <Button
                  onClick={() => setSelectedTournament(tournament.id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Ver Estadísticas
                </Button>
              </div>
            </CardContent>
          </Card>
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