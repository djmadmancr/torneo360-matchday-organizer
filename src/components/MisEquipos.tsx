import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Calendar, Users, MapPin, Target, Edit, Plus } from "lucide-react";
import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import { EditTeamProfile } from './EditTeamProfile';
import { CreateTeamModal } from './CreateTeamModal';

const MisEquipos = () => {
  const { teams, isLoading } = useSupabaseTeams();
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  console.log('🔍 MisEquipos DEBUG:', { 
    showCreateTeam, 
    teams: teams?.length, 
    isLoading,
    component: 'rendered'
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando equipos...</p>
      </div>
    );
  }

  // Forzar mostrar el estado de "no teams" para debugging
  if (!teams || teams.length === 0 || true) { // Temporalmente forzado para debugging
    console.log('🎯 MOSTRANDO: Mensaje de "No tienes equipos creados"');
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes equipos creados</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer equipo para empezar a participar en torneos
            </p>
            <Button 
              className="w-auto" 
              onClick={() => {
                console.log('🚀 BOTÓN CLICKEADO: "Crear primer equipo"');
                console.log('🔄 Cambiando showCreateTeam de', showCreateTeam, 'a true');
                setShowCreateTeam(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear primer equipo
            </Button>
          </CardContent>
        </Card>
        
        {/* Modal DEBUG - Siempre visible para testing */}
        <CreateTeamModal
          open={showCreateTeam}
          onOpenChange={(open) => {
            console.log('🔄 Modal estado cambiando a:', open);
            setShowCreateTeam(open);
          }}
        />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Equipos</h2>
        <div className="text-sm text-gray-500">
          {teams.length} {teams.length === 1 ? 'equipo creado' : 'equipos creados'}
        </div>
      </div>

      <div className="grid gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {team.logo_url ? (
                      <img 
                        src={team.logo_url} 
                        alt={`Logo de ${team.name}`}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : (
                      <Trophy className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    {team.tournament_id && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">En Torneo</Badge>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingTeam(team.id)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Gestionar
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Información del Equipo */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Información del Equipo</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Creado:</span>
                      <span className="font-medium">{new Date(team.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Miembros:</span>
                      <span className="font-medium">{(team as any).team_members?.length || 0}</span>
                    </div>

                    {team.colors && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: (team.colors as any)?.principal || '#1e40af' }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: (team.colors as any)?.secundario || '#3b82f6' }}
                          />
                        </div>
                        <span className="text-gray-600">Colores del equipo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Torneo Actual */}
                {team.tournament && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Torneo Actual</h4>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Torneo Actual</span>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">
                        {(team as any).tournament?.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      <CreateTeamModal
        open={showCreateTeam}
        onOpenChange={(open) => {
          console.log('Modal estado cambiando a:', open);
          setShowCreateTeam(open);
        }}
      />

      {editingTeam && (
        <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestionar Equipo</DialogTitle>
            </DialogHeader>
            <EditTeamProfile
              teamId={editingTeam}
              initialData={{
                name: teams?.find(t => t.id === editingTeam)?.name || '',
                logo_url: teams?.find(t => t.id === editingTeam)?.logo_url || '',
                colors: teams?.find(t => t.id === editingTeam)?.colors as any || {
                  principal: "#1e40af",
                  secundario: "#3b82f6"
                },
                team_data: teams?.find(t => t.id === editingTeam)?.team_data as any
              }}
              onSuccess={() => setEditingTeam(null)}
              onDelete={() => setEditingTeam(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MisEquipos;