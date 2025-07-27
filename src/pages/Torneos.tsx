import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Calendar, Users } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePublicTournaments, useRequestRegistration } from '@/hooks/useTournamentRegistrations';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import { toast } from 'sonner';
import SeleccionJugadoresModal from '@/components/SeleccionJugadoresModal';

const Torneos = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSupabaseAuth();
  const { teams } = useSupabaseTeams();
  const { data: tournaments, isLoading } = usePublicTournaments();
  const { data: invitations } = useTeamInvitations(teams?.[0]?.team_code);
  const requestRegistration = useRequestRegistration();
  
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  const handleShowModal = (tournament: any) => {
    if (!user || !teams || teams.length === 0) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-primary">🏆 Torneos Disponibles</h1>
              <p className="text-sm text-muted-foreground">Encuentra y únete a torneos de fútbol</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="container mx-auto max-w-7xl">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-lg">Cargando torneos...</div>
            </div>
          ) : tournaments?.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No hay torneos disponibles</h3>
              <p className="text-muted-foreground">No hay torneos públicos abiertos en este momento</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tournaments?.map((tournament) => (
                <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {tournament.name}
                      </CardTitle>
                      <Badge variant={tournament.status === 'enrolling' ? 'secondary' : 'default'}>
                        {tournament.status === 'enrolling' ? 'Inscripción Abierta' : tournament.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>Máximo {tournament.max_teams} equipos</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{tournament.description}</p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div />
                      {tournament.status === 'enrolling' && (
                        <Button 
                          onClick={() => handleShowModal(tournament)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Inscribirse
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
          organizadorNombre: selectedTournament.users?.full_name || selectedTournament.organizer?.full_name || 'N/A',
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
          numeroIdentificacion: m.member_data?.id_number || m.member_data?.identification || 'N/A',
          edad: m.member_data?.age || 20,
        })) || []}
        coaches={teams?.[0]?.team_members?.filter((m: any) => m.member_type === 'staff').map((m: any) => ({
          nombre: m.name,
          tipo: m.position?.includes('director') || m.position?.includes('tecnico') ? 'entrenador' : 'asistente',
          numeroIdentificacion: m.member_data?.id_number || m.member_data?.identification || 'N/A',
        })) || []}
        onConfirmarInscripcion={handleConfirmarInscripcion}
      />
    </div>
  );
};

export default Torneos;