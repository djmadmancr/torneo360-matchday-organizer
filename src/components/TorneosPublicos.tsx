import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Trophy, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import { usePublicTournaments, useRequestRegistration } from '@/hooks/useTournamentRegistrations';
import SeleccionJugadoresModal from '@/components/SeleccionJugadoresModal';


const TorneosPublicos = () => {
  const { user } = useSupabaseAuth();
  const { teams } = useSupabaseTeams();
  const { data: tournaments = [], isLoading } = usePublicTournaments();
  const requestRegistration = useRequestRegistration();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // Filter tournaments based on search term and status
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = searchTerm === '' || 
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRegister = (tournament: any) => {
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Torneos Disponibles</h2>
        <p className="text-muted-foreground">Encuentra y únete a torneos de fútbol</p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar torneos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="enrolling">Inscripción abierta</SelectItem>
            <SelectItem value="in_progress">En curso</SelectItem>
            <SelectItem value="finished">Finalizado</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>{filteredTournaments.length} torneos</span>
        </div>
      </div>

      {/* Lista de torneos */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-lg">Cargando torneos...</div>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No se encontraron torneos</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay torneos disponibles en este momento'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
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
                        onClick={() => handleRegister(tournament)}
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
            organizadorNombre: selectedTournament.users?.full_name || 'N/A',
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

  export default TorneosPublicos;
