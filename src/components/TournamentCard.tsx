import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tournament } from '@/hooks/useTournaments';
import { useStartTournament } from '@/hooks/useTournamentManagement';
import { Settings, Trophy, Users, BarChart3, Calendar, Play } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  onEdit: (tournament: Tournament) => void;
  onViewFixtures: (tournament: Tournament) => void;
  onViewStats: (tournament: Tournament) => void;
  onManageReferees: (tournament: Tournament) => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onEdit,
  onViewFixtures,
  onViewStats,
  onManageReferees
}) => {
  const startTournament = useStartTournament();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolling':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'finished':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolling':
        return 'Inscripciones Abiertas';
      case 'active':
        return 'En Curso';
      case 'finished':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const teamCount = (tournament as any).teams ? (tournament as any).teams.length : 0;
  const maxTeams = tournament.max_teams || 16;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow" data-testid="tournament-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-primary">
            {tournament.name}
          </CardTitle>
          <Badge className={getStatusColor(tournament.status || 'enrolling')}>
            {getStatusText(tournament.status || 'enrolling')}
          </Badge>
        </div>
        {tournament.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {tournament.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Equipos:</span>
            <span className="font-medium" data-testid="team-count">{teamCount}/{maxTeams}</span>
          </div>
          
          {tournament.enrollment_deadline && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fecha límite:</span>
              <span className="font-medium">
                {new Date(tournament.enrollment_deadline).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Visibilidad:</span>
            <Badge variant={tournament.visibility === 'public' ? 'default' : 'secondary'}>
              {tournament.visibility === 'public' ? 'Público' : 'Privado'}
            </Badge>
          </div>

          {tournament.tournament_data && typeof tournament.tournament_data === 'object' && (
            <div className="space-y-2 text-sm">
              {(tournament.tournament_data as any).categoria && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="font-medium">{(tournament.tournament_data as any).categoria}</span>
                </div>
              )}
              {(tournament.tournament_data as any).tipoFutbol && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{(tournament.tournament_data as any).tipoFutbol}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <div className="space-y-2 w-full">
          {/* Start Tournament Button - Only show if enrolling status and has teams */}
          {tournament.status === 'enrolling' && teamCount >= 2 && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => startTournament.mutate(tournament.id)}
              disabled={startTournament.isPending}
              className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700"
              data-testid="start-tournament-button"
            >
              <Play className="w-4 h-4" />
              {startTournament.isPending ? 'Iniciando...' : 'Iniciar Torneo'}
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(tournament)}
              className="flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              Configurar
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewFixtures(tournament)}
              className="flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              Fixture
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onManageReferees(tournament)}
              className="flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              Árbitros
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewStats(tournament)}
              className="flex items-center gap-1"
            >
              <BarChart3 className="w-3 h-3" />
              Estadísticas
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;