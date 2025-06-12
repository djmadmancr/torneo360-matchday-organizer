import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Download, Calendar, BarChart3, Trophy, Bell, User, FileText, CheckCircle, XCircle, Clock, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TorneoFormModal from "@/components/TorneoFormModal";
import TorneoEstadisticas from "@/components/TorneoEstadisticas";
import OrganizadorDashboard from "@/components/OrganizadorDashboard";

interface Torneo {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  formato: string;
  fechaInicio: string;
  fechaFin: string;
  logo: string;
  maxEquipos: number;
  equiposInscritos: number;
  estado: "inscripciones_abiertas" | "inscripciones_cerradas" | "en_curso" | "finalizado";
  fechaCierre: string;
  puntajeExtra: string;
  idaVuelta: {
    grupos: boolean;
    eliminatoria: boolean;
  };
  diasSemana: string[];
  partidosPorSemana: string;
  fechaCreacion: string;
}

interface PerfilOrganizador {
  nombre: string;
  logo: string;
  encargados: string[];
  email: string;
  telefono: string;
}

interface Notificacion {
  id: string;
  tipo: "inscripcion" | "reprogramacion" | "otra";
  titulo: string;
  mensaje: string;
  fecha: string;
  equipoSolicitante?: string;
  torneoId?: string;
  partidoId?: string;
  accionRequerida: boolean;
}

interface EquipoTabla {
  nombre: string;
  logo: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  pAdicionales?: number;
}

interface Resultado {
  equipoLocal: string;
  logoLocal: string;
  equipoVisitante: string;
  logoVisitante: string;
  golesLocal: number;
  golesVisitante: number;
  fecha: string;
}

interface Goleador {
  nombre: string;
  equipo: string;
  logoEquipo: string;
  goles: number;
}

const Organizador = () => {
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  const [mostrarFixtures, setMostrarFixtures] = useState(false);
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<Torneo | null>(null);
  const [torneoEditando, setTorneoEditando] = useState<string | null>(null);

  const [perfil, setPerfil] = useState({
    nombre: "Liga Municipal de Fútbol",
    logo: "https://images.unsplash.com/photo-1614632537190-23e4b93dc25e?w=100&h=100&fit=crop&crop=center",
    encargados: ["Carlos Rodríguez", "Ana Martínez"],
    email: "admin@ligamunicipal.com",
    telefono: "+57 300 123 4567"
  });

  const [torneos, setTorneos] = useState<Torneo[]>([
    {
      id: "TRN-001",
      nombre: "Copa Primavera 2024",
      categoria: "U20",
      tipo: "Completo",
      formato: "Grupos + Eliminatorio",
      fechaInicio: "2024-07-01",
      fechaFin: "2024-08-15",
      logo: "https://images.unsplash.com/photo-1614632537190-23e4b93dc25e?w=100&h=100&fit=crop&crop=center",
      maxEquipos: 12,
      equiposInscritos: 8,
      estado: "inscripciones_abiertas",
      fechaCierre: "2024-06-25",
      puntajeExtra: "Penales",
      idaVuelta: { grupos: true, eliminatoria: false },
      diasSemana: ["sabado", "domingo"],
      partidosPorSemana: "2",
      fechaCreacion: "2024-06-01"
    },
    {
      id: "TRN-002",
      nombre: "Liga Municipal Otoño",
      categoria: "Libre",
      tipo: "Eliminatorio",
      formato: "Eliminatorio Directo",
      fechaInicio: "2024-06-15",
      fechaFin: "2024-07-30",
      logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop&crop=center",
      maxEquipos: 16,
      equiposInscritos: 16,
      estado: "en_curso",
      fechaCierre: "2024-05-30",
      puntajeExtra: "N/A",
      idaVuelta: { grupos: false, eliminatoria: true },
      diasSemana: ["viernes", "sabado"],
      partidosPorSemana: "3",
      fechaCreacion: "2024-05-15"
    },
    {
      id: "TRN-003",
      nombre: "Torneo Relámpago Verano",
      categoria: "U17",
      tipo: "Relámpago",
      formato: "Todos contra Todos",
      fechaInicio: "2024-06-20",
      fechaFin: "2024-06-25",
      logo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop&crop=center",
      maxEquipos: 8,
      equiposInscritos: 8,
      estado: "inscripciones_cerradas",
      fechaCierre: "2024-06-10",
      puntajeExtra: "Shoot Outs",
      idaVuelta: { grupos: false, eliminatoria: false },
      diasSemana: ["domingo"],
      partidosPorSemana: "4",
      fechaCreacion: "2024-06-05"
    }
  ]);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    {
      id: "NOT-001",
      tipo: "inscripcion",
      titulo: "Nueva solicitud de inscripción",
      mensaje: "El equipo 'Águilas FC' ha solicitado inscribirse a Copa Primavera 2024",
      fecha: "2024-06-15",
      equipoSolicitante: "Águilas FC",
      torneoId: "TRN-001",
      accionRequerida: true
    },
    {
      id: "NOT-002",
      tipo: "reprogramacion",
      titulo: "Solicitud de reprogramación",
      mensaje: "El equipo 'Tigres SC' solicita reprogramar el partido del 20/06",
      fecha: "2024-06-14",
      equipoSolicitante: "Tigres SC",
      partidoId: "P001",
      accionRequerida: true
    }
  ]);

  // Datos demo para estadísticas con logos JPG
  const equiposTabla: EquipoTabla[] = [
    { nombre: "Águilas FC", logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center", pj: 6, pg: 4, pe: 1, pp: 1, gf: 12, gc: 6, dg: 6, pts: 13, pAdicionales: 2 },
    { nombre: "Tigres SC", logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop&crop=center", pj: 6, pg: 3, pe: 2, pp: 1, gf: 10, gc: 7, dg: 3, pts: 11, pAdicionales: 0 },
    { nombre: "Leones United", logo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center", pj: 6, pg: 3, pe: 1, pp: 2, gf: 9, gc: 8, dg: 1, pts: 10, pAdicionales: 1 },
    { nombre: "Pumas FC", logo: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=50&h=50&fit=crop&crop=center", pj: 6, pg: 2, pe: 2, pp: 2, gf: 8, gc: 9, dg: -1, pts: 8, pAdicionales: 0 }
  ];

  const resultados: Resultado[] = [
    { equipoLocal: "Águilas FC", logoLocal: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center", equipoVisitante: "Tigres SC", logoVisitante: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop&crop=center", golesLocal: 2, golesVisitante: 1, fecha: "2024-06-10" },
    { equipoLocal: "Leones United", logoLocal: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center", equipoVisitante: "Pumas FC", logoVisitante: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=50&h=50&fit=crop&crop=center", golesLocal: 1, golesVisitante: 1, fecha: "2024-06-12" }
  ];

  const goleadores: Goleador[] = [
    { nombre: "Carlos López", equipo: "Águilas FC", logoEquipo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center", goles: 8 },
    { nombre: "Miguel Torres", equipo: "Tigres SC", logoEquipo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop&crop=center", goles: 6 },
    { nombre: "Juan Pérez", equipo: "Leones United", logoEquipo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center", goles: 5 }
  ];

  const generarIdTorneo = () => {
    const numeroAleatorio = Math.floor(Math.random() * 900) + 100;
    return `TRN-${numeroAleatorio}`;
  };

  const handleCrearTorneo = (data: any) => {
    const nuevoTorneo: Torneo = {
      id: data.torneoId,
      nombre: data.nombreTorneo,
      categoria: data.categoria,
      tipo: data.tipoFutbol,
      formato: data.formato,
      fechaInicio: data.fechaInicio || "",
      fechaFin: data.fechaFin || "",
      logo: "https://images.unsplash.com/photo-1614632537190-23e4b93dc25e?w=100&h=100&fit=crop&crop=center",
      maxEquipos: data.maxEquipos || 16,
      equiposInscritos: 0,
      estado: "inscripciones_abiertas",
      fechaCierre: data.fechaCierre,
      puntajeExtra: data.puntajeExtra,
      idaVuelta: data.idaVuelta,
      diasSemana: data.diasSemana,
      partidosPorSemana: data.partidosPorSemana,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    setTorneos(prev => [...prev, nuevoTorneo]);
    toast.success("Torneo creado exitosamente");
  };

  const handleEditarTorneo = (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo) return;

    // Permitir edición si las inscripciones están abiertas o cerradas, pero no si ya comenzó
    if (torneo.estado === "en_curso" || torneo.estado === "finalizado") {
      toast.error("No se puede editar un torneo que ya ha iniciado o finalizado");
      return;
    }

    setTorneoEditando(torneoId);
    setMostrarFormulario(true);
  };

  const torneoParaEditar = torneoEditando ? torneos.find(t => t.id === torneoEditando) : null;

  // Generar datos específicos por torneo para las estadísticas
  const generarDatosPorTorneo = (torneo: Torneo) => {
    // Simular datos específicos del torneo basados en su ID
    const factor = parseInt(torneo.id.split('-')[1]) || 1;
    
    const equiposTorneo = equiposTabla.map((equipo, index) => ({
      ...equipo,
      pts: equipo.pts + (factor % 3) + index,
      gf: equipo.gf + (factor % 5),
      gc: equipo.gc + (factor % 4)
    })).sort((a, b) => b.pts - a.pts);

    const resultadosTorneo = resultados.filter((_, index) => index < (factor % 3) + 1);
    
    const goleadoresTorneo = goleadores.map((goleador, index) => ({
      ...goleador,
      goles: goleador.goles + (factor % 4) + index
    })).sort((a, b) => b.goles - a.goles);

    return { equiposTorneo, resultadosTorneo, goleadoresTorneo };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                ← Volver
              </Button>
              <div className="flex items-center gap-3">
                <img 
                  src={perfil.logo} 
                  alt={perfil.nombre}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-primary">🏆 Panel del Organizador</h1>
                  <p className="text-sm text-muted-foreground">Gestiona tus torneos y equipos</p>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setTorneoEditando(null);
                    setMostrarFormulario(true);
                  }}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Crear Torneo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setMostrarDashboard(true)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard General
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Reportes
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Programar Partido
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Torneos Activos</span>
                  <span className="font-medium">{torneos.filter(t => t.estado === "en_curso").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Equipos Inscritos</span>
                  <span className="font-medium">{torneos.reduce((acc, t) => acc + t.equiposInscritos, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Notificaciones</span>
                  <span className="font-medium">{notificaciones.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <Tabs defaultValue="torneos" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="torneos">Torneos</TabsTrigger>
                <TabsTrigger value="equipos">Equipos</TabsTrigger>
                <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
                <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
              </TabsList>

              <TabsContent value="torneos">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Mis Torneos</h2>
                    <Button onClick={() => {
                      setTorneoEditando(null);
                      setMostrarFormulario(true);
                    }}>
                      <Trophy className="w-4 h-4 mr-2" />
                      Nuevo Torneo
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {torneos.map((torneo) => (
                      <Card key={torneo.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <img 
                                src={torneo.logo} 
                                alt={torneo.nombre}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <CardTitle className="text-lg">{torneo.nombre}</CardTitle>
                                <p className="text-sm text-muted-foreground">{torneo.categoria}</p>
                              </div>
                            </div>
                            {(torneo.estado === "inscripciones_abiertas" || torneo.estado === "inscripciones_cerradas") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditarTorneo(torneo.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Equipos:</span>
                            <span>{torneo.equiposInscritos}/{torneo.maxEquipos}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Formato:</span>
                            <span>{torneo.formato}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant={
                              torneo.estado === "en_curso" ? "default" :
                              torneo.estado === "inscripciones_abiertas" ? "secondary" :
                              torneo.estado === "finalizado" ? "outline" : "destructive"
                            }>
                              {torneo.estado.replace("_", " ")}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setTorneoSeleccionado(torneo);
                                setMostrarEstadisticas(true);
                              }}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="equipos">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Equipos Registrados</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {equiposTabla.map((equipo, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <img 
                              src={equipo.logo} 
                              alt={equipo.nombre}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <CardTitle className="text-lg">{equipo.nombre}</CardTitle>
                              <p className="text-sm text-muted-foreground">{equipo.pts} puntos</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 text-center text-sm">
                            <div>
                              <p className="font-medium">{equipo.pj}</p>
                              <p className="text-muted-foreground">PJ</p>
                            </div>
                            <div>
                              <p className="font-medium">{equipo.gf}</p>
                              <p className="text-muted-foreground">GF</p>
                            </div>
                            <div>
                              <p className="font-medium">{equipo.gc}</p>
                              <p className="text-muted-foreground">GC</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="estadisticas">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Estadísticas Generales</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tabla de Posiciones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {equiposTabla.slice(0, 4).map((equipo, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <img 
                                  src={equipo.logo} 
                                  alt={equipo.nombre}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <span className="font-medium">{equipo.nombre}</span>
                              </div>
                              <span className="font-bold">{equipo.pts}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Goleadores</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {goleadores.map((goleador, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <img 
                                  src={goleador.logoEquipo} 
                                  alt={goleador.equipo}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <div>
                                  <p className="font-medium">{goleador.nombre}</p>
                                  <p className="text-xs text-muted-foreground">{goleador.equipo}</p>
                                </div>
                              </div>
                              <span className="font-bold">{goleador.goles}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Últimos Resultados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {resultados.map((resultado, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <img 
                                src={resultado.logoLocal} 
                                alt={resultado.equipoLocal}
                                className="w-8 h-8 rounded object-cover"
                              />
                              <span className="font-medium">{resultado.equipoLocal}</span>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {resultado.golesLocal} - {resultado.golesVisitante}
                              </div>
                              <div className="text-xs text-muted-foreground">{resultado.fecha}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{resultado.equipoVisitante}</span>
                              <img 
                                src={resultado.logoVisitante} 
                                alt={resultado.equipoVisitante}
                                className="w-8 h-8 rounded object-cover"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="fixtures">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Fixtures y Calendario</h2>
                  <Card>
                    <CardHeader>
                      <CardTitle>Próximos Partidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">No hay partidos programados.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TorneoFormModal
        open={mostrarFormulario}
        onClose={() => {
          setMostrarFormulario(false);
          setTorneoEditando(null);
        }}
        onSubmit={handleCrearTorneo}
        torneoId={generarIdTorneo()}
        torneoEditando={torneoParaEditar}
      />

      {/* Tournament-specific statistics modal */}
      <Dialog open={mostrarEstadisticas} onOpenChange={setMostrarEstadisticas}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Estadísticas del Torneo</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            {torneoSeleccionado && (
              <TorneoEstadisticas
                torneo={torneoSeleccionado}
                {...generarDatosPorTorneo(torneoSeleccionado)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* General dashboard modal */}
      <Dialog open={mostrarDashboard} onOpenChange={setMostrarDashboard}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Dashboard General - Reporte de Torneos</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            <OrganizadorDashboard torneos={torneos} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Perfil Modal */}
      <Dialog open={mostrarPerfil} onOpenChange={setMostrarPerfil}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Perfil del Organizador</DialogTitle>
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

      {/* Notificaciones Modal */}
      <Dialog open={mostrarNotificaciones} onOpenChange={setMostrarNotificaciones}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notificaciones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {notificaciones.map((notif) => (
              <div key={notif.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">{notif.titulo}</h4>
                  <Badge variant={notif.accionRequerida ? "destructive" : "secondary"}>
                    {notif.accionRequerida ? "Acción requerida" : "Informativa"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{notif.mensaje}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{notif.fecha}</span>
                  <span>{notif.equipoSolicitante}</span>
                </div>
                {notif.accionRequerida && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button size="sm" variant="destructive">
                      <XCircle className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organizador;
