import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePublicTournaments, useRequestRegistration } from '@/hooks/useTournamentRegistrations';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import { toast } from 'sonner';

const Torneos = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { teams } = useSupabaseTeams();
  const { data: tournaments, isLoading } = usePublicTournaments();
  const requestRegistration = useRequestRegistration();

  const handleRegister = async (tournamentId: string) => {
    if (!user || !teams || teams.length === 0) {
      toast.error('Necesitas tener un equipo para inscribirte');
      return;
    }

    try {
      await requestRegistration.mutateAsync({
        tournamentId,
        teamId: teams[0].id, // Use first team
      });
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
                          onClick={() => handleRegister(tournament.id)}
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
    </div>
  );
};

export default Torneos;