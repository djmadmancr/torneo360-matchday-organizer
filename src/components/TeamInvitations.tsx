import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Users, Mail } from 'lucide-react';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import { useRequestRegistration } from '@/hooks/useTournamentRegistrations';
import { toast } from 'sonner';
import SeleccionJugadoresModal from '@/components/SeleccionJugadoresModal';

interface TeamInvitationsProps {
  teamCode?: string;
}

const TeamInvitations: React.FC<TeamInvitationsProps> = ({ teamCode }) => {
  const { data: invitations = [], isLoading } = useTeamInvitations(teamCode);
  const { teams } = useSupabaseTeams();
  const requestRegistration = useRequestRegistration();
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  const handleAcceptInvitation = (tournament: any) => {
    if (!teams || teams.length === 0) {
      toast.error('Necesitas tener un equipo para inscribirte');
      return;
    }
    setSelectedTournament(tournament);
    setShowPlayerModal(true);
  };

  const handleConfirmarInscripcion = async (jugadoresSeleccionados: any[], staffSeleccionado: any[]) => {
    if (!selectedTournament || !teams || teams.length === 0) return;

    try {
      await requestRegistration.mutateAsync({
        tournamentId: selectedTournament.id,
        teamId: teams[0].id,
      });
      setShowPlayerModal(false);
      setSelectedTournament(null);
    } catch (error) {
      console.error('Error registering for tournament:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Cargando invitaciones...</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay invitaciones</h3>
          <p className="text-muted-foreground mb-4">
            Los organizadores pueden invitar a tu equipo usando el código: <strong>{teamCode}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Las invitaciones a torneos privados aparecerán aquí cuando los organizadores
            agreguen tu código de equipo a la configuración del torneo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Invitaciones a Torneos</h3>
        <Badge variant="secondary">
          {invitations.length} invitacion{invitations.length !== 1 ? 'es' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invitations.map((tournament) => (
          <Card key={tournament.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold text-primary">
                  {tournament.name}
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Invitado
                </Badge>
              </div>
              {tournament.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {tournament.description}
                </p>
              )}
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Organizador:</span>
                  <span className="font-medium">
                    {(tournament as any).organizer?.full_name || 'No disponible'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Equipos máx:</span>
                  <span className="font-medium">{tournament.max_teams || 16}</span>
                </div>

                {tournament.enrollment_deadline && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fecha límite:</span>
                    <span className="font-medium">
                      {new Date(tournament.enrollment_deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cobertura:</span>
                  <Badge variant="outline" className="text-xs">
                    {tournament.coverage || 'local'}
                  </Badge>
                </div>
              </div>

              <div className="mt-4">
                <Button 
                  onClick={() => handleAcceptInvitation(tournament)}
                  className="w-full flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Inscribirse al Torneo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Código de Equipo</h4>
            <p className="text-sm text-blue-700 mt-1">
              Tu código de equipo es: <span className="font-mono font-semibold">{teamCode}</span>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Comparte este código con organizadores para recibir invitaciones a torneos privados.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de selección de jugadores */}
      <SeleccionJugadoresModal
        open={showPlayerModal}
        onClose={() => {
          setShowPlayerModal(false);
          setSelectedTournament(null);
        }}
        torneo={selectedTournament ? {
          id: selectedTournament.id,
          nombre: selectedTournament.name,
          organizadorNombre: selectedTournament.organizer?.full_name || 'N/A',
          organizadorId: selectedTournament.organizer_id,
          esPublico: selectedTournament.visibility === 'public',
          descripcion: selectedTournament.description,
          categoria: 'General',
          tipo: 'Liga',
          formato: 'Round Robin',
          fechaInicio: selectedTournament.start_date,
          fechaFin: selectedTournament.end_date,
          fechaCierre: selectedTournament.enrollment_deadline || selectedTournament.start_date,
          logo: '',
          maxEquipos: selectedTournament.max_teams || 16,
          equiposInscritos: 0,
          estado: selectedTournament.status,
        } : null}
        jugadores={teams?.[0]?.team_members?.filter((m: any) => m.member_type === 'player').map((m: any) => ({
          id: m.id,
          nombre: m.name,
          posicion: m.position || 'N/A',
          numeroIdentificacion: m.member_data?.identification || 'N/A',
          edad: m.member_data?.age || 0,
          numeroCamiseta: m.jersey_number || 0,
        })) || []}
        coaches={teams?.[0]?.team_members?.filter((m: any) => m.member_type === 'coach').map((m: any) => ({
          id: m.id,
          nombre: m.name,
          tipo: m.position || 'Entrenador',
          numeroIdentificacion: m.member_data?.identification || 'N/A',
        })) || []}
        onConfirmarInscripcion={handleConfirmarInscripcion}
      />
    </div>
  );
};

export default TeamInvitations;