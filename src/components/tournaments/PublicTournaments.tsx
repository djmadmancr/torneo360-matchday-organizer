import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calendar, Users, MapPin, Clock } from 'lucide-react';
import { usePublicTournaments, useRequestRegistration } from '@/hooks/useTournamentRegistrations';
import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const PublicTournaments: React.FC = () => {
  const { data: tournaments, isLoading } = usePublicTournaments();
  const { teams } = useSupabaseTeams();
  const requestRegistration = useRequestRegistration();
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const handleRequestRegistration = async () => {
    if (!selectedTournament || !selectedTeam) return;

    await requestRegistration.mutateAsync({
      tournamentId: selectedTournament,
      teamId: selectedTeam,
    });

    setSelectedTournament(null);
    setSelectedTeam('');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando torneos públicos...</p>
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay torneos públicos disponibles</h3>
          <p className="text-muted-foreground">
            Los organizadores aún no han creado torneos públicos para inscribirse
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Torneos Públicos</h2>
        <Badge variant="outline">{tournaments.length} torneos disponibles</Badge>
      </div>

      <div className="grid gap-6">
        {tournaments.map((tournament) => (
          <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{tournament.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Organizado por: {tournament.users?.full_name || 'Organizador'}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setSelectedTournament(tournament.id)}
                  disabled={!teams || teams.length === 0}
                >
                  Solicitar Inscripción
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {tournament.description && (
                  <p className="text-gray-600">{tournament.description}</p>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Información del Torneo */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Información</h4>
                    
                    {tournament.start_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Inicio:</span>
                        <span className="font-medium">
                          {format(new Date(tournament.start_date), 'PPP', { locale: es })}
                        </span>
                      </div>
                    )}

                    {tournament.end_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Fin:</span>
                        <span className="font-medium">
                          {format(new Date(tournament.end_date), 'PPP', { locale: es })}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Máximo equipos:</span>
                      <span className="font-medium">{tournament.max_teams}</span>
                    </div>
                  </div>

                  {/* Fechas importantes */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Inscripciones</h4>
                    
                    {tournament.enrollment_deadline && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-yellow-900">Límite de inscripción</span>
                        </div>
                        <p className="text-sm text-yellow-700">
                          {format(new Date(tournament.enrollment_deadline), 'PPP', { locale: es })}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {tournament.visibility === 'public' ? 'Público' : 'Por invitación'}
                      </Badge>
                      <Badge variant="outline">
                        {tournament.status === 'enrolling' ? 'Inscripciones abiertas' : tournament.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de selección de equipo */}
      <Dialog open={!!selectedTournament} onOpenChange={() => setSelectedTournament(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Equipo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecciona el equipo con el que deseas participar en este torneo
            </p>

            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un equipo" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!teams || teams.length === 0 && (
              <p className="text-sm text-red-600">
                Necesitas crear un equipo antes de poder inscribirte en torneos
              </p>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleRequestRegistration}
                disabled={!selectedTeam || requestRegistration.isPending}
                className="flex-1"
              >
                {requestRegistration.isPending ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedTournament(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};