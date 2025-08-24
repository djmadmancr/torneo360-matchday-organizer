import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, MapPin, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BracketMatch {
  id: string;
  round: number;
  position: number;
  home_team?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  away_team?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  home_score?: number;
  away_score?: number;
  status: string;
  kickoff?: string;
  venue?: string;
  winner_team_id?: string;
}

interface TournamentBracketProps {
  matches: BracketMatch[];
  isOrganizer?: boolean;
  onEditMatch?: (match: BracketMatch) => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matches,
  isOrganizer = false,
  onEditMatch
}) => {
  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, BracketMatch[]>);

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  const getRoundName = (round: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - round + 1;
    switch (roundsFromEnd) {
      case 1: return 'Final';
      case 2: return 'Semifinal';
      case 3: return 'Cuartos de Final';
      case 4: return 'Octavos de Final';
      default: return `Ronda ${round}`;
    }
  };

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

  const TeamDisplay = ({ team, score, isWinner }: { 
    team?: BracketMatch['home_team']; 
    score?: number; 
    isWinner?: boolean;
  }) => (
    <div className={`flex items-center gap-2 p-2 rounded ${
      isWinner ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
    }`}>
      {team?.logo_url ? (
        <img 
          src={team.logo_url} 
          alt={`Logo ${team.name}`}
          className="w-6 h-6 object-cover rounded-full"
        />
      ) : (
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
          <Trophy className="w-3 h-3 text-gray-500" />
        </div>
      )}
      <span className={`font-medium text-sm flex-1 ${isWinner ? 'text-green-800' : 'text-gray-700'}`}>
        {team?.name || 'TBD'}
      </span>
      {typeof score === 'number' && (
        <span className={`font-bold text-lg ${isWinner ? 'text-green-800' : 'text-gray-600'}`}>
          {score}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Eliminación Directa
        </h2>
        <p className="text-muted-foreground">
          Fase de llaves - {rounds.length} rondas
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-8 min-w-fit p-4">
          {rounds.map((round) => (
            <div key={round} className="flex flex-col space-y-4 min-w-[280px]">
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">
                  {getRoundName(round, rounds.length)}
                </h3>
                <Badge variant="outline" className="text-xs">
                  Ronda {round}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {matchesByRound[round]
                  .sort((a, b) => a.position - b.position)
                  .map((match) => {
                    const homeIsWinner = match.winner_team_id === match.home_team?.id;
                    const awayIsWinner = match.winner_team_id === match.away_team?.id;
                    
                    return (
                      <Card key={match.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              Partido {match.position}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(match.status)}
                              {isOrganizer && onEditMatch && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onEditMatch(match)}
                                  className="h-6 px-2"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0 space-y-2">
                          <TeamDisplay 
                            team={match.home_team} 
                            score={match.home_score}
                            isWinner={homeIsWinner}
                          />
                          
                          <div className="text-center text-xs text-muted-foreground font-medium">
                            {match.status === 'finished' ? 'RESULTADO' : 'VS'}
                          </div>
                          
                          <TeamDisplay 
                            team={match.away_team} 
                            score={match.away_score}
                            isWinner={awayIsWinner}
                          />
                          
                          {/* Match details */}
                          <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                            {match.kickoff && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(match.kickoff), 'dd/MM HH:mm', { locale: es })}
                              </div>
                            )}
                            {match.venue && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {match.venue}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {rounds.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fase de eliminación no disponible</h3>
            <p className="text-muted-foreground">
              La fase de llaves aún no ha sido generada para este torneo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};