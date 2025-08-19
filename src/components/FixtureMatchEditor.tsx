import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, AlertTriangle, Clock, Trophy, UserX, ArrowUpDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FixtureMatchEditorProps {
  match: {
    id: string;
    home_team_id: string;
    away_team_id: string;
    home_score: number;
    away_score: number;
    status: string;
    match_data: any;
    home_teams: { id: string; name: string; logo_url?: string };
    away_teams: { id: string; name: string; logo_url?: string };
  };
  isOpen: boolean;
  onClose: () => void;
}

interface PlayerStats {
  player_id: string;
  player_name: string;
  goals: number;
  yellow_cards: number;
  red_cards: number;
}

const FixtureMatchEditor = ({ match, isOpen, onClose }: FixtureMatchEditorProps) => {
  const [homeTeamId, setHomeTeamId] = useState(match.home_team_id);
  const [awayTeamId, setAwayTeamId] = useState(match.away_team_id);
  const [homeTeamData, setHomeTeamData] = useState(match.home_teams);
  const [awayTeamData, setAwayTeamData] = useState(match.away_teams);
  const [homeScore, setHomeScore] = useState(match.home_score);
  const [awayScore, setAwayScore] = useState(match.away_score);
  const [matchStatus, setMatchStatus] = useState(match.status);
  const [notes, setNotes] = useState(match.match_data?.notes || '');
  const [homePlayerStats, setHomePlayerStats] = useState<PlayerStats[]>(
    match.match_data?.home_player_stats || []
  );
  const [awayPlayerStats, setAwayPlayerStats] = useState<PlayerStats[]>(
    match.match_data?.away_player_stats || []
  );
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');

  const queryClient = useQueryClient();

  const updateMatchMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const { error } = await supabase
        .from('fixtures')
        .update({
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          home_score: homeScore,
          away_score: awayScore,
          status: matchStatus,
          match_data: {
            ...match.match_data,
            notes,
            home_player_stats: homePlayerStats,
            away_player_stats: awayPlayerStats,
            last_edited: new Date().toISOString(),
            editor_notes: 'Editado por organizador'
          }
        })
        .eq('id', match.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Partido actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-fixtures'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-statistics'] });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating match:', error);
      toast.error('Error al actualizar el partido');
    }
  });

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;

    const newPlayer: PlayerStats = {
      player_id: `temp_${Date.now()}`,
      player_name: newPlayerName.trim(),
      goals: 0,
      yellow_cards: 0,
      red_cards: 0
    };

    if (selectedTeam === 'home') {
      setHomePlayerStats([...homePlayerStats, newPlayer]);
    } else {
      setAwayPlayerStats([...awayPlayerStats, newPlayer]);
    }

    setNewPlayerName('');
  };

  const updatePlayerStat = (
    team: 'home' | 'away', 
    playerIndex: number, 
    stat: 'goals' | 'yellow_cards' | 'red_cards', 
    increment: boolean
  ) => {
    const statsArray = team === 'home' ? homePlayerStats : awayPlayerStats;
    const setStatsArray = team === 'home' ? setHomePlayerStats : setAwayPlayerStats;
    
    const updatedStats = [...statsArray];
    const currentValue = updatedStats[playerIndex][stat];
    
    if (increment) {
      updatedStats[playerIndex][stat] = currentValue + 1;
    } else if (currentValue > 0) {
      updatedStats[playerIndex][stat] = currentValue - 1;
    }
    
    setStatsArray(updatedStats);
  };

  const removePlayer = (team: 'home' | 'away', playerIndex: number) => {
    const statsArray = team === 'home' ? homePlayerStats : awayPlayerStats;
    const setStatsArray = team === 'home' ? setHomePlayerStats : setAwayPlayerStats;
    
    const updatedStats = statsArray.filter((_, index) => index !== playerIndex);
    setStatsArray(updatedStats);
  };

  const handleSave = () => {
    updateMatchMutation.mutate({});
  };

  const swapTeams = () => {
    // Intercambiar los equipos
    const tempTeamId = homeTeamId;
    const tempTeamData = homeTeamData;
    const tempScore = homeScore;
    const tempPlayerStats = homePlayerStats;

    setHomeTeamId(awayTeamId);
    setHomeTeamData(awayTeamData);
    setHomeScore(awayScore);
    setHomePlayerStats(awayPlayerStats);

    setAwayTeamId(tempTeamId);
    setAwayTeamData(tempTeamData);
    setAwayScore(tempScore);
    setAwayPlayerStats(tempPlayerStats);

    toast.info('Equipos intercambiados: Local ↔ Visitante');
  };

  const PlayerStatsEditor = ({ 
    players, 
    teamName, 
    team 
  }: { 
    players: PlayerStats[], 
    teamName: string, 
    team: 'home' | 'away' 
  }) => (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          {teamName}
        </h4>
        
        <div className="space-y-2">
          {players.map((player, index) => (
            <div key={player.player_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="font-medium text-sm">{player.player_name}</span>
              
              <div className="flex items-center gap-2">
                {/* Goles */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => updatePlayerStat(team, index, 'goals', false)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Badge variant="default" className="min-w-6 text-xs">
                    ⚽ {player.goals}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => updatePlayerStat(team, index, 'goals', true)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                {/* Tarjetas amarillas */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => updatePlayerStat(team, index, 'yellow_cards', false)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Badge variant="secondary" className="min-w-6 text-xs bg-yellow-100 text-yellow-800">
                    🟨 {player.yellow_cards}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => updatePlayerStat(team, index, 'yellow_cards', true)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                {/* Tarjetas rojas */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => updatePlayerStat(team, index, 'red_cards', false)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Badge variant="destructive" className="min-w-6 text-xs">
                    🟥 {player.red_cards}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => updatePlayerStat(team, index, 'red_cards', true)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  onClick={() => removePlayer(team, index)}
                >
                  <UserX className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Editor de Partido: {homeTeamData?.name} vs {awayTeamData?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selector de equipos */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Selección de Equipos
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapTeams}
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Intercambiar
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                  <Label className="text-sm font-medium text-green-800 mb-2 block">
                    🏠 Equipo Local
                  </Label>
                  <div className="flex items-center justify-center gap-2">
                    {homeTeamData?.logo_url && (
                      <img 
                        src={homeTeamData.logo_url} 
                        alt={`Logo ${homeTeamData.name}`}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                    )}
                    <span className="font-bold text-green-900">{homeTeamData?.name}</span>
                  </div>
                </div>
                
                <div className="text-center text-2xl font-bold text-muted-foreground">
                  VS
                </div>
                
                <div className="text-center p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium text-blue-800 mb-2 block">
                    ✈️ Equipo Visitante
                  </Label>
                  <div className="flex items-center justify-center gap-2">
                    {awayTeamData?.logo_url && (
                      <img 
                        src={awayTeamData.logo_url} 
                        alt={`Logo ${awayTeamData.name}`}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                    )}
                    <span className="font-bold text-blue-900">{awayTeamData?.name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marcador */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Marcador Final
              </h3>
              
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <Label className="text-sm font-medium text-green-700">🏠 {homeTeamData?.name}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                    className="text-center text-2xl font-bold mt-2 border-green-300 focus:border-green-500"
                  />
                </div>
                
                <div className="text-center text-2xl font-bold text-muted-foreground">
                  VS
                </div>
                
                <div className="text-center">
                  <Label className="text-sm font-medium text-blue-700">✈️ {awayTeamData?.name}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                    className="text-center text-2xl font-bold mt-2 border-blue-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado del partido */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Estado del Partido
              </Label>
              <Select value={matchStatus} onValueChange={setMatchStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Programado</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="postponed">Pospuesto</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Agregar jugador */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Agregar Jugador a Estadísticas</h3>
              <div className="flex gap-2">
                <Select value={selectedTeam} onValueChange={(value: 'home' | 'away') => setSelectedTeam(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">🏠 {homeTeamData?.name}</SelectItem>
                    <SelectItem value="away">✈️ {awayTeamData?.name}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Nombre del jugador"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                />
                
                <Button onClick={addPlayer}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas de jugadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlayerStatsEditor 
              players={homePlayerStats}
              teamName={`🏠 ${homeTeamData?.name || 'Equipo Local'}`}
              team="home"
            />
            
            <PlayerStatsEditor 
              players={awayPlayerStats}
              teamName={`✈️ ${awayTeamData?.name || 'Equipo Visitante'}`}
              team="away"
            />
          </div>

          {/* Notas */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">
                Notas del Partido
              </Label>
              <Textarea
                placeholder="Agregar notas sobre el partido, incidencias, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateMatchMutation.isPending}
          >
            {updateMatchMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FixtureMatchEditor;