import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Calendar, Target, AlertTriangle, Medal, Clock } from "lucide-react";

interface TournamentStatisticsModalProps {
  tournamentId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TeamStats {
  team_id: string;
  team_name: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

interface Fixture {
  id: string;
  home_team: { id: string; name: string };
  away_team: { id: string; name: string };
  home_score: number;
  away_score: number;
  status: string;
  kickoff: string;
  venue: string;
  match_data: any;
}

interface PlayerStats {
  player_name: string;
  goals: number;
  yellow_cards: number;
  red_cards: number;
  team_name: string;
}

const TournamentStatisticsModal: React.FC<TournamentStatisticsModalProps> = ({
  tournamentId,
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

  // Fetch tournament details
  const { data: tournament } = useQuery({
    queryKey: ['tournament-details', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!tournamentId,
  });

  // Fetch team standings
  const { data: standings = [] } = useQuery({
    queryKey: ['tournament-standings', tournamentId],
    queryFn: async () => {
      const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('tournament_id', tournamentId)
        .in('status', ['completed', 'finished']);

      if (error) throw error;

      // Get all team IDs and fetch team names
      const teamIds = new Set<string>();
      fixtures?.forEach((fixture: any) => {
        if (fixture.home_team_id) teamIds.add(fixture.home_team_id);
        if (fixture.away_team_id) teamIds.add(fixture.away_team_id);
      });

      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', Array.from(teamIds));

      if (teamsError) throw teamsError;

      const teamNamesMap = teams?.reduce((acc: any, team: any) => {
        acc[team.id] = team.name;
        return acc;
      }, {}) || {};

      // Calculate standings from completed fixtures
      const teamStats: { [key: string]: TeamStats } = {};

      fixtures?.forEach((fixture: any) => {
        const homeTeamId = fixture.home_team_id;
        const awayTeamId = fixture.away_team_id;
        const homeScore = fixture.home_score || 0;
        const awayScore = fixture.away_score || 0;

        // Initialize teams if not exists
        if (!teamStats[homeTeamId]) {
          teamStats[homeTeamId] = {
            team_id: homeTeamId,
            team_name: teamNamesMap[homeTeamId] || 'Team Unknown',
            matches_played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0,
          };
        }
        if (!teamStats[awayTeamId]) {
          teamStats[awayTeamId] = {
            team_id: awayTeamId,
            team_name: teamNamesMap[awayTeamId] || 'Team Unknown',
            matches_played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0,
          };
        }

        // Update stats
        teamStats[homeTeamId].matches_played++;
        teamStats[awayTeamId].matches_played++;
        teamStats[homeTeamId].goals_for += homeScore;
        teamStats[homeTeamId].goals_against += awayScore;
        teamStats[awayTeamId].goals_for += awayScore;
        teamStats[awayTeamId].goals_against += homeScore;

        if (homeScore > awayScore) {
          teamStats[homeTeamId].wins++;
          teamStats[homeTeamId].points += 3;
          teamStats[awayTeamId].losses++;
        } else if (homeScore < awayScore) {
          teamStats[awayTeamId].wins++;
          teamStats[awayTeamId].points += 3;
          teamStats[homeTeamId].losses++;
        } else {
          teamStats[homeTeamId].draws++;
          teamStats[awayTeamId].draws++;
          teamStats[homeTeamId].points += 1;
          teamStats[awayTeamId].points += 1;
        }
      });

      return Object.values(teamStats).sort((a, b) => b.points - a.points);
    },
    enabled: isOpen && !!tournamentId,
  });

  // Fetch upcoming fixtures for user's team
  const { data: upcomingFixtures = [] } = useQuery({
    queryKey: ['team-upcoming-fixtures', tournamentId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      // First get user's team in this tournament
      const { data: userTeam } = await supabase
        .from('team_registrations')
        .select(`
          team_id,
          teams!inner(id, name, admin_user_id)
        `)
        .eq('tournament_id', tournamentId)
        .eq('teams.admin_user_id', currentUser.id)
        .eq('status', 'approved')
        .single();

      if (!userTeam) return [];

      const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('tournament_id', tournamentId)
        .in('status', ['scheduled', 'in_progress'])
        .or(`home_team_id.eq.${userTeam.teams.id},away_team_id.eq.${userTeam.teams.id}`)
        .order('kickoff', { ascending: true });

      if (error) throw error;

      // Get team names for the fixtures
      const teamIds = new Set<string>();
      fixtures?.forEach((fixture: any) => {
        if (fixture.home_team_id) teamIds.add(fixture.home_team_id);
        if (fixture.away_team_id) teamIds.add(fixture.away_team_id);
      });

      const { data: teams } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', Array.from(teamIds));

      const teamNamesMap = teams?.reduce((acc: any, team: any) => {
        acc[team.id] = team.name;
        return acc;
      }, {}) || {};

      return fixtures?.map((fixture: any) => ({
        ...fixture,
        home_team: { 
          id: fixture.home_team_id, 
          name: teamNamesMap[fixture.home_team_id] || 'Unknown Team' 
        },
        away_team: { 
          id: fixture.away_team_id, 
          name: teamNamesMap[fixture.away_team_id] || 'Unknown Team' 
        }
      })) || [];
    },
    enabled: isOpen && !!tournamentId && !!currentUser,
  });

  // Calculate player statistics from match data
  useEffect(() => {
    if (!isOpen || !tournamentId) return;

    const loadPlayerStats = async () => {
      const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('tournament_id', tournamentId)
        .in('status', ['completed', 'finished']);

      if (error) {
        console.error('Error loading fixtures for player stats:', error);
        return;
      }

      const playerStatsMap: { [key: string]: PlayerStats } = {};

      fixtures?.forEach((fixture: any) => {
        const matchData = fixture.match_data || {};
        
        // Process goals
        const goals = matchData.goals || [];
        goals.forEach((goal: any) => {
          const playerKey = `${goal.player_name}-${goal.team_name}`;
          if (!playerStatsMap[playerKey]) {
            playerStatsMap[playerKey] = {
              player_name: goal.player_name,
              goals: 0,
              yellow_cards: 0,
              red_cards: 0,
              team_name: goal.team_name,
            };
          }
          playerStatsMap[playerKey].goals++;
        });

        // Process cards
        const cards = matchData.cards || [];
        cards.forEach((card: any) => {
          const playerKey = `${card.player_name}-${card.team_name}`;
          if (!playerStatsMap[playerKey]) {
            playerStatsMap[playerKey] = {
              player_name: card.player_name,
              goals: 0,
              yellow_cards: 0,
              red_cards: 0,
              team_name: card.team_name,
            };
          }
          if (card.card_type === 'yellow') {
            playerStatsMap[playerKey].yellow_cards++;
          } else if (card.card_type === 'red') {
            playerStatsMap[playerKey].red_cards++;
          }
        });
      });

      setPlayerStats(Object.values(playerStatsMap));
    };

    loadPlayerStats();
  }, [isOpen, tournamentId]);

  // Real-time subscription to fixtures
  useEffect(() => {
    if (!isOpen || !tournamentId) return;

    const channel = supabase
      .channel('tournament-fixtures')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixtures',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          // Refetch data when fixtures change
          queryClient.invalidateQueries({ queryKey: ['tournament-standings', tournamentId] });
          queryClient.invalidateQueries({ queryKey: ['team-upcoming-fixtures', tournamentId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, tournamentId]);

  const topScorers = playerStats
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 3);

  const playersWithCards = playerStats
    .filter(p => p.yellow_cards > 0 || p.red_cards > 0)
    .sort((a, b) => (b.yellow_cards + b.red_cards * 2) - (a.yellow_cards + a.red_cards * 2));

  const userTeamId = standings.find(team => 
    upcomingFixtures.some(fixture => 
      fixture.home_team.id === team.team_id || fixture.away_team.id === team.team_id
    )
  )?.team_id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Estadísticas del Torneo: {tournament?.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="table">Tabla de Posiciones</TabsTrigger>
            <TabsTrigger value="fixtures">Próximos Partidos</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Tabla de Posiciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Pos</TableHead>
                      <TableHead>Equipo</TableHead>
                      <TableHead className="text-center">PJ</TableHead>
                      <TableHead className="text-center">G</TableHead>
                      <TableHead className="text-center">E</TableHead>
                      <TableHead className="text-center">P</TableHead>
                      <TableHead className="text-center">GF</TableHead>
                      <TableHead className="text-center">GC</TableHead>
                      <TableHead className="text-center">DG</TableHead>
                      <TableHead className="text-center">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.map((team, index) => (
                      <TableRow 
                        key={team.team_id}
                        className={team.team_id === userTeamId ? 'bg-primary/5 font-medium' : ''}
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {team.team_name}
                            {team.team_id === userTeamId && (
                              <Badge variant="secondary" className="text-xs">Mi equipo</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{team.matches_played}</TableCell>
                        <TableCell className="text-center">{team.wins}</TableCell>
                        <TableCell className="text-center">{team.draws}</TableCell>
                        <TableCell className="text-center">{team.losses}</TableCell>
                        <TableCell className="text-center">{team.goals_for}</TableCell>
                        <TableCell className="text-center">{team.goals_against}</TableCell>
                        <TableCell className="text-center">{team.goals_for - team.goals_against}</TableCell>
                        <TableCell className="text-center font-bold">{team.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fixtures" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Próximos Partidos de Mi Equipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingFixtures.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay partidos próximos programados
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingFixtures.map((fixture) => (
                      <div key={fixture.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4 text-lg font-medium">
                            <span>{fixture.home_team.name}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span>{fixture.away_team.name}</span>
                          </div>
                          <Badge variant={fixture.status === 'scheduled' ? 'default' : 'secondary'}>
                            {fixture.status === 'scheduled' ? 'Programado' : 'En Progreso'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(fixture.kickoff).toLocaleString()}
                          </div>
                          {fixture.venue && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {fixture.venue}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Top 3 Goleadores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topScorers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay goles registrados
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topScorers.map((player, index) => (
                        <div key={`${player.player_name}-${player.team_name}`} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{player.player_name}</div>
                              <div className="text-sm text-muted-foreground">{player.team_name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Medal className="w-4 h-4 text-orange-500" />
                            <span className="font-bold">{player.goals}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Jugadores con Tarjetas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {playersWithCards.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay tarjetas registradas
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {playersWithCards.slice(0, 5).map((player) => (
                        <div key={`${player.player_name}-${player.team_name}`} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{player.player_name}</div>
                            <div className="text-sm text-muted-foreground">{player.team_name}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {player.yellow_cards > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-4 bg-yellow-400 rounded-sm"></div>
                                <span className="text-sm">{player.yellow_cards}</span>
                              </div>
                            )}
                            {player.red_cards > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                                <span className="text-sm">{player.red_cards}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentStatisticsModal;