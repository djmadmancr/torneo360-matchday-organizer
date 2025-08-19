
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Calendar, Settings, Plus, Bell, CheckCircle, XCircle, Clock, ArrowLeft, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import OrganizadorDashboard from '../components/OrganizadorDashboard';
import TorneoFormModalWrapper from '../components/TorneoFormModalWrapper';
import TournamentCard from '../components/TournamentCard';
import { TournamentEditModal } from '../components/TournamentEditModal';
import { useAuth } from '@/contexts/AuthContext';
import { EditUserProfile } from '@/components/EditUserProfile';
import { UserMenu } from '@/components/UserMenu';
import { useTournaments, Tournament } from '@/hooks/useTournaments';
import { useOrganizerTournaments } from '@/hooks/useOrganizerTournaments';
import { AllOrganizerRequests } from '@/components/tournaments/AllOrganizerRequests';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';


const Organizador = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('torneos');
  const [showCreateTorneo, setShowCreateTorneo] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditTournament, setShowEditTournament] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const { data: organizerTournaments, isLoading: torneosLoading } = useOrganizerTournaments(currentUser?.id);
  const { deleteTournament } = useTournaments();
  
  // Hook para obtener solicitudes pendientes reales
  const { data: pendingRequestsCount = 0 } = useQuery({
    queryKey: ['organizer-pending-count', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return 0;
      
      const { data, error } = await supabase
        .from('team_registrations')
        .select('id, tournaments!inner(organizer_id)')
        .eq('tournaments.organizer_id', currentUser.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data.length;
    },
    enabled: !!currentUser?.id,
  });



  const getOrganizadorStats = () => {
    return {
      torneos: organizerTournaments?.length || 0,
      organizacion: currentUser?.full_name || 'Sin nombre',
      solicitudesPendientes: pendingRequestsCount
    };
  };

  const stats = getOrganizadorStats();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso requerido</h2>
            <p className="text-muted-foreground">
              Inicia sesión como organizador para acceder a esta sección
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-primary">🟢 Panel de Organizador</h1>
                <p className="text-sm text-muted-foreground">Administra torneos y equipos</p>
              </div>
            </div>
            <UserMenu onEditProfile={() => setShowEditProfile(true)} />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="container mx-auto max-w-7xl">{/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Organizador Dashboard</h2>
                <p className="text-gray-600">
                  {stats?.organizacion || currentUser.full_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCreateTorneo(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Torneo
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.torneos}</div>
                <div className="text-sm text-muted-foreground">Torneos Organizados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.solicitudesPendientes}</div>
                <div className="text-sm text-muted-foreground">Solicitudes Pendientes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm font-bold text-green-600">{stats.organizacion}</div>
                <div className="text-sm text-muted-foreground">Organización</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Desktop Tabs */}
          <TabsList className="hidden md:grid w-full grid-cols-3">
            <TabsTrigger value="torneos">Torneos</TabsTrigger>
            <TabsTrigger value="resumen">Resumen de Torneos</TabsTrigger>
            <TabsTrigger value="solicitudes" className="relative">
              Solicitudes
              {pendingRequestsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {pendingRequestsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Mobile Dropdown */}
          <div className="md:hidden mb-4">
            <select 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 border rounded-lg bg-background text-foreground"
            >
              <option value="torneos">🏆 Torneos</option>
              <option value="resumen">📊 Resumen de Torneos</option>
              <option value="solicitudes">
                📋 Solicitudes {pendingRequestsCount > 0 ? `(${pendingRequestsCount})` : ''}
              </option>
            </select>
          </div>

          <TabsContent value="resumen" className="mt-6">
            <OrganizadorDashboard />
          </TabsContent>

          <TabsContent value="solicitudes" className="mt-6">
            <AllOrganizerRequests organizerId={currentUser?.id || ''} />
          </TabsContent>

          <TabsContent value="torneos" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary">Mis Torneos</h2>
              <Button 
                onClick={() => setShowCreateTorneo(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Torneo
              </Button>
            </div>

            {torneosLoading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Cargando torneos...</p>
              </div>
            ) : organizerTournaments && organizerTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizerTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament as Tournament}
                    onEdit={(tournament) => {
                       setSelectedTournament(tournament as Tournament);
                       setShowEditTournament(true);
                     }}
                    onViewFixtures={(tournament) => {
                      // TODO: Implementar vista de fixtures
                      console.log('Ver fixtures:', tournament);
                    }}
                    onViewStats={(tournament) => {
                      // TODO: Implementar vista de estadísticas
                      console.log('Ver estadísticas:', tournament);
                    }}
                    onManageReferees={(tournament) => {
                      // TODO: Implementar gestión de árbitros
                      console.log('Gestionar árbitros:', tournament);
                    }}
                    onDelete={async (tournament) => {
                      try {
                        await deleteTournament(tournament.id);
                      } catch (error) {
                        console.error('Error al eliminar torneo:', error);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes torneos creados</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea tu primer torneo para comenzar a gestionar equipos y partidos.
                  </p>
                  <Button 
                    onClick={() => setShowCreateTorneo(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Torneo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

        </Tabs>

        {/* Modales */}
        <TorneoFormModalWrapper
          open={showCreateTorneo}
          onClose={() => setShowCreateTorneo(false)}
        />

        <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Perfil de Organizador</DialogTitle>
            </DialogHeader>
            <EditUserProfile
              initialData={{
                full_name: currentUser?.full_name || '',
              }}
              onSuccess={() => setShowEditProfile(false)}
            />
          </DialogContent>
        </Dialog>

        {selectedTournament && (
          <TournamentEditModal
            tournament={selectedTournament}
            open={showEditTournament}
            onOpenChange={(open) => {
              setShowEditTournament(open);
              if (!open) setSelectedTournament(null);
            }}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default Organizador;
