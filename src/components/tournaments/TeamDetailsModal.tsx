import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MapPin, Mail, Phone, Trophy, Calendar } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  position?: string;
  jersey_number?: number;
  member_type: string;
}

interface HomeField {
  id: string;
  name: string;
  address?: string;
  created_at: string;
}

interface TeamDetails {
  id: string;
  name: string;
  city?: string;
  country?: string;
  logo_url?: string;
  colors?: any;
  team_code?: string;
  created_at: string;
  team_members: TeamMember[];
  home_fields: HomeField[];
  admin_user?: {
    full_name?: string;
    email: string;
  };
}

interface TeamDetailsModalProps {
  team: TeamDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
  team,
  open,
  onOpenChange,
}) => {
  if (!team) return null;

  const players = team.team_members.filter(m => m.member_type === 'player');
  const coaches = team.team_members.filter(m => m.member_type === 'coach');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {team.logo_url ? (
              <img 
                src={team.logo_url} 
                alt={`Logo ${team.name}`}
                className="w-10 h-10 object-cover rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{team.name}</h2>
              <p className="text-sm text-muted-foreground">
                {team.city && team.country ? `${team.city}, ${team.country}` : 
                 team.city || team.country || 'Ubicación no especificada'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="players">Jugadores</TabsTrigger>
            <TabsTrigger value="fields">Canchas</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{players.length}</p>
                      <p className="text-xs text-muted-foreground">Jugadores</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{coaches.length}</p>
                      <p className="text-xs text-muted-foreground">Cuerpo Técnico</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{team.home_fields.length}</p>
                      <p className="text-xs text-muted-foreground">Canchas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{new Date(team.created_at).getFullYear()}</p>
                      <p className="text-xs text-muted-foreground">Fundado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {team.colors && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Colores del Equipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {team.colors.primary && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: team.colors.primary }}
                        />
                        <span className="text-sm">Primario</span>
                      </div>
                    )}
                    {team.colors.secondary && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: team.colors.secondary }}
                        />
                        <span className="text-sm">Secundario</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Código de Equipo:</span>
                  <Badge variant="outline">{team.team_code}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de Registro:</span>
                  <span>{new Date(team.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Jugadores ({players.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {players.length > 0 ? (
                      players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{player.name}</p>
                            {player.position && (
                              <p className="text-sm text-muted-foreground">{player.position}</p>
                            )}
                          </div>
                          {player.jersey_number && (
                            <Badge variant="outline">#{player.jersey_number}</Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No hay jugadores registrados
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Cuerpo Técnico ({coaches.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {coaches.length > 0 ? (
                      coaches.map((coach) => (
                        <div key={coach.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{coach.name}</p>
                            {coach.position && (
                              <p className="text-sm text-muted-foreground">{coach.position}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No hay cuerpo técnico registrado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Canchas del Equipo ({team.home_fields.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.home_fields.length > 0 ? (
                    team.home_fields.map((field) => (
                      <div key={field.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{field.name}</h4>
                        {field.address && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {field.address}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No hay canchas registradas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {team.admin_user && (
                  <>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Administrador</p>
                        <p className="font-medium">{team.admin_user.full_name || 'No especificado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{team.admin_user.email}</p>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Código de Equipo</p>
                    <p className="font-medium">{team.team_code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};