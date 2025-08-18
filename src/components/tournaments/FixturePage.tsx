import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Trophy, MapPin, Clock, Users, Edit, Settings } from 'lucide-react';
import { useTournamentFixtures } from '@/hooks/useTournamentRegistrations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import FixtureMatchEditor from '../FixtureMatchEditor';

interface FixturePageProps {
  tournamentId: string;
  tournamentName: string;
}

export const FixturePage: React.FC<FixturePageProps> = ({
  tournamentId,
  tournamentName,
}) => {
  const { currentUser } = useAuth();
  const { data: fixtures, isLoading } = useTournamentFixtures(tournamentId);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Por ahora, asumimos que el componente se usa desde el panel de organizador
  // Si se necesita verificación adicional, se puede obtener el torneo por separado
  const isOrganizer = true; // Temporal - mejorar con verificación real

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando fixture...</p>
      </div>
    );
  }

  if (!fixtures || fixtures.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Fixture no disponible</h3>
          <p className="text-muted-foreground">
            El fixture aún no ha sido generado para este torneo
          </p>
        </CardContent>
      </Card>
    );
  }

  // Agrupar fixtures por jornada
  const fixturesByMatchDay = fixtures.reduce((acc, fixture) => {
    if (!acc[fixture.match_day]) {
      acc[fixture.match_day] = [];
    }
    acc[fixture.match_day].push(fixture);
    return acc;
  }, {} as Record<number, typeof fixtures>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Programado</Badge>;
      case 'live':
        return <Badge className="bg-red-100 text-red-800">En vivo</Badge>;
      case 'finished':
        return <Badge className="bg-green-100 text-green-800">Finalizado</Badge>;
      case 'postponed':
        return <Badge className="bg-yellow-100 text-yellow-800">Aplazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            {tournamentName} - Fixture
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Calendario completo de partidos del torneo
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {Object.keys(fixturesByMatchDay).length} jornadas
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {fixtures.length} partidos totales
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixture por jornadas */}
      {Object.keys(fixturesByMatchDay)
        .sort((a, b) => Number(a) - Number(b))
        .map((matchDay) => (
          <Card key={matchDay}>
            <CardHeader>
              <CardTitle className="text-lg">Jornada {matchDay}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fixturesByMatchDay[Number(matchDay)].map((fixture) => (
                  <div
                    key={fixture.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Equipos */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Equipo local */}
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="font-medium text-right">
                          {fixture.home_teams?.name}
                        </span>
                        {fixture.home_teams?.logo_url ? (
                          <img 
                            src={fixture.home_teams.logo_url} 
                            alt={`Logo de ${fixture.home_teams.name}`}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Marcador / VS */}
                      <div className="flex items-center gap-2 min-w-[100px] justify-center">
                        {fixture.status === 'finished' ? (
                          <div className="text-lg font-bold">
                            {fixture.home_score} - {fixture.away_score}
                          </div>
                        ) : (
                          <div className="text-lg font-medium text-muted-foreground">
                            VS
                          </div>
                        )}
                      </div>

                      {/* Equipo visitante */}
                      <div className="flex items-center gap-2 flex-1">
                        {fixture.away_teams?.logo_url ? (
                          <img 
                            src={fixture.away_teams.logo_url} 
                            alt={`Logo de ${fixture.away_teams.name}`}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <span className="font-medium">
                          {fixture.away_teams?.name}
                        </span>
                      </div>
                    </div>

                    {/* Info del partido */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {/* Fecha y hora */}
                      {fixture.kickoff && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(fixture.kickoff), 'dd/MM HH:mm', { locale: es })}
                        </div>
                      )}

                      {/* Venue */}
                      {fixture.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {fixture.venue}
                        </div>
                      )}

                      {/* Estado */}
                      {getStatusBadge(fixture.status)}
                      
                      {/* Botón de editar para organizadores */}
                      {isOrganizer && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMatch(fixture);
                            setShowEditModal(true);
                          }}
                          className="ml-2"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
      {/* Modal de edición para organizadores */}
      {selectedMatch && showEditModal && (
        <FixtureMatchEditor
          match={selectedMatch}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMatch(null);
          }}
        />
      )}
    </div>
  );
};