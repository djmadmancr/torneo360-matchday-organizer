import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Edit, Download, Calendar, BarChart3, Trophy, Bell, User, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TorneoFormModal from "@/components/TorneoFormModal";

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
  partidosPorSemana: number;
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
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<Torneo | null>(null);
  const [torneoEditando, setTorneoEditando] = useState<string | null>(null);

  const [perfil, setPerfil] = useState<PerfilOrganizador>({
    nombre: "Liga Municipal de Fútbol",
    logo: "https://images.unsplash.com/photo-1614632537190-23e4b93dc25e?w=100&h=100&fit=crop&crop=center",
    encargados: ["Carlos Rodríguez", "Ana Martínez"],
    email: "info@ligamunicipal.com",
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
      partidosPorSemana: 2,
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
      partidosPorSemana: 3,
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
      partidosPorSemana: 4,
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

  const crearTorneo = (datosTorneo: any) => {
    const nuevoTorneo: Torneo = {
      id: 'TRN-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      ...datosTorneo,
      equiposInscritos: 0,
      estado: "inscripciones_abiertas" as const,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    if (torneoEditando) {
      setTorneos(torneos.map(t => t.id === torneoEditando ? { ...nuevoTorneo, id: torneoEditando } : t));
      toast.success("Torneo actualizado exitosamente!");
      setTorneoEditando(null);
    } else {
      setTorneos([...torneos, nuevoTorneo]);
      toast.success("¡Torneo creado exitosamente! ID: " + nuevoTorneo.id);
    }

    setMostrarFormulario(false);
  };

  const editarTorneo = (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo) return;

    if (torneo.estado === "en_curso" || torneo.estado === "finalizado") {
      toast.error("No se puede editar un torneo que ya ha iniciado o finalizado");
      return;
    }

    setTorneoEditando(torneoId);
    setMostrarFormulario(true);
  };

  const cerrarInscripciones = (torneoId: string) => {
    setTorneos(torneos.map(torneo => 
      torneo.id === torneoId 
        ? { ...torneo, estado: "inscripciones_cerradas" as const }
        : torneo
    ));
    toast.success("Inscripciones cerradas. Ya se puede generar el sorteo.");
  };

  const iniciarTorneo = (torneoId: string) => {
    setTorneos(torneos.map(torneo => 
      torneo.id === torneoId 
        ? { ...torneo, estado: "en_curso" as const }
        : torneo
    ));
    toast.success("¡Torneo iniciado! Los fixtures han sido generados.");
  };

  const verEstadisticas = (torneo: Torneo) => {
    setTorneoSeleccionado(torneo);
    setMostrarEstadisticas(true);
  };

  const verFixtures = (torneo: Torneo) => {
    setTorneoSeleccionado(torneo);
    setMostrarFixtures(true);
  };

  const descargarFixtures = (tipo: "grupos" | "eliminatoria") => {
    // Simular descarga
    toast.success(`Descargando fixtures de ${tipo}...`);
    
    // Crear un canvas para generar la imagen
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Fondo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 600);
      
      // Título
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`Fixtures - ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`, 50, 50);
      
      if (torneoSeleccionado) {
        ctx.font = '18px Arial';
        ctx.fillText(torneoSeleccionado.nombre, 50, 80);
      }
      
      if (tipo === "grupos") {
        // Dibujar grupos
        ctx.font = '16px Arial';
        ctx.fillText('Grupo A', 50, 120);
        ctx.fillText('Águilas FC vs Tigres SC', 70, 150);
        ctx.fillText('Leones United vs Pumas FC', 70, 180);
        
        ctx.fillText('Grupo B', 400, 120);
        ctx.fillText('Halcones FC vs Lobos SC', 420, 150);
        ctx.fillText('Serpientes FC vs Osos FC', 420, 180);
      } else {
        // Dibujar llave eliminatoria
        ctx.font = '16px Arial';
        ctx.fillText('Cuartos de Final', 50, 120);
        ctx.fillText('1° Grupo A vs 2° Grupo B', 70, 150);
        ctx.fillText('1° Grupo B vs 2° Grupo A', 70, 180);
        
        ctx.fillText('Semifinal', 50, 250);
        ctx.fillText('Ganador QF1 vs Ganador QF2', 70, 280);
        
        ctx.fillText('Final', 50, 350);
        ctx.fillText('Ganador SF1 vs Ganador SF2', 70, 380);
      }
      
      // Convertir a imagen y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `fixtures_${tipo}_${torneoSeleccionado?.nombre || 'torneo'}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  const aprobarNotificacion = (notificacionId: string) => {
    setNotificaciones(notificaciones.filter(n => n.id !== notificacionId));
    toast.success("Solicitud aprobada");
  };

  const rechazarNotificacion = (notificacionId: string) => {
    setNotificaciones(notificaciones.filter(n => n.id !== notificacionId));
    toast.success("Solicitud rechazada");
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "inscripciones_abiertas":
        return <Badge className="bg-green-500">Inscripciones Abiertas</Badge>;
      case "inscripciones_cerradas":
        return <Badge className="bg-yellow-500">Inscripciones Cerradas</Badge>;
      case "en_curso":
        return <Badge className="bg-blue-500">En Curso</Badge>;
      case "finalizado":
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
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
                  <h1 className="text-xl md:text-2xl font-bold text-primary">🔵 Panel del Organizador</h1>
                  <p className="text-sm text-muted-foreground">Gestiona tus torneos y competencias</p>
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
        <Tabs defaultValue="torneos" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-1 text-xs md:text-sm">
            <TabsTrigger value="torneos">Gestión de Torneos</TabsTrigger>
          </TabsList>

          <TabsContent value="torneos">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold">Mis Torneos</h2>
                <Button 
                  onClick={() => setMostrarFormulario(true)}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Torneo
                </Button>
              </div>

              <div className="grid gap-6">
                {torneos.map((torneo) => (
                  <Card key={torneo.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-lg">{torneo.nombre}</CardTitle>
                          <p className="text-sm text-muted-foreground">ID: {torneo.id}</p>
                        </div>
                        {getEstadoBadge(torneo.estado)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div><span className="font-medium">Categoría:</span> {torneo.categoria}</div>
                          <div><span className="font-medium">Tipo:</span> {torneo.tipo}</div>
                          <div><span className="font-medium">Equipos:</span> {torneo.equiposInscritos}/{torneo.maxEquipos}</div>
                          <div><span className="font-medium">Cierre:</span> {torneo.fechaCierre}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div><span className="font-medium">Puntaje extra:</span> {torneo.puntajeExtra}</div>
                          <div><span className="font-medium">Ida y vuelta:</span> 
                            {torneo.idaVuelta.grupos && torneo.idaVuelta.eliminatoria ? "Grupos y Eliminatoria" :
                             torneo.idaVuelta.grupos ? "Solo Grupos" :
                             torneo.idaVuelta.eliminatoria ? "Solo Eliminatoria" : "No"}
                          </div>
                          <div><span className="font-medium">Días:</span> {torneo.diasSemana.join(", ")}</div>
                          <div><span className="font-medium">Partidos/semana:</span> {torneo.partidosPorSemana}</div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {torneo.estado === "inscripciones_abiertas" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => editarTorneo(torneo.id)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="w-4 h-4" />
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => cerrarInscripciones(torneo.id)}
                                className="flex items-center gap-1"
                              >
                                <Calendar className="w-4 h-4" />
                                Cerrar Inscripciones
                              </Button>
                            </>
                          )}
                          
                          {torneo.estado === "inscripciones_cerradas" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => iniciarTorneo(torneo.id)}
                                className="flex items-center gap-1"
                              >
                                <Trophy className="w-4 h-4" />
                                Iniciar Torneo
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => verFixtures(torneo)}
                                className="flex items-center gap-1"
                              >
                                <Calendar className="w-4 h-4" />
                                Fixtures
                              </Button>
                            </>
                          )}
                          
                          {(torneo.estado === "en_curso" || torneo.estado === "finalizado") && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => verEstadisticas(torneo)}
                                className="flex items-center gap-1"
                              >
                                <BarChart3 className="w-4 h-4" />
                                Estadísticas
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => verFixtures(torneo)}
                                className="flex items-center gap-1"
                              >
                                <Calendar className="w-4 h-4" />
                                Fixtures
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal del perfil del organizador */}
      <Dialog open={mostrarPerfil} onOpenChange={setMostrarPerfil}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil del Organizador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <img 
                src={perfil.logo} 
                alt={perfil.nombre}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
              />
              <h3 className="text-xl font-bold">{perfil.nombre}</h3>
            </div>

            <div className="space-y-2">
              <Label>Nombre de la organización</Label>
              <Input
                value={perfil.nombre}
                onChange={(e) => setPerfil({...perfil, nombre: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo (URL de imagen)</Label>
              <Input
                value={perfil.logo}
                onChange={(e) => setPerfil({...perfil, logo: e.target.value})}
                placeholder="https://ejemplo.com/logo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={perfil.email}
                onChange={(e) => setPerfil({...perfil, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={perfil.telefono}
                onChange={(e) => setPerfil({...perfil, telefono: e.target.value})}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Torneos Gestionados</h4>
              <p className="text-sm text-muted-foreground">
                Total: {torneos.length} torneos
              </p>
              <p className="text-sm text-muted-foreground">
                Activos: {torneos.filter(t => t.estado === "en_curso").length}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de notificaciones */}
      <Dialog open={mostrarNotificaciones} onOpenChange={setMostrarNotificaciones}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notificaciones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {notificaciones.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay notificaciones pendientes
              </p>
            ) : (
              notificaciones.map((notificacion) => (
                <div key={notificacion.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{notificacion.titulo}</h4>
                    <Badge variant="outline">{notificacion.tipo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {notificacion.mensaje}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {notificacion.fecha}
                    </span>
                    {notificacion.accionRequerida && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => aprobarNotificacion(notificacion.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rechazarNotificacion(notificacion.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de estadísticas */}
      <Dialog open={mostrarEstadisticas} onOpenChange={setMostrarEstadisticas}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estadísticas del Torneo</DialogTitle>
          </DialogHeader>
          
          {torneoSeleccionado && (
            <div className="space-y-6">
              {/* Información general del torneo */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{torneoSeleccionado.nombre}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="font-medium">Categoría:</span> {torneoSeleccionado.categoria}</div>
                  <div><span className="font-medium">Tipo:</span> {torneoSeleccionado.tipo}</div>
                  <div><span className="font-medium">Puntaje extra:</span> {torneoSeleccionado.puntajeExtra}</div>
                  <div><span className="font-medium">Equipos:</span> {torneoSeleccionado.equiposInscritos}</div>
                </div>
              </div>

              <Tabs defaultValue="tabla" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tabla">Tabla General</TabsTrigger>
                  <TabsTrigger value="resultados">Resultados</TabsTrigger>
                  <TabsTrigger value="goleo">Goleo</TabsTrigger>
                </TabsList>

                <TabsContent value="tabla">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-200 p-2 text-left">Pos</th>
                          <th className="border border-gray-200 p-2 text-left">Equipo</th>
                          <th className="border border-gray-200 p-2 text-center">PJ</th>
                          <th className="border border-gray-200 p-2 text-center">PG</th>
                          <th className="border border-gray-200 p-2 text-center">PE</th>
                          <th className="border border-gray-200 p-2 text-center">PP</th>
                          <th className="border border-gray-200 p-2 text-center">GF</th>
                          <th className="border border-gray-200 p-2 text-center">GC</th>
                          <th className="border border-gray-200 p-2 text-center">DG</th>
                          {torneoSeleccionado.puntajeExtra !== "N/A" && (
                            <th className="border border-gray-200 p-2 text-center">P+</th>
                          )}
                          <th className="border border-gray-200 p-2 text-center">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equiposTabla.map((equipo, index) => (
                          <tr key={equipo.nombre} className="hover:bg-gray-50">
                            <td className="border border-gray-200 p-2 text-center font-bold">{index + 1}</td>
                            <td className="border border-gray-200 p-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{equipo.logo}</span>
                                <span className="font-medium">{equipo.nombre}</span>
                              </div>
                            </td>
                            <td className="border border-gray-200 p-2 text-center">{equipo.pj}</td>
                            <td className="border border-gray-200 p-2 text-center">{equipo.pg}</td>
                            <td className="border border-gray-200 p-2 text-center">{equipo.pe}</td>
                            <td className="border border-gray-200 p-2 text-center">{equipo.pp}</td>
                            <td className="border border-gray-200 p-2 text-center">{equipo.gf}</td>
                            <td className="border border-gray-200 p-2 text-center">{equipo.gc}</td>
                            <td className="border border-gray-200 p-2 text-center">{equipo.dg}</td>
                            {torneoSeleccionado.puntajeExtra !== "N/A" && (
                              <td className="border border-gray-200 p-2 text-center">{equipo.pAdicionales || 0}</td>
                            )}
                            <td className="border border-gray-200 p-2 text-center font-bold">{equipo.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="resultados">
                  <div className="space-y-4">
                    {resultados.map((resultado, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center flex-1">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="text-2xl">{resultado.logoLocal}</span>
                              <span className="font-semibold">{resultado.equipoLocal}</span>
                            </div>
                          </div>
                          
                          <div className="text-center px-4">
                            <div className="text-2xl font-bold">
                              {resultado.golesLocal} - {resultado.golesVisitante}
                            </div>
                            <div className="text-sm text-muted-foreground">{resultado.fecha}</div>
                          </div>
                          
                          <div className="text-center flex-1">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="font-semibold">{resultado.equipoVisitante}</span>
                              <span className="text-2xl">{resultado.logoVisitante}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="goleo">
                  <div className="space-y-4">
                    {goleadores.map((goleador, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">{index + 1}</span>
                          <span className="text-xl">{goleador.logoEquipo}</span>
                          <div>
                            <p className="font-semibold">{goleador.nombre}</p>
                            <p className="text-sm text-muted-foreground">{goleador.equipo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{goleador.goles}</p>
                          <p className="text-sm text-muted-foreground">goles</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de fixtures */}
      <Dialog open={mostrarFixtures} onOpenChange={setMostrarFixtures}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fixtures del Torneo</DialogTitle>
          </DialogHeader>
          
          {torneoSeleccionado && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{torneoSeleccionado.nombre}</h3>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => descargarFixtures("grupos")}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Fase de Grupos
                  </Button>
                  <Button 
                    onClick={() => descargarFixtures("eliminatoria")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Eliminatoria
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="grupos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="grupos">Fase de Grupos</TabsTrigger>
                  <TabsTrigger value="eliminatoria">Llave Eliminatoria</TabsTrigger>
                </TabsList>

                <TabsContent value="grupos">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Grupo A</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>🦅</span>
                            <span>Águilas FC</span>
                          </div>
                          <span className="text-sm">vs</span>
                          <div className="flex items-center gap-2">
                            <span>Tigres SC</span>
                            <span>🐅</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>🦁</span>
                            <span>Leones United</span>
                          </div>
                          <span className="text-sm">vs</span>
                          <div className="flex items-center gap-2">
                            <span>Pumas FC</span>
                            <span>🐆</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Grupo B</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>🦅</span>
                            <span>Halcones FC</span>
                          </div>
                          <span className="text-sm">vs</span>
                          <div className="flex items-center gap-2">
                            <span>Lobos SC</span>
                            <span>🐺</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>🐍</span>
                            <span>Serpientes FC</span>
                          </div>
                          <span className="text-sm">vs</span>
                          <div className="flex items-center gap-2">
                            <span>Osos FC</span>
                            <span>🐻</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="eliminatoria">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Cuartos de Final</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg text-center">
                          <p className="text-sm text-muted-foreground mb-2">QF1</p>
                          <p>1° Grupo A vs 2° Grupo B</p>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                          <p className="text-sm text-muted-foreground mb-2">QF2</p>
                          <p>1° Grupo B vs 2° Grupo A</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Semifinal</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg text-center">
                          <p className="text-sm text-muted-foreground mb-2">SF1</p>
                          <p>Ganador QF1 vs Ganador QF2</p>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                          <p className="text-sm text-muted-foreground mb-2">SF2</p>
                          <p>Ganador QF3 vs Ganador QF4</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Final</h4>
                      <div className="p-6 border rounded-lg text-center bg-yellow-50">
                        <p className="text-sm text-muted-foreground mb-2">FINAL</p>
                        <p className="text-lg font-semibold">Ganador SF1 vs Ganador SF2</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TorneoFormModal 
        open={mostrarFormulario}
        onClose={() => {
          setMostrarFormulario(false);
          setTorneoEditando(null);
        }}
        onSubmit={crearTorneo}
        torneoEditando={torneoEditando ? torneos.find(t => t.id === torneoEditando) : null}
      />
    </div>
  );
};

export default Organizador;
