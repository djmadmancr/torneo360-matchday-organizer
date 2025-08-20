import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TeamPosition {
  position: number;
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form?: string[];
}

interface TournamentTableProps {
  positions: TeamPosition[];
  currentTeamId?: string;
  title?: string;
}

export const TournamentTable: React.FC<TournamentTableProps> = ({
  positions,
  currentTeamId,
  title = "Tabla de Posiciones"
}) => {
  const getPositionColor = (position: number, total: number) => {
    if (position <= 2) return "text-green-600 bg-green-50";
    if (position <= total / 2) return "text-blue-600 bg-blue-50";
    if (position > total - 3) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const getFormIcon = (result: string) => {
    switch (result) {
      case 'W':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'D':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'L':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {positions.map((team) => (
            <div
              key={team.team.id}
              className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                team.team.id === currentTeamId
                  ? 'bg-primary/5 border-primary/30'
                  : 'hover:bg-muted/50'
              }`}
            >
              {/* Posición */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionColor(team.position, positions.length)}`}>
                {team.position}
              </div>

              {/* Logo y nombre del equipo */}
              <div className="flex items-center gap-3 flex-1">
                {team.team.logo_url ? (
                  <img
                    src={team.team.logo_url}
                    alt={`Logo de ${team.team.name}`}
                    className="w-8 h-8 object-cover rounded"
                  />
                ) : (
                  <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <span className={`font-medium ${team.team.id === currentTeamId ? 'text-primary' : ''}`}>
                  {team.team.name}
                </span>
              </div>

              {/* Estadísticas compactas */}
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center min-w-[30px]">
                  <div className="font-medium">{team.matches_played}</div>
                  <div className="text-xs text-muted-foreground">PJ</div>
                </div>
                <div className="text-center min-w-[40px]">
                  <div className="font-medium">{team.wins}-{team.draws}-{team.losses}</div>
                  <div className="text-xs text-muted-foreground">G-E-P</div>
                </div>
                <div className="text-center min-w-[40px]">
                  <div className="font-medium">{team.goals_for}:{team.goals_against}</div>
                  <div className="text-xs text-muted-foreground">GF:GC</div>
                </div>
                <div className="text-center min-w-[30px]">
                  <div className={`font-medium ${team.goal_difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                  </div>
                  <div className="text-xs text-muted-foreground">DIF</div>
                </div>
              </div>

              {/* Forma reciente */}
              {team.form && team.form.length > 0 && (
                <div className="flex items-center gap-1">
                  {team.form.slice(-5).map((result, index) => (
                    <div key={index} title={`${result === 'W' ? 'Victoria' : result === 'D' ? 'Empate' : 'Derrota'}`}>
                      {getFormIcon(result)}
                    </div>
                  ))}
                </div>
              )}

              {/* Puntos */}
              <div className="text-center min-w-[40px]">
                <div className="text-lg font-bold text-primary">{team.points}</div>
                <div className="text-xs text-muted-foreground">PTS</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentTable;