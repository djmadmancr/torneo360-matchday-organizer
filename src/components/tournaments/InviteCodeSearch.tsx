import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trophy, Calendar, Users, Clock, Key } from 'lucide-react';
import { useInviteSearch, useRequestRegistration } from '@/hooks/useTournamentRegistrations';
import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const InviteCodeSearch: React.FC = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const { data: tournaments, isLoading } = useInviteSearch(searchCode);
  const { teams } = useSupabaseTeams();
  const requestRegistration = useRequestRegistration();
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const handleSearch = () => {
    if (inviteCode.trim()) {
      setSearchCode(inviteCode.trim().toUpperCase());
    }
  };

  const handleRequestRegistration = async () => {
    if (!selectedTournament || !selectedTeam) return;

    await requestRegistration.mutateAsync({
      tournamentId: selectedTournament,
      teamId: selectedTeam,
    });

    setSelectedTournament(null);
    setSelectedTeam('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Buscar Torneos por Invitación</h2>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Código de Invitación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-code">Ingresa el código de invitación</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="invite-code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123"
                  maxLength={6}
                  className="uppercase"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={inviteCode.length < 3 || isLoading}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              El código de invitación debe tener al menos 3 caracteres y te dará acceso a torneos privados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {isLoading && searchCode && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Buscando torneos...</p>
        </div>
      )}

      {searchCode && !isLoading && (!tournaments || tournaments.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron torneos</h3>
            <p className="text-muted-foreground">
              No hay torneos disponibles con el código <strong>{searchCode}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      {tournaments && tournaments.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50">
              {tournaments.length} torneo{tournaments.length > 1 ? 's' : ''} encontrado{tournaments.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="grid gap-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Trophy className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tournament.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Organizado por: {tournament.users?.full_name || 'Organizador'}
                        </p>
                        <Badge className="mt-2 bg-blue-100 text-blue-800">
                          Torneo por invitación
                        </Badge>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setSelectedTournament(tournament.id)}
                      disabled={!teams || teams.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
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
                          <Badge className="bg-blue-100 text-blue-800">
                            Por invitación
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
        </div>
      )}

      {/* Modal de selección de equipo */}
      <Dialog open={!!selectedTournament} onOpenChange={() => setSelectedTournament(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Equipo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecciona el equipo con el que deseas participar en este torneo por invitación
            </p>

            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un equipo" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name} {team.invite_code && `(${team.invite_code})`}
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