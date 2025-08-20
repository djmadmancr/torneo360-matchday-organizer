import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Trophy, Bell } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UpcomingMatch {
  id: string;
  tournament_name: string;
  home_team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  away_team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  kickoff?: string;
  venue?: string;
  match_day?: number;
  status: string;
}

interface UpcomingMatchesProps {
  matches: UpcomingMatch[];
  currentTeamId?: string;
  title?: string;
  showTournamentName?: boolean;
}

export const UpcomingMatches: React.FC<UpcomingMatchesProps> = ({
  matches,
  currentTeamId,
  title = "Próximos Partidos",
  showTournamentName = true
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Programado</Badge>;
      case 'live':
        return <Badge className="bg-red-100 text-red-800">En vivo</Badge>;
      case 'postponed':
        return <Badge className="bg-yellow-100 text-yellow-800">Aplazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isHomeTeam = (match: UpcomingMatch) => match.home_team.id === currentTeamId;
  const isAwayTeam = (match: UpcomingMatch) => match.away_team.id === currentTeamId;

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay próximos partidos programados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`p-4 border rounded-lg transition-colors ${
                isHomeTeam(match) || isAwayTeam(match)
                  ? 'bg-primary/5 border-primary/30'
                  : 'hover:bg-muted/50'
              }`}
            >
              {/* Tournament info */}
              {showTournamentName && (
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {match.tournament_name}
                  </Badge>
                  {match.match_day && (
                    <Badge variant="outline" className="text-xs">
                      Jornada {match.match_day}
                    </Badge>
                  )}
                </div>
              )}

              {/* Main match info */}
              <div className="flex items-center justify-between">
                {/* Teams */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Home team */}
                  <div className={`flex items-center gap-2 flex-1 justify-end ${
                    isHomeTeam(match) ? 'font-semibold text-primary' : ''
                  }`}>
                    <span className="text-right">
                      {match.home_team.name}
                    </span>
                    {match.home_team.logo_url ? (
                      <img 
                        src={match.home_team.logo_url} 
                        alt={`Logo de ${match.home_team.name}`}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* VS */}
                  <div className="flex items-center gap-2 min-w-[60px] justify-center">
                    <div className="text-lg font-medium text-muted-foreground">
                      VS
                    </div>
                  </div>

                  {/* Away team */}
                  <div className={`flex items-center gap-2 flex-1 ${
                    isAwayTeam(match) ? 'font-semibold text-primary' : ''
                  }`}>
                    {match.away_team.logo_url ? (
                      <img 
                        src={match.away_team.logo_url} 
                        alt={`Logo de ${match.away_team.name}`}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <span>
                      {match.away_team.name}
                    </span>
                  </div>
                </div>

                {/* Match details */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {/* Date and time */}
                  {match.kickoff && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <div className="text-right">
                        <div>{format(new Date(match.kickoff), 'dd/MM', { locale: es })}</div>
                        <div className="text-xs">{format(new Date(match.kickoff), 'HH:mm', { locale: es })}</div>
                      </div>
                    </div>
                  )}

                  {/* Venue */}
                  {match.venue && (
                    <div className="flex items-center gap-1 max-w-[120px]">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-xs">{match.venue}</span>
                    </div>
                  )}

                  {/* Status */}
                  {getStatusBadge(match.status)}
                </div>
              </div>

              {/* Actions for team matches */}
              {(isHomeTeam(match) || isAwayTeam(match)) && (
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Bell className="w-3 h-3 mr-1" />
                    Recordatorio
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    Ubicación
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingMatches;