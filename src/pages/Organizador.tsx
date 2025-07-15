
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
import EditarPerfilEquipo from '../components/EditarPerfilEquipo';
import { useLegacyAuth } from '@/hooks/useLegacyAuth';
import { EditUserProfile } from '@/components/EditUserProfile';
import { UserMenu } from '@/components/UserMenu';
import { useTournaments } from '@/hooks/useTournaments';
import { Card as TournamentCard } from '@/components/ui/card';

interface SolicitudInscripcion {
  id: string;
  equipoId: string;
  equipoNombre: string;
  torneoId: string;
  torneoNombre: string;
  fechaSolicitud: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  contacto: string;
  mensaje?: string;
}

const Organizador = () => {
  const navigate = useNavigate();
  const { user } = useLegacyAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateTorneo, setShowCreateTorneo] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { tournaments, isLoading: torneosLoading } = useTournaments();
  const [solicitudes, setSolicitudes] = useState<SolicitudInscripcion[]>([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0);

  useEffect(() => {
    if (user) {
      cargarSolicitudes();
      
      const interval = setInterval(cargarSolicitudes, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const cargarSolicitudes = () => {
    if (!user) return;

    try {
      const solicitudesKey = `solicitudes_inscripcion_${user.id}`;
      const solicitudesGuardadas = localStorage.getItem(solicitudesKey);
      
      if (solicitudesGuardadas) {
        const solicitudesData: SolicitudInscripcion[] = JSON.parse(solicitudesGuardadas);
        setSolicitudes(solicitudesData);
        
        const pendientes = solicitudesData.filter(s => s.estado === 'pendiente').length;
        setSolicitudesPendientes(pendientes);
        
        console.log('📋 Solicitudes cargadas:', {
          total: solicitudesData.length,
          pendientes: pendientes,
          organizadorId: user.id
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar solicitudes:', error);
    }
  };

  const procesarSolicitud = (solicitudId: string, accion: 'aprobar' | 'rechazar') => {
    if (!user) return;

    try {
      const solicitud = solicitudes.find(s => s.id === solicitudId);
      if (!solicitud) return;

      // Actualizar solicitud
      const solicitudesActualizadas = solicitudes.map(s => 
        s.id === solicitudId 
          ? { ...s, estado: accion === 'aprobar' ? 'aprobada' as const : 'rechazada' as const }
          : s
      );
      
      setSolicitudes(solicitudesActualizadas);
      
      const solicitudesKey = `solicitudes_inscripcion_${user.id}`;
      localStorage.setItem(solicitudesKey, JSON.stringify(solicitudesActualizadas));

      if (accion === 'aprobar') {
        // Crear inscripción aprobada
        const inscripcionKey = `inscripcion_${solicitud.torneoId}_${solicitud.equipoId}`;
        const inscripcionData = {
          equipoId: solicitud.equipoId,
          torneoId: solicitud.torneoId,
          fechaInscripcion: solicitud.fechaSolicitud,
          estado: 'aprobado',
          fechaAprobacion: new Date().toISOString()
        };
        
        localStorage.setItem(inscripcionKey, JSON.stringify(inscripcionData));

        // Actualizar lista de equipos inscritos
        const equiposInscritosKey = `equipos_inscritos_${solicitud.torneoId}`;
        const equiposInscritos = JSON.parse(localStorage.getItem(equiposInscritosKey) || '[]');
        
        if (!equiposInscritos.some((e: any) => e.equipoId === solicitud.equipoId)) {
          equiposInscritos.push({
            equipoId: solicitud.equipoId,
            fechaInscripcion: new Date().toISOString(),
            estado: 'aprobado'
          });
          localStorage.setItem(equiposInscritosKey, JSON.stringify(equiposInscritos));
        }

        // Crear notificación para el equipo
        const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
        const nuevaNotificacion = {
          id: `NOT-${Date.now()}`,
          tipo: 'aprobacion',
          titulo: '¡Inscripción Aprobada!',
          mensaje: `Tu solicitud para el torneo "${solicitud.torneoNombre}" ha sido aprobada.`,
          fecha: new Date().toLocaleDateString(),
          torneoId: solicitud.torneoId,
          equipoId: solicitud.equipoId,
          accionRequerida: true
        };
        
        notificacionesEquipo.push(nuevaNotificacion);
        localStorage.setItem('notificacionesEquipo', JSON.stringify(notificacionesEquipo));

        console.log('✅ Solicitud aprobada y notificación creada:', {
          solicitud: solicitud,
          inscripcion: inscripcionData,
          notificacion: nuevaNotificacion
        });
        
        toast.success(`Inscripción de ${solicitud.equipoNombre} aprobada`);
      } else {
        // Crear notificación de rechazo
        const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
        const nuevaNotificacion = {
          id: `NOT-${Date.now()}`,
          tipo: 'rechazo',
          titulo: 'Inscripción Rechazada',
          mensaje: `Tu solicitud para el torneo "${solicitud.torneoNombre}" ha sido rechazada.`,
          fecha: new Date().toLocaleDateString(),
          torneoId: solicitud.torneoId,
          equipoId: solicitud.equipoId,
          accionRequerida: true
        };
        
        notificacionesEquipo.push(nuevaNotificacion);
        localStorage.setItem('notificacionesEquipo', JSON.stringify(notificacionesEquipo));
        
        toast.success(`Inscripción de ${solicitud.equipoNombre} rechazada`);
      }

      const pendientes = solicitudesActualizadas.filter(s => s.estado === 'pendiente').length;
      setSolicitudesPendientes(pendientes);

    } catch (error) {
      console.error('❌ Error al procesar solicitud:', error);
      toast.error('Error al procesar la solicitud');
    }
  };

  const getOrganizadorStats = () => {
    if (!user?.perfiles?.organizador) return {
      torneos: 0,
      organizacion: user?.nombre || 'Sin nombre',
      solicitudesPendientes: solicitudesPendientes
    };

    const perfil = user.perfiles.organizador;
    return {
      torneos: perfil.torneos?.length || 0,
      organizacion: perfil.nombreOrganizacion || 'Sin nombre',
      solicitudesPendientes: solicitudesPendientes
    };
  };

  const stats = getOrganizadorStats();

  if (!user) {
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
                  {stats?.organizacion || user.nombre}
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
              
              <UserMenu onEditProfile={() => setShowEditProfile(true)} />
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="solicitudes" className="relative">
              Solicitudes
              {solicitudesPendientes > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {solicitudesPendientes}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="torneos">Torneos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <OrganizadorDashboard />
          </TabsContent>

          <TabsContent value="solicitudes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Solicitudes de Inscripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                {solicitudes.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay solicitudes</h3>
                    <p className="text-muted-foreground">
                      Las solicitudes de inscripción a tus torneos aparecerán aquí
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {solicitudes.map((solicitud) => (
                      <div
                        key={solicitud.id}
                        className={`p-4 border rounded-lg ${
                          solicitud.estado === 'pendiente' ? 'border-yellow-200 bg-yellow-50' :
                          solicitud.estado === 'aprobada' ? 'border-green-200 bg-green-50' :
                          'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {solicitud.estado === 'pendiente' && <Clock className="w-5 h-5 text-yellow-500" />}
                              {solicitud.estado === 'aprobada' && <CheckCircle className="w-5 h-5 text-green-500" />}
                              {solicitud.estado === 'rechazada' && <XCircle className="w-5 h-5 text-red-500" />}
                            </div>
                            <div>
                              <h4 className="font-semibold">{solicitud.equipoNombre}</h4>
                              <p className="text-sm text-muted-foreground">
                                Torneo: {solicitud.torneoNombre}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Fecha: {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {solicitud.estado === 'pendiente' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => procesarSolicitud(solicitud.id, 'aprobar')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => procesarSolicitud(solicitud.id, 'rechazar')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rechazar
                              </Button>
                            </div>
                          )}
                          
                          {solicitud.estado !== 'pendiente' && (
                            <Badge variant={
                              solicitud.estado === 'aprobada' ? 'default' : 'destructive'
                            }>
                              {solicitud.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                            </Badge>
                          )}
                        </div>
                        
                        {solicitud.mensaje && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <strong>Mensaje:</strong> {solicitud.mensaje}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="torneos" className="mt-6">
            <TournamentCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Mis Torneos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {torneosLoading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Cargando torneos...</p>
                  </div>
                ) : tournaments?.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay torneos</h3>
                    <p className="text-muted-foreground">
                      Crea tu primer torneo para empezar
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tournaments?.map((tournament) => (
                      <TournamentCard key={tournament.id} className="border hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{tournament.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{tournament.description}</p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>Estado:</span>
                              <Badge variant={tournament.status === 'active' ? 'default' : 'secondary'}>
                                {tournament.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Equipos:</span>
                              <span>{tournament.teams?.length || 0}/{tournament.max_teams}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Inicio:</span>
                              <span>{tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" variant="outline">
                              <Settings className="w-3 h-3 mr-1" />
                              Config
                            </Button>
                            <Button size="sm" variant="outline">
                              <Calendar className="w-3 h-3 mr-1" />
                              Fixture
                            </Button>
                            <Button size="sm" variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              Fiscales
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trophy className="w-3 h-3 mr-1" />
                              Stats
                            </Button>
                          </div>
                        </CardContent>
                      </TournamentCard>
                    ))}
                  </div>
                )}
              </CardContent>
            </TournamentCard>
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
                full_name: user?.nombre || '',
              }}
              onSuccess={() => setShowEditProfile(false)}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Organizador;
