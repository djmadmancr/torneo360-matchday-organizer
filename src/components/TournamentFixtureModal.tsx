import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Trophy, MapPin, Clock, Users, Edit, BarChart3, Crown, Target } from 'lucide-react';
import { useTournamentFixtures } from '@/hooks/useTournamentRegistrations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import FixtureMatchEditor from './FixtureMatchEditor';
import { Tournament } from '@/hooks/useTournaments';

interface TournamentFixtureModalProps {
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentFixtureModal: React.FC<TournamentFixtureModalProps> = ({
  tournament,
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { data: fixtures, isLoading } = useTournamentFixtures(tournament.id);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Verificar si el usuario es organizador del torneo
  const isOrganizer = tournament.organizer_id === currentUser?.id;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Programado</Badge>;
      case 'live':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse">En vivo</Badge>;
      case 'finished':
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">Finalizado</Badge>;
      case 'postponed':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Aplazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTeamStats = () => {
    if (!fixtures || fixtures.length === 0) return [];
    
    const teamStats: Record<string, {
      name: string;
      logo_url?: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
    }> = {};

    // Inicializar estadísticas de equipos
    fixtures.forEach(fixture => {
      if (fixture.home_teams && !teamStats[fixture.home_teams.id]) {
        teamStats[fixture.home_teams.id] = {
          name: fixture.home_teams.name,
          logo_url: fixture.home_teams.logo_url,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        };
      }
      if (fixture.away_teams && !teamStats[fixture.away_teams.id]) {
        teamStats[fixture.away_teams.id] = {
          name: fixture.away_teams.name,
          logo_url: fixture.away_teams.logo_url,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        };
      }
    });

    // Calcular estadísticas basadas en partidos finalizados
    fixtures
      .filter(fixture => fixture.status === 'finished')
      .forEach(fixture => {
        if (fixture.home_teams && fixture.away_teams) {
          const homeTeam = teamStats[fixture.home_teams.id];
          const awayTeam = teamStats[fixture.away_teams.id];
          
          homeTeam.played++;
          awayTeam.played++;
          
          homeTeam.goalsFor += fixture.home_score || 0;
          homeTeam.goalsAgainst += fixture.away_score || 0;
          awayTeam.goalsFor += fixture.away_score || 0;
          awayTeam.goalsAgainst += fixture.home_score || 0;
          
          if ((fixture.home_score || 0) > (fixture.away_score || 0)) {
            homeTeam.won++;
            homeTeam.points += 3;
            awayTeam.lost++;
          } else if ((fixture.home_score || 0) < (fixture.away_score || 0)) {
            awayTeam.won++;
            awayTeam.points += 3;
            homeTeam.lost++;
          } else {
            homeTeam.drawn++;
            awayTeam.drawn++;
            homeTeam.points += 1;
            awayTeam.points += 1;
          }
        }
      });

    return Object.values(teamStats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const goalDiffA = a.goalsFor - a.goalsAgainst;
      const goalDiffB = b.goalsFor - b.goalsAgainst;
      if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA;
      return b.goalsFor - a.goalsFor;
    });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando información del torneo...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const fixturesByMatchDay = fixtures?.reduce((acc, fixture) => {
    if (!acc[fixture.match_day]) {
      acc[fixture.match_day] = [];
    }
    acc[fixture.match_day].push(fixture);
    return acc;
  }, {} as Record<number, typeof fixtures>) || {};

  const teamStats = getTeamStats();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Trophy className="w-6 h-6 text-primary" />
              {tournament.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="fixtures" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fixtures" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fixture
              </TabsTrigger>
              <TabsTrigger value="standings" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Tabla de Posiciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fixtures" className="space-y-6">
              {!fixtures || fixtures.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Fixture no disponible</h3>
                    <p className="text-muted-foreground">
                      El fixture aún no ha sido generado para este torneo
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Resumen del torneo */}
                  <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Trophy className="w-5 h-5" />
                        Información del Torneo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{Object.keys(fixturesByMatchDay).length} jornadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{fixtures.length} partidos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{teamStats.length} equipos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-muted-foreground" />
                          <Badge variant="outline">{tournament.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fixture por jornadas */}
                  {Object.keys(fixturesByMatchDay)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((matchDay) => (
                      <Card key={matchDay} className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Jornada {matchDay}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {fixturesByMatchDay[Number(matchDay)].map((fixture, index) => (
                              <div
                                key={fixture.id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${
                                  fixture.status === 'live' ? 'bg-red-50 border-l-4 border-red-500' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  {/* Equipos y marcador */}
                                  <div className="flex items-center gap-4 flex-1">
                                    {/* Equipo local */}
                                    <div className="flex items-center gap-3 flex-1 justify-end">
                                      <span className="font-medium text-right">
                                        {fixture.home_teams?.name}
                                      </span>
                                      {fixture.home_teams?.logo_url ? (
                                        <img 
                                          src={fixture.home_teams.logo_url} 
                                          alt={`Logo de ${fixture.home_teams.name}`}
                                          className="w-8 h-8 object-cover rounded-full border-2 border-gray-200"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                                          <Trophy className="w-4 h-4 text-gray-500" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Marcador */}
                                    <div className="flex items-center gap-2 min-w-[120px] justify-center">
                                      {fixture.status === 'finished' ? (
                                        <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                                          {fixture.home_score} - {fixture.away_score}
                                        </div>
                                      ) : fixture.status === 'live' ? (
                                        <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent animate-pulse">
                                          {(fixture.home_score || 0)} - {(fixture.away_score || 0)}
                                        </div>
                                      ) : (
                                        <div className="text-lg font-medium text-muted-foreground">
                                          VS
                                        </div>
                                      )}
                                    </div>

                                    {/* Equipo visitante */}
                                    <div className="flex items-center gap-3 flex-1">
                                      {fixture.away_teams?.logo_url ? (
                                        <img 
                                          src={fixture.away_teams.logo_url} 
                                          alt={`Logo de ${fixture.away_teams.name}`}
                                          className="w-8 h-8 object-cover rounded-full border-2 border-gray-200"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                                          <Trophy className="w-4 h-4 text-gray-500" />
                                        </div>
                                      )}
                                      <span className="font-medium">
                                        {fixture.away_teams?.name}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Info del partido */}
                                  <div className="flex items-center gap-4 text-sm">
                                    {/* Fecha y hora */}
                                    {fixture.kickoff && (
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        {format(new Date(fixture.kickoff), 'dd/MM HH:mm', { locale: es })}
                                      </div>
                                    )}

                                    {/* Venue */}
                                    {fixture.venue && (
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span className="max-w-32 truncate">{fixture.venue}</span>
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
                                        className="ml-2 hover:bg-primary hover:text-white transition-colors"
                                      >
                                        <Edit className="w-3 h-3 mr-1" />
                                        Editar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="standings" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Tabla de Posiciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-center w-16">PJ</TableHead>
                        <TableHead className="text-center w-16">G</TableHead>
                        <TableHead className="text-center w-16">E</TableHead>
                        <TableHead className="text-center w-16">P</TableHead>
                        <TableHead className="text-center w-16">GF</TableHead>
                        <TableHead className="text-center w-16">GC</TableHead>
                        <TableHead className="text-center w-16">DG</TableHead>
                        <TableHead className="text-center w-16 font-bold">PTS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamStats.map((team, index) => (
                        <TableRow 
                          key={team.name} 
                          className={`hover:bg-gray-50 ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400' : index < 3 ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400' : ''}`}
                        >
                          <TableCell className="text-center font-medium">
                            {index === 0 ? (
                              <Crown className="w-5 h-5 text-yellow-600 mx-auto" />
                            ) : (
                              index + 1
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {team.logo_url ? (
                                <img 
                                  src={team.logo_url} 
                                  alt={`Logo de ${team.name}`}
                                  className="w-6 h-6 object-cover rounded-full border border-gray-200"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                                  <Trophy className="w-3 h-3 text-gray-500" />
                                </div>
                              )}
                              <span className="font-medium">{team.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{team.played}</TableCell>
                          <TableCell className="text-center text-green-600 font-medium">{team.won}</TableCell>
                          <TableCell className="text-center text-gray-600">{team.drawn}</TableCell>
                          <TableCell className="text-center text-red-600 font-medium">{team.lost}</TableCell>
                          <TableCell className="text-center">{team.goalsFor}</TableCell>
                          <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                          <TableCell className="text-center font-medium">
                            {team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}{team.goalsFor - team.goalsAgainst}
                          </TableCell>
                          <TableCell className="text-center font-bold text-primary">{team.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {teamStats.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay estadísticas disponibles aún</p>
                      <p className="text-sm">Las estadísticas se mostrarán cuando los partidos sean finalizados</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
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
    </>
  );
};