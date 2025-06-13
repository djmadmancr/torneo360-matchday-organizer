import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, User, Trophy, BarChart3, Save, Upload, Plus, Edit } from "lucide-react";
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

interface EquipoData {
  id: string;
  nombre: string;
  logo: string;
  uniformes: {
    principal: {
      camiseta: { principal: string; secundario: string };
      pantaloneta: string;
      medias: string;
    };
    alternativo: {
      camiseta: { principal: string; secundario: string };
      pantaloneta: string;
      medias: string;
    };
  };
  colores: {
    camiseta: string;
    pantaloneta: string;
    medias: string;
  };
  jugadores: Jugador[];
  coaches: Coach[];
  encargados: string[];
  telefono: string;
  email: string;
}

const Equipo = () => {
  const navigate = useNavigate();
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarFormularioEquipo, setMostrarFormularioEquipo] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<string | null>(null);

  const { user, updateUserProfile } = useAuth();
  const equipoPerfil = user?.perfiles?.equipo as EquipoPerfil;

  // Lista de equipos del usuario
  const [equipos, setEquipos] = useState<EquipoData[]>(() => {
    const saved = localStorage.getItem(`equipos_${user?.id}`);
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Crear equipo inicial basado en el perfil
    const equipoInicial: EquipoData = {
      id: `EQ-${Date.now()}`,
      nombre: equipoPerfil?.nombreEquipo || "Mi Equipo",
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
      jugadores: equipoPerfil?.jugadores || [],
      coaches: equipoPerfil?.coaches || [],
      encargados: ["Manager Principal"],
      telefono: "+57 300 123 4567",
      email: user?.email || "info@equipo.com"
    };
    
    return [equipoInicial];
  });

  const [nuevoEquipo, setNuevoEquipo] = useState<Partial<EquipoData>>({
    nombre: "",
    logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center",
    colores: {
      camiseta: "#1e40af",
      pantaloneta: "#1e40af",
      medias: "#1e40af"
    },
    jugadores: [],
    coaches: [],
    encargados: ["Manager Principal"],
    telefono: "+57 300 123 4567",
    email: user?.email || "info@equipo.com"
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

  // Efecto para guardar datos de equipos
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`equipos_${user.id}`, JSON.stringify(equipos));
    }
  }, [equipos, user?.id]);

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

  const handleCrearEquipo = () => {
    if (!nuevoEquipo.nombre) {
      toast.error("Por favor ingresa el nombre del equipo");
      return;
    }

    const equipoCompleto: EquipoData = {
      id: `EQ-${Date.now()}`,
      nombre: nuevoEquipo.nombre,
      logo: nuevoEquipo.logo || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center",
      uniformes: {
        principal: {
          camiseta: {
            principal: nuevoEquipo.colores?.camiseta || "#1e40af",
            secundario: "#ffffff"
          },
          pantaloneta: nuevoEquipo.colores?.pantaloneta || "#1e40af",
          medias: nuevoEquipo.colores?.medias || "#1e40af"
        },
        alternativo: {
          camiseta: {
            principal: "#ffffff",
            secundario: nuevoEquipo.colores?.camiseta || "#1e40af"
          },
          pantaloneta: "#ffffff",
          medias: "#ffffff"
        }
      },
      colores: nuevoEquipo.colores || {
        camiseta: "#1e40af",
        pantaloneta: "#1e40af",
        medias: "#1e40af"
      },
      jugadores: [],
      coaches: [],
      encargados: ["Manager Principal"],
      telefono: nuevoEquipo.telefono || "+57 300 123 4567",
      email: nuevoEquipo.email || user?.email || "info@equipo.com"
    };

    setEquipos(prev => [...prev, equipoCompleto]);
    setMostrarFormularioEquipo(false);
    setNuevoEquipo({
      nombre: "",
      logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center",
      colores: {
        camiseta: "#1e40af",
        pantaloneta: "#1e40af",
        medias: "#1e40af"
      },
      jugadores: [],
      coaches: [],
      encargados: ["Manager Principal"],
      telefono: "+57 300 123 4567",
      email: user?.email || "info@equipo.com"
    });
    toast.success("Equipo creado exitosamente");
  };

  const handleSeleccionarEquipo = (equipoId: string) => {
    setEquipoSeleccionado(equipoId);
  };

  const handleSolicitudEnviada = (torneoId: string, organizadorId: string) => {
    console.log(`Solicitud enviada para torneo ${torneoId} al organizador ${organizadorId}`);
  };

  const equipoActual = equipoSeleccionado ? equipos.find(e => e.id === equipoSeleccionado) : equipos[0];

  if (equipoSeleccionado && equipoActual) {
    // Vista individual del equipo
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setEquipoSeleccionado(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a Equipos
                </Button>
                <div className="flex items-center gap-3">
                  <img 
                    src={equipoActual.logo} 
                    alt={equipoActual.nombre}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-primary">{equipoActual.nombre}</h1>
                    <p className="text-sm text-muted-foreground">Gestión del Equipo</p>
                  </div>
                </div>
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
                    equipo={{
                      id: equipoActual.id,
                      nombre: equipoActual.nombre,
                      logo: equipoActual.logo,
                      colores: equipoActual.colores,
                      jugadores: equipoActual.jugadores.length
                    }}
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
                      camiseta: equipoActual.uniformes.principal.camiseta.principal,
                      pantaloneta: equipoActual.uniformes.principal.pantaloneta,
                      medias: equipoActual.uniformes.principal.medias
                    }}
                    onChange={(colores) => {
                      setEquipos(prev => prev.map(eq => 
                        eq.id === equipoActual.id 
                          ? {
                              ...eq,
                              uniformes: {
                                ...eq.uniformes,
                                principal: {
                                  ...eq.uniformes.principal,
                                  camiseta: { ...eq.uniformes.principal.camiseta, principal: colores.camiseta },
                                  pantaloneta: colores.pantaloneta,
                                  medias: colores.medias
                                }
                              },
                              colores: {
                                camiseta: colores.camiseta,
                                pantaloneta: colores.pantaloneta,
                                medias: colores.medias
                              }
                            }
                          : eq
                      ));
                    }}
                  />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Uniforme Alternativo</h3>
                  <UniformeSelector
                    colores={{
                      camiseta: equipoActual.uniformes.alternativo.camiseta.principal,
                      pantaloneta: equipoActual.uniformes.alternativo.pantaloneta,
                      medias: equipoActual.uniformes.alternativo.medias
                    }}
                    onChange={(colores) => {
                      setEquipos(prev => prev.map(eq => 
                        eq.id === equipoActual.id 
                          ? {
                              ...eq,
                              uniformes: {
                                ...eq.uniformes,
                                alternativo: {
                                  ...eq.uniformes.alternativo,
                                  camiseta: { ...eq.uniformes.alternativo.camiseta, principal: colores.camiseta },
                                  pantaloneta: colores.pantaloneta,
                                  medias: colores.medias
                                }
                              }
                            }
                          : eq
                      ));
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="jugadores">
              <JugadoresCoachManager
                jugadores={equipoActual.jugadores}
                coaches={equipoActual.coaches}
                onJugadoresChange={(jugadores) => {
                  setEquipos(prev => prev.map(eq => 
                    eq.id === equipoActual.id ? { ...eq, jugadores } : eq
                  ));
                }}
                onCoachesChange={(coaches) => {
                  setEquipos(prev => prev.map(eq => 
                    eq.id === equipoActual.id ? { ...eq, coaches } : eq
                  ));
                }}
              />
            </TabsContent>

            <TabsContent value="goleadores">
              <div className="space-y-6">
                <PlayerStatistics 
                  jugadores={equipoActual.jugadores}
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
                    nombreEquipo={equipoActual.nombre}
                    categoria={equipoPerfil?.categoria || 'Primera División'}
                    onSolicitudEnviada={handleSolicitudEnviada}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Vista principal de equipos
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
                  src={user?.perfiles?.equipo?.logo || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center"} 
                  alt={user?.nombre || "Usuario"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-primary">{user?.nombre}</h1>
                  <p className="text-sm text-muted-foreground">Gestor de Equipos</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Mis Equipos</h2>
            <Button onClick={() => setMostrarFormularioEquipo(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Equipo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipos.map((equipo) => (
              <Card key={equipo.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={equipo.logo} 
                      alt={equipo.nombre}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{equipo.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{equipo.jugadores.length} jugadores</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Coaches:</span>
                      <span>{equipo.coaches.length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="truncate">{equipo.email}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSeleccionarEquipo(equipo.id)}
                      className="flex-1"
                    >
                      Gestionar
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Lógica para editar equipo
                        toast.info("Función de edición en desarrollo");
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para crear nuevo equipo */}
      <Dialog open={mostrarFormularioEquipo} onOpenChange={setMostrarFormularioEquipo}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Equipo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreEquipo">Nombre del Equipo *</Label>
              <Input
                id="nombreEquipo"
                value={nuevoEquipo.nombre}
                onChange={(e) => setNuevoEquipo(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Águilas FC"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emailEquipo">Email</Label>
              <Input
                id="emailEquipo"
                type="email"
                value={nuevoEquipo.email}
                onChange={(e) => setNuevoEquipo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@equipo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefonoEquipo">Teléfono</Label>
              <Input
                id="telefonoEquipo"
                value={nuevoEquipo.telefono}
                onChange={(e) => setNuevoEquipo(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+57 300 123 4567"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCrearEquipo} className="flex-1">
                Crear Equipo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setMostrarFormularioEquipo(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de notificaciones */}
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