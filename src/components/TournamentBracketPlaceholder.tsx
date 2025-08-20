import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Crown } from "lucide-react";

interface TournamentBracketPlaceholderProps {
  homeTeam: any;
  awayTeam: any;
  homeScore?: number;
  awayScore?: number;
  matchStatus: string;
  matchDay: number;
  stage?: string;
}

const TournamentBracketPlaceholder: React.FC<TournamentBracketPlaceholderProps> = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  matchStatus,
  matchDay,
  stage = "group"
}) => {

  // Function to generate placeholder team names based on tournament stage and match day
  const getPlaceholderName = (team: any, position: 'home' | 'away') => {
    if (team && team.name) {
      return team.name;
    }

    // If no team is assigned, generate placeholder based on stage and match day
    if (stage === "knockout" || matchDay > 10) {
      // Knockout stage placeholders
      const knockoutPlaceholders = {
        'home': [
          'Ganador SF-A', 'Ganador SF-B', 'Ganador QF-A', 'Ganador QF-B', 
          'Ganador QF-C', 'Ganador QF-D', '1° Grupo A', '2° Grupo B',
          '1° Grupo C', '2° Grupo D', '3° Grupo A', '3° Grupo B'
        ],
        'away': [
          'Ganador SF-C', 'Ganador SF-D', 'Ganador QF-E', 'Ganador QF-F',
          'Ganador QF-G', 'Ganador QF-H', '2° Grupo A', '1° Grupo B', 
          '2° Grupo C', '1° Grupo D', '3° Grupo C', '3° Grupo D'
        ]
      };
      
      const index = Math.min(matchDay - 11, knockoutPlaceholders[position].length - 1);
      return knockoutPlaceholders[position][index] || `${position === 'home' ? 'Equipo A' : 'Equipo B'}`;
    }

    // Group stage placeholders
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const positions = ['1°', '2°', '3°', '4°'];
    
    // Calculate group and position based on match day and team position
    const groupIndex = Math.floor((matchDay - 1) / 2) % groups.length;
    const positionIndex = position === 'home' ? 0 : 1;
    
    return `${positions[positionIndex]} ${groups[groupIndex]}`;
  };

  const homePlaceholder = getPlaceholderName(homeTeam, 'home');
  const awayPlaceholder = getPlaceholderName(awayTeam, 'away');
  
  const isPlaceholderMatch = !homeTeam?.name || !awayTeam?.name;
  const isKnockoutStage = stage === "knockout" || matchDay > 10;

  return (
    <Card className={`transition-all hover:shadow-md ${isPlaceholderMatch ? 'border-dashed border-2 bg-gray-50/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Home Team */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
              {homeTeam?.logo_url ? (
                <img src={homeTeam.logo_url} alt={homeTeam.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold truncate ${isPlaceholderMatch ? 'text-gray-500 italic' : ''}`}>
                {homePlaceholder}
              </p>
              {isPlaceholderMatch && (
                <p className="text-xs text-gray-400">Por clasificar</p>
              )}
            </div>
          </div>

          {/* Score or VS */}
          <div className="flex items-center gap-2 px-4">
            {matchStatus === 'finished' && homeScore !== undefined && awayScore !== undefined ? (
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {homeScore} - {awayScore}
                </div>
                <Badge variant="secondary" className="text-xs">
                  Final
                </Badge>
              </div>
            ) : matchStatus === 'live' ? (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {homeScore || 0} - {awayScore || 0}
                </div>
                <Badge className="bg-green-500 text-xs animate-pulse">
                  En vivo
                </Badge>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xl font-bold text-gray-400">VS</div>
                {isKnockoutStage && (
                  <Badge variant="outline" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Eliminación
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-row-reverse">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 flex-shrink-0">
              {awayTeam?.logo_url ? (
                <img src={awayTeam.logo_url} alt={awayTeam.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-secondary" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className={`font-semibold truncate ${isPlaceholderMatch ? 'text-gray-500 italic' : ''}`}>
                {awayPlaceholder}
              </p>
              {isPlaceholderMatch && (
                <p className="text-xs text-gray-400">Por clasificar</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional info for placeholder matches */}
        {isPlaceholderMatch && (
          <div className="mt-3 pt-3 border-t border-dashed">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Trophy className="w-3 h-3" />
              <span>Los equipos se asignarán según los resultados de la fase {isKnockoutStage ? 'anterior' : 'de grupos'}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TournamentBracketPlaceholder;