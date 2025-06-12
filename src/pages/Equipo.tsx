
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, User, Trophy, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EquipoCard from "@/components/EquipoCard";
import UniformeSelector from "@/components/UniformeSelector";
import JugadoresCoachManager from "@/components/JugadoresCoachManager";

interface Jugador {
  id: string;
  nombre: string;
  posicion: string;
  numeroIdentificacion: string;
  edad: number;
}

interface Coach {
  nombre: string;
  tipo: "entrenador" | "asistente";
  numeroIdentificacion: string;
}

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
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);

  const [equipo, setEquipo] = useState({
    id: "EQ-001",
    nombre: "Águilas FC",
    logo: null as File | null,
    uniformes: {
      principal: {
        camiseta: {
          principal: "#1e40af",
          secundario: "#ffffff"
        },
        pantaloneta: "#1e40af",
        medias: "#1e40af"
      },
      alternativo: {
        camiseta: {
          principal: "#ffffff",
          secundario: "#1e40af"
        },
        pantaloneta: "#ffffff",
        medias: "#ffffff"
      }
    },
    colores: {
      camiseta: "#1e40af",
      pantaloneta: "#1e40af", 
      medias: "#1e40af"
    },
    jugadores: [] as Jugador[],
    coaches: [] as Coach[]
  });

  const [perfil, setPerfil] = useState({
    nombre: "Águilas FC",
    logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center",
    encargados: ["Carlos Rodríguez", "Ana Martínez"],
    email: "info@aguilasfc.com",
    telefono: "+57 300 123 4567"
  });

  // Estadísticas demo del equipo en diferentes torneos
  const estadisticasEquipo: EstadisticaEquipo[] = [
    {
      torneoId: "TRN-001",
      torneoNombre: "Copa Primavera 2024",
      pj: 6,
      pg: 4,
      pe: 1,
      pp: 1,
      gf: 12,
      gc: 6,
      pts: 13,
      posicion: 1
    },
    {
      torneoId: "TRN-002", 
      torneoNombre: "Liga Municipal Otoño",
      pj: 8,
      pg: 5,
      pe: 2,
      pp: 1,
      gf: 15,
      gc: 8,
      pts: 17,
      posicion: 2
    }
  ];

  const notificaciones = [
    {
      id: "NOT-001",
      titulo: "Próximo partido",
      mensaje: "Tienes un partido programado para el sábado 20/06",
      fecha: "2024-06-15"
    }
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEquipo(prevState => ({ ...prevState, logo: file }));
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

  const equipoParaCard = {
    id: equipo.id,
    nombre: equipo.nombre,
    logo: equipo.logo ? URL.createObjectURL(equipo.logo) : "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center",
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
                  src={perfil.logo} 
                  alt={perfil.nombre}
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
        <Tabs defaultValue="perfil" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 text-xs md:text-sm">
            <TabsTrigger value="perfil">Perfil del Equipo</TabsTrigger>
            <TabsTrigger value="uniformes">Uniformes</TabsTrigger>
            <TabsTrigger value="jugadores">Jugadores & Coach</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Información del Equipo</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Equipo</Label>
                    <Input
                      type="text"
                      id="nombre"
                      value={equipo.nombre}
                      onChange={(e) => setEquipo(prevState => ({ ...prevState, nombre: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo del Equipo</Label>
                    <Input
                      type="file"
                      id="logo"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
                <EquipoCard 
                  equipo={equipoParaCard}
                  onEdit={() => {}}
                />
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

          <TabsContent value="estadisticas">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Estadísticas en Torneos</h3>
                
                {estadisticasEquipo.length > 0 ? (
                  <div className="space-y-4">
                    {estadisticasEquipo.map((stats) => (
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
        </Tabs>
      </div>

      {/* Modals */}
      <Dialog open={mostrarPerfil} onOpenChange={setMostrarPerfil}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Perfil del Equipo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <img 
                src={perfil.logo} 
                alt={perfil.nombre}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold">{perfil.nombre}</h3>
                <p className="text-sm text-muted-foreground">{perfil.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Encargados</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {perfil.encargados.map((encargado, index) => (
                    <Badge key={index} variant="secondary">{encargado}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Teléfono</Label>
                <p className="text-sm">{perfil.telefono}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrarNotificaciones} onOpenChange={setMostrarNotificaciones}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notificaciones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {notificaciones.map((notif) => (
              <div key={notif.id} className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">{notif.titulo}</h4>
                <p className="text-sm text-muted-foreground">{notif.mensaje}</p>
                <div className="text-xs text-muted-foreground">{notif.fecha}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Equipo;
