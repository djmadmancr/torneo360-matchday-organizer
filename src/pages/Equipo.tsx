
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Settings, Bell, Calendar, MapPin, Medal, Plus, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import TorneosInscritos from '../components/TorneosInscritos';
import TorneosPublicos from '../components/TorneosPublicos';
import EditarPerfilEquipo from '../components/EditarPerfilEquipo';
import EstadisticasEquipoWrapper from '../components/EstadisticasEquipoWrapper';
import NotificacionesEquipo from '../components/NotificacionesEquipo';
import { useLegacyAuth } from '@/hooks/useLegacyAuth';
import { CreateTeamModal } from '@/components/CreateTeamModal';
import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import MisEquipos from '@/components/MisEquipos';

interface Notificacion {
  id: string;
  tipo: "inscripcion" | "reprogramacion" | "otra" | "aprobacion" | "rechazo";
  titulo: string;
  mensaje: string;
  fecha: string;
  equipoSolicitante?: string;
  torneoId?: string;
  partidoId?: string;
  accionRequerida: boolean;
  equipoId?: string;
  mensajeEquipo?: string;
}

const Equipo = () => {
  const navigate = useNavigate();
  const { user } = useLegacyAuth();
  const [activeTab, setActiveTab] = useState('torneos-inscritos');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { teams, isLoading: teamsLoading } = useSupabaseTeams();

  useEffect(() => {
    if (user?.id) {
      cargarNotificaciones();
      
      const interval = setInterval(cargarNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const cargarNotificaciones = React.useCallback(() => {
    if (!user?.id) return;

    try {
      const notificacionesGuardadas = localStorage.getItem('notificacionesEquipo');
      if (notificacionesGuardadas) {
        const todasNotificaciones: Notificacion[] = JSON.parse(notificacionesGuardadas);
        
        const notificacionesDelEquipo = todasNotificaciones.filter(n => 
          n.equipoId === user.id || 
          (!n.equipoId && (n.tipo === 'aprobacion' || n.tipo === 'rechazo'))
        );
        
        setNotificaciones(notificacionesDelEquipo);
        
        const noLeidas = notificacionesDelEquipo.filter(n => n.accionRequerida).length;
        setUnreadCount(noLeidas);
        
        console.log('📧 Notificaciones cargadas:', {
          total: notificacionesDelEquipo.length,
          noLeidas: noLeidas,
          equipoId: user.id
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error);
    }
  }, [user?.id]);

  const getEquipoStats = () => {
    if (!user?.perfiles?.equipo) return {
      jugadores: 0,
      coaches: 0,
      torneos: 0,
      categoria: 'Sin categoría'
    };

    const perfil = user.perfiles.equipo;
    return {
      jugadores: perfil.jugadores?.length || 0,
      coaches: perfil.coaches?.length || 0,
      torneos: perfil.torneos?.length || 0,
      categoria: perfil.categoria || 'Sin categoría'
    };
  };

  const stats = getEquipoStats();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso requerido</h2>
            <p className="text-muted-foreground">
              Inicia sesión como equipo para acceder a esta sección
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
              <h1 className="text-xl md:text-2xl font-bold text-primary">🔵 Panel de Equipo</h1>
              <p className="text-sm text-muted-foreground">Administra tu equipo y jugadores</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="container mx-auto max-w-7xl">{/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Equipo Dashboard</h2>
                <p className="text-gray-600">
                  {user.perfiles?.equipo?.nombreEquipo || user.nombre}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNotifications(true)}
                className="relative"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notificaciones
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowCreateTeam(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Equipo
              </Button>
              
              <Button onClick={() => setShowEditProfile(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Configurar Perfil
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{teams?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Equipos Creados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{teams?.filter(t => t.enrollment_status === 'approved').length || 0}</div>
                <div className="text-sm text-muted-foreground">Equipos Aprobados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{teams?.filter(t => t.tournament_id).length || 0}</div>
                <div className="text-sm text-muted-foreground">En Torneos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{teams?.filter(t => t.enrollment_status === 'pending').length || 0}</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="torneos-inscritos">Mis Torneos</TabsTrigger>
            <TabsTrigger value="torneos-publicos">Buscar Torneos</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="torneos-inscritos" className="mt-6">
            <MisEquipos />
          </TabsContent>

          <TabsContent value="torneos-publicos" className="mt-6">
            <TorneosPublicos />
          </TabsContent>

          <TabsContent value="estadisticas" className="mt-6">
            <EstadisticasEquipoWrapper />
          </TabsContent>

          <TabsContent value="configuracion" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowEditProfile(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Perfil del Equipo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modales */}
        <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Perfil del Equipo</DialogTitle>
            </DialogHeader>
            <EditarPerfilEquipo
              open={showEditProfile}
              onClose={() => setShowEditProfile(false)}
              perfil={user.perfiles?.equipo || {
                nombreEquipo: 'Mi Equipo',
                logo: '/lovable-uploads/42e8c109-4456-4ead-811c-acae29f37a54.png',
                colores: { principal: '#1e40af', secundario: '#3b82f6' },
                categoria: 'Primera División',
                entrenador: 'Por definir',
                jugadores: [],
                coaches: [],
                torneos: []
              }}
              setPerfil={(newPerfil) => {
                console.log('Profile updated:', newPerfil);
              }}
              guardarPerfil={() => {
                toast.success('Perfil guardado exitosamente');
                setShowEditProfile(false);
              }}
            />
          </DialogContent>
        </Dialog>

        <CreateTeamModal
          open={showCreateTeam}
          onOpenChange={setShowCreateTeam}
        />

        <NotificacionesEquipo
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
          notificaciones={notificaciones}
          setNotificaciones={setNotificaciones}
        />
        </div>
      </div>
    </div>
  );
};

export default Equipo;
