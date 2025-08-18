
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Settings, Bell, Calendar, MapPin, Medal, Plus, ArrowLeft } from "lucide-react";
import { UserMenu } from '@/components/UserMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import TorneosInscritos from '../components/TorneosInscritos';
import TorneosPublicos from '../components/TorneosPublicos';
import EditarPerfilEquipo from '../components/EditarPerfilEquipo';
import TorneosActivos from '../components/TorneosActivos';
import NotificacionesEquipo from '../components/NotificacionesEquipo';
import { useLegacyAuth } from '@/hooks/useLegacyAuth';

import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import TeamCards from '@/components/TeamCards';
import { EditUserProfile } from '@/components/EditUserProfile';
import TeamInvitations from '@/components/TeamInvitations';

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
  const [activeTab, setActiveTab] = useState('mis-equipos');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
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
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-primary">🔵 Panel de Equipo</h1>
              <p className="text-sm text-muted-foreground">Administra tu equipo y jugadores</p>
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
              <UserMenu onEditProfile={() => setShowEditProfile(true)} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="container mx-auto max-w-7xl">

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mis-equipos">Mis Equipos</TabsTrigger>
            <TabsTrigger value="invitaciones">Invitaciones</TabsTrigger>
            <TabsTrigger value="torneos-publicos">Buscar Torneos</TabsTrigger>
            <TabsTrigger value="torneos-activos">Torneos Activos</TabsTrigger>
          </TabsList>

          <TabsContent value="mis-equipos" className="mt-6">
            <TeamCards />
          </TabsContent>

          <TabsContent value="invitaciones" className="mt-6">
            <TeamInvitations teamCode={teams?.[0]?.team_code} />
          </TabsContent>

          <TabsContent value="torneos-publicos" className="mt-6">
            <div className="space-y-4">
              <Button 
                onClick={() => navigate('/torneos')}
                className="w-full"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Ver Todos los Torneos Disponibles
              </Button>
              <TorneosPublicos />
            </div>
          </TabsContent>

          <TabsContent value="torneos-activos" className="mt-6">
            <TorneosActivos />
          </TabsContent>
        </Tabs>

        {/* Modales */}
        <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Perfil de Usuario</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Este es tu perfil personal. Los equipos se gestionan por separado.
              </p>
            </DialogHeader>
            <EditUserProfile
              initialData={{
                full_name: user?.nombre || '',
              }}
              onSuccess={() => setShowEditProfile(false)}
            />
          </DialogContent>
        </Dialog>


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
