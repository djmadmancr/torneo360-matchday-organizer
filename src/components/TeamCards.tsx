import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Calendar, Users, MapPin, Copy, Home, Plus, Edit } from "lucide-react";
import { useMyTeams } from '@/hooks/useTeamCards';
import { CreateTeamModal } from './CreateTeamModal';
import { EditTeamProfile } from './EditTeamProfile';
import { HomeFieldForm } from './HomeFieldForm';
import { toast } from 'sonner';

const TeamCards = () => {
  const { data: teams, isLoading } = useMyTeams();
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [managingFields, setManagingFields] = useState<string | null>(null);

  const copyTeamCode = (teamCode: string) => {
    navigator.clipboard.writeText(teamCode);
    toast.success('Código del equipo copiado');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando equipos...</p>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes equipos creados</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer equipo para empezar a participar en torneos
            </p>
            <Button onClick={() => setShowCreateTeam(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primer equipo
            </Button>
          </CardContent>
        </Card>
        
        <CreateTeamModal
          open={showCreateTeam}
          onOpenChange={setShowCreateTeam}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Equipos</h2>
        <Button onClick={() => setShowCreateTeam(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Equipo
        </Button>
      </div>

      <div className="grid gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg relative">
                    {team.logo_url ? (
                      <>
                        <img 
                          src={team.logo_url} 
                          alt={`Logo de ${team.name}`}
                          className="w-8 h-8 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const trophy = e.currentTarget.parentElement?.querySelector('[data-fallback="trophy"]') as HTMLElement;
                            if (trophy) trophy.style.display = 'block';
                          }}
                        />
                        <Trophy 
                          className="w-8 h-8 text-blue-600 absolute inset-2" 
                          data-fallback="trophy"
                          style={{ display: 'none' }}
                        />
                      </>
                    ) : (
                      <Trophy className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    {team.city && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {team.city}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManagingFields(team.id)}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Canchas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingTeam(team.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Gestionar
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Team Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Información del Equipo</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Creado:</span>
                      <span className="font-medium">{new Date(team.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Miembros:</span>
                      <span className="font-medium">{team.team_members?.length || 0}</span>
                    </div>

                    {team.team_code && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Código:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                          {team.team_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyTeamCode(team.team_code!)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

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

                {/* Home Fields */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Canchas Locales</h4>
                  {team.home_fields && team.home_fields.length > 0 ? (
                    <div className="space-y-2">
                      {team.home_fields.map((field) => (
                        <div key={field.id} className="p-2 bg-green-50 rounded border">
                          <div className="font-medium text-sm">{field.name}</div>
                          {field.address && (
                            <div className="text-xs text-muted-foreground">{field.address}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay canchas configuradas
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      <CreateTeamModal
        open={showCreateTeam}
        onOpenChange={setShowCreateTeam}
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
                }
              }}
              onSuccess={() => setEditingTeam(null)}
              onDelete={() => setEditingTeam(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {managingFields && (
        <Dialog open={!!managingFields} onOpenChange={() => setManagingFields(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gestionar Canchas Locales</DialogTitle>
            </DialogHeader>
            <HomeFieldForm
              teamId={managingFields}
              fields={teams?.find(t => t.id === managingFields)?.home_fields || []}
              onClose={() => setManagingFields(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamCards;