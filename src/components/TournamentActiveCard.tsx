import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin, BarChart3, Target } from "lucide-react";

interface TournamentActiveCardProps {
  tournament: {
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
  };
  onViewStatistics: () => void;
}

const TournamentActiveCard = ({ tournament, onViewStatistics }: TournamentActiveCardProps) => {
  const teamId = tournament.team_registrations[0]?.team.id;

  // Obtener último resultado del equipo en este torneo
  const { data: lastMatch } = useQuery({
    queryKey: ['last-match', tournament.id, teamId],
    queryFn: async () => {
      if (!teamId) return null;

      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          home_team_id,
          away_team_id,
          home_score,
          away_score,
          status,
          kickoff,
          home_team:teams!fixtures_home_team_id_fkey(name),
          away_team:teams!fixtures_away_team_id_fkey(name)
        `)
        .eq('tournament_id', tournament.id)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('status', 'completed')
        .order('kickoff', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching last match:', error);
        return null;
      }

      return data;
    },
    enabled: !!teamId && !!tournament.id,
  });

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

  const getLastMatchResult = () => {
    if (!lastMatch) return null;

    const isHome = lastMatch.home_team_id === teamId;
    const myScore = isHome ? lastMatch.home_score : lastMatch.away_score;
    const opponentScore = isHome ? lastMatch.away_score : lastMatch.home_score;
    const opponentName = isHome ? lastMatch.away_team?.name : lastMatch.home_team?.name;

    let resultType = 'Empate';
    let resultColor = 'text-yellow-600';
    
    if (myScore > opponentScore) {
      resultType = 'Victoria';
      resultColor = 'text-green-600';
    } else if (myScore < opponentScore) {
      resultType = 'Derrota';
      resultColor = 'text-red-600';
    }

    return (
      <div className="flex items-center gap-2 text-sm">
        <Target className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Último resultado:</span>
        <span className={`font-medium ${resultColor}`}>
          {resultType} {myScore}-{opponentScore}
        </span>
        <span className="text-muted-foreground">vs {opponentName}</span>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{tournament.name}</h3>
              <p className="text-sm text-muted-foreground">
                Mi equipo: {tournament.team_registrations[0]?.team.name}
              </p>
            </div>
          </CardTitle>
          {getStatusBadge(tournament.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Inicio:</span>
            <span className="font-medium">{new Date(tournament.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Fin:</span>
            <span className="font-medium">{new Date(tournament.end_date).toLocaleDateString()}</span>
          </div>
        </div>

        {getLastMatchResult()}

        <div className="flex justify-end pt-3 border-t">
          <Button
            onClick={onViewStatistics}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-primary/5"
          >
            <BarChart3 className="w-4 h-4" />
            Ver Estadísticas y Fixtures
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentActiveCard;