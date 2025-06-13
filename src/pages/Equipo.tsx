import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, User, Trophy, BarChart3, Save, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EquipoCard from "@/components/EquipoCard";
import UniformeSelector from "@/components/UniformeSelector";
import JugadoresCoachManager from "@/components/JugadoresCoachManager";
import { useAuth } from "@/contexts/AuthContext";
import { EquipoPerfil, Jugador, Coach } from "@/types/auth";
import PlayerStatistics from "@/components/PlayerStatistics";
import TorneosPublicos from "@/components/TorneosPublicos";

interface EstadisticaEquipo {
  torneoId: string;
  torneoNombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  pts: number;
  posicion: number;
}

const Equipo = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  const equipoPerfil = user?.perfiles?.equipo as EquipoPerfil;

  const [equipo, setEquipo] = useState(() => {
    const saved = localStorage.getItem(`equipo_${user?.id}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      id: user?.id || "EQ-001",
      nombre: equipoPerfil?.nombreEquipo || "Águilas FC",
      logo: equipoPerfil?.logo || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center",
      uniformes: {
        principal: {
          camiseta: {
            principal: equipoPerfil?.colores?.principal || "#1e40af",
            secundario: "#ffffff"
          },
          pantaloneta: equipoPerfil?.colores?.principal || "#1e40af",
          medias: equipoPerfil?.colores?.principal || "#1e40af"
        },
        alternativo: {
          camiseta: {
            principal: "#ffffff",
            secundario: equipoPerfil?.colores?.principal || "#1e40af"
          },
          pantaloneta: "#ffffff",
          medias: "#ffffff"
        }
      },
      colores: {
        camiseta: equipoPerfil?.colores?.principal || "#1e40af",
        pantaloneta: equipoPerfil?.colores?.principal || "#1e40af", 
        medias: equipoPerfil?.colores?.principal || "#1e40af"
      },
      jugadores: equipoPerfil?.jugadores || [] as Jugador[],
      coaches: equipoPerfil?.coaches || [] as Coach[],
      encargados: ["Manager Principal"],
      telefono: "+57 300 123 4567",
      email: user?.email || "info@equipo.com"
    };
  });

  // Notificaciones específicas del equipo
  const [notificaciones, setNotificaciones] = useState(() => {
    const saved = localStorage.getItem('notificacionesEquipo');
    const allNotifications = saved ? JSON.parse(saved) : [];
    return allNotifications.filter((n: any) => n.equipoId === user?.id);
  });

  // Estadísticas del equipo
  const [estadisticasEquipo, setEstadisticasEquipo] = useState(() => {
    const saved = localStorage.getItem(`estadisticas_${user?.id}`);
    return saved ? JSON.parse(saved) : [
      {
        torneoId: "TRN-001",
        torneoNombre: "Copa Primavera 2024",
        pj: 6, pg: 4, pe: 1, pp: 1,
        gf: 12, gc: 6, pts: 13, posicion: 1
      }
    ];
  });

  // Efecto para guardar datos del equipo
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`equipo_${user.id}`, JSON.stringify(equipo));
    }
  }, [equipo, user?.id]);

  // Efecto para actualizar notificaciones
  useEffect(() => {
    const actualizarNotificaciones = () => {
      const saved = localStorage.getItem('notificacionesEquipo');
      const allNotifications = saved ? JSON.parse(saved) : [];
      setNotificaciones(allNotifications.filter((n: any) => n.equipoId === user?.id));
    };

    actualizarNotificaciones();
    const interval = setInterval(actualizarNotificaciones, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newLogo = e.target?.result as string;
        setEquipo(prevState => ({ ...prevState, logo: newLogo }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUniformeChange = (colores: { camiseta: string; pantaloneta: string; medias: string }, uniformeType: 'principal' | 'alternativo') => {
    setEquipo(prevState => ({
      ...prevState,
      uniformes: {
        ...prevState.uniformes,
        [uniformeType]: {
          ...prevState.uniformes[uniformeType],
          camiseta: { ...prevState.uniformes[uniformeType].camiseta, principal: colores.camiseta },
          pantaloneta: colores.pantaloneta,
          medias: colores.medias
        }
      },
      colores: {
        camiseta: colores.camiseta,
        pantaloneta: colores.pantaloneta,
        medias: colores.medias
      }
    }));
  };

  const handleSaveChanges = () => {
    const updatedProfile: EquipoPerfil = {
      nombreEquipo: equipo.nombre,
      logo: equipo.logo,
      colores: {
        principal: equipo.colores.camiseta,
        secundario: equipo.colores.pantaloneta
      },
      categoria: equipoPerfil?.categoria || 'Primera División',
      entrenador: equipoPerfil?.entrenador || '',
      jugadores: equipo.jugadores,
      coaches: equipo.coaches,
      torneos: equipoPerfil?.torneos || []
    };

    updateUserProfile('equipo', updatedProfile);
    toast.success('Cambios guardados exitosamente');
  };

  const handleSolicitudEnviada = (torneoId: string, organizadorId: string) => {
    console.log(`Solicitud enviada para torneo ${torneoId} al organizador ${organizadorId}`);
  };

  const equipoParaCard = {
    id: equipo.id,
    nombre: equipo.nombre,
    logo: typeof equipo.logo === 'string' ? equipo.logo : "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center",
    colores: equipo.colores,
    jugadores: equipo.jugadores.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
              <div className="flex items-center gap-3">
                <img 
                  src={equipoParaCard.logo} 
                  alt={equipo.nombre}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-primary">🔵 Panel del Equipo</h1>
                  <p className="text-sm text-muted-foreground">Gestiona tu equipo y perfil</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSaveChanges}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarNotificaciones(true)}
                className="relative"
              >
                <Bell className="w-4 h-4" />
                {notificaciones.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificaciones.length}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarPerfil(true)}
              >
                <User className="w-4 h-4" />
                Perfil
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <Tabs defaultValue="perfil" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-5 text-xs md:text-sm">
            <TabsTrigger value="perfil">Perfil & Estadísticas</TabsTrigger>
            <TabsTrigger value="uniformes">Uniformes</TabsTrigger>
            <TabsTrigger value="jugadores">Jugadores & Coach</TabsTrigger>
            <TabsTrigger value="goleadores">Goleadores</TabsTrigger>
            <TabsTrigger value="torneos">Torneos</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Vista Previa del Equipo</h3>
                <EquipoCard 
                  equipo={equipoParaCard}
                  onEdit={() => setMostrarPerfil(true)}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Estadísticas en Torneos</h3>
                
                {estadisticasEquipo.length > 0 ? (
                  <div className="space-y-4">
                    {estadisticasEquipo.map((stats: any) => (
                      <Card key={stats.torneoId}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{stats.torneoNombre}</span>
                            <Badge variant="outline">Posición #{stats.posicion}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold">{stats.pj}</p>
                              <p className="text-sm text-muted-foreground">Partidos Jugados</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-600">{stats.pg}</p>
                              <p className="text-sm text-muted-foreground">Ganados</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-yellow-600">{stats.pe}</p>
                              <p className="text-sm text-muted-foreground">Empatados</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-red-600">{stats.pp}</p>
                              <p className="text-sm text-muted-foreground">Perdidos</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center mt-4 pt-4 border-t">
                            <div>
                              <p className="text-xl font-bold">{stats.gf}</p>
                              <p className="text-sm text-muted-foreground">Goles a Favor</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold">{stats.gc}</p>
                              <p className="text-sm text-muted-foreground">Goles en Contra</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-primary">{stats.pts}</p>
                              <p className="text-sm text-muted-foreground">Puntos</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No estás participando en ningún torneo actualmente.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="uniformes">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Uniforme Principal</h3>
                <UniformeSelector
                  colores={{
                    camiseta: equipo.uniformes.principal.camiseta.principal,
                    pantaloneta: equipo.uniformes.principal.pantaloneta,
                    medias: equipo.uniformes.principal.medias
                  }}
                  onChange={(colores) => handleUniformeChange(colores, 'principal')}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Uniforme Alternativo</h3>
                <UniformeSelector
                  colores={{
                    camiseta: equipo.uniformes.alternativo.camiseta.principal,
                    pantaloneta: equipo.uniformes.alternativo.pantaloneta,
                    medias: equipo.uniformes.alternativo.medias
                  }}
                  onChange={(colores) => handleUniformeChange(colores, 'alternativo')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jugadores">
            <JugadoresCoachManager
              jugadores={equipo.jugadores}
              coaches={equipo.coaches}
              onJugadoresChange={(jugadores) => setEquipo(prev => ({ ...prev, jugadores }))}
              onCoachesChange={(coaches) => setEquipo(prev => ({ ...prev, coaches }))}
            />
          </TabsContent>

          <TabsContent value="goleadores">
            <div className="space-y-6">
              <PlayerStatistics 
                jugadores={equipo.jugadores}
                className="bg-white p-6 rounded-lg shadow-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="torneos">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Torneos Públicos Disponibles</h3>
                <TorneosPublicos
                  userId={user?.id || ''}
                  nombreEquipo={equipo.nombre}
                  categoria={equipoPerfil?.categoria || 'Primera División'}
                  onSolicitudEnviada={handleSolicitudEnviada}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <Dialog open={mostrarPerfil} onOpenChange={setMostrarPerfil}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Editar Perfil del Equipo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <img 
                src={equipoParaCard.logo} 
                alt={equipo.nombre}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <Label htmlFor="nombre">Nombre del Equipo</Label>
                <Input
                  id="nombre"
                  value={equipo.nombre}
                  onChange={(e) => setEquipo(prev => ({ ...prev, nombre: e.target.value }))}
                />
              </div>
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Email</Label>
                <Input 
                  value={equipo.email}
                  onChange={(e) => setEquipo(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input 
                  value={equipo.telefono}
                  onChange={(e) => setEquipo(prev => ({ ...prev, telefono: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Encargados</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {equipo.encargados.map((encargado: string, index: number) => (
                    <Badge key={index} variant="secondary">{encargado}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleSaveChanges} className="w-full">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrarNotificaciones} onOpenChange={setMostrarNotificaciones}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notificaciones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {notificaciones.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No tienes notificaciones
              </p>
            ) : (
              notificaciones.map((notif: any) => (
                <div key={notif.id} className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">{notif.titulo}</h4>
                  <p className="text-sm text-muted-foreground">{notif.mensaje}</p>
                  <div className="text-xs text-muted-foreground">{notif.fecha}</div>
                  <Badge variant={notif.tipo === 'aprobacion' ? 'default' : 'destructive'}>
                    {notif.tipo === 'aprobacion' ? 'Aprobada' : 'Rechazada'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Equipo;
