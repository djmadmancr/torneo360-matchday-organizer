
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Edit, X, BarChart3, Calendar, User, Bell, Upload, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TorneoFormModal from "@/components/TorneoFormModal";

interface Torneo {
  id: string;
  nombre: string;
  tipoFutbol: string;
  formato: string;
  categoria: string;
  fechaCierre: string;
  estado: "inscripciones_abiertas" | "inscripciones_cerradas" | "en_curso" | "finalizado";
  equiposInscritos: number;
  numeroGrupos?: number;
  idaVuelta?: {
    grupos: boolean;
    eliminatoria: boolean;
  };
  puntajeExtra?: string;
  diasSemana?: string[];
  partidosPorSemana?: string;
}

interface Partido {
  id: string;
  equipoLocal: string;
  equipoVisitante: string;
  fecha: string;
  hora: string;
  cancha: string;
  logoLocal: string;
  logoVisitante: string;
  grupo?: string;
  fase: "grupos" | "eliminatoria";
}

interface Notificacion {
  id: number;
  tipo: "inscripcion" | "reprogramacion" | "general";
  mensaje: string;
  fecha: string;
  torneoId?: string;
  equipoId?: string;
}

const Organizador = () => {
  const navigate = useNavigate();
  const [torneos, setTorneos] = useState<Torneo[]>([
    {
      id: "TRN-ABC12345",
      nombre: "Copa Primavera 2024",
      tipoFutbol: "futbol5",
      formato: "completo",
      categoria: "U20",
      fechaCierre: "2024-06-25",
      estado: "en_curso",
      equiposInscritos: 8,
      numeroGrupos: 2,
      idaVuelta: { grupos: true, eliminatoria: false },
      puntajeExtra: "penales",
      diasSemana: ["Martes", "Jueves", "Sábado"],
      partidosPorSemana: "2"
    },
    {
      id: "TRN-DEF67890",
      nombre: "Liga Municipal Otoño",
      tipoFutbol: "futbol7",
      formato: "eliminatorio",
      categoria: "Libre",
      fechaCierre: "2024-07-15",
      estado: "inscripciones_abiertas",
      equiposInscritos: 12,
      numeroGrupos: 1,
      idaVuelta: { grupos: false, eliminatoria: true },
      puntajeExtra: "shootouts",
      diasSemana: ["Sábado", "Domingo"],
      partidosPorSemana: "3"
    },
    {
      id: "TRN-GHI11111",
      nombre: "Torneo Relámpago Verano",
      tipoFutbol: "futbol5",
      formato: "relampago",
      categoria: "U17",
      fechaCierre: "2024-08-01",
      estado: "finalizado",
      equiposInscritos: 6,
      numeroGrupos: 1,
      idaVuelta: { grupos: false, eliminatoria: false },
      puntajeExtra: "NA",
      diasSemana: ["Sábado"],
      partidosPorSemana: "4"
    }
  ]);

  const [torneoId] = useState(() => {
    return 'TRN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState<string | null>(null);
  const [mostrarFixtures, setMostrarFixtures] = useState<string | null>(null);
  const [mostrarPerfilModal, setMostrarPerfilModal] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [torneoEstadisticas, setTorneoEstadisticas] = useState<Torneo | null>(null);
  const [fixturesGenerados, setFixturesGenerados] = useState<Partido[]>([]);
  
  // Perfil del organizador
  const [perfilOrganizador, setPerfilOrganizador] = useState({
    nombre: "Juan Carlos Pérez",
    encargados: "María García, Carlos López, Ana Martínez",
    logo: null as File | null,
  });

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    { 
      id: 1, 
      tipo: "inscripcion", 
      mensaje: "Águilas FC solicita inscribirse al torneo Copa Primavera 2024", 
      fecha: "2024-06-15",
      torneoId: "TRN-ABC12345",
      equipoId: "EQP-001"
    },
    { 
      id: 2, 
      tipo: "reprogramacion", 
      mensaje: "Tigres SC solicita reprogramar partido vs Leones United del 20/06", 
      fecha: "2024-06-14",
      torneoId: "TRN-ABC12345"
    },
    { 
      id: 3, 
      tipo: "inscripcion", 
      mensaje: "Pumas FC solicita inscribirse al torneo Liga Municipal Otoño", 
      fecha: "2024-06-13",
      torneoId: "TRN-DEF67890",
      equipoId: "EQP-002"
    }
  ]);

  const estadisticasTorneo = {
    goleadores: [
      { nombre: "Carlos Mendez", equipo: "Águilas FC", goles: 8, logo: "🦅" },
      { nombre: "Luis García", equipo: "Tigres SC", goles: 6, logo: "🐅" },
      { nombre: "Pedro Ruiz", equipo: "Leones United", goles: 5, logo: "🦁" }
    ],
    resultados: [
      { partido: "Águilas FC vs Tigres SC", resultado: "2-1", fecha: "2024-06-15", logoLocal: "🦅", logoVisitante: "🐅" },
      { partido: "Leones United vs Pumas FC", resultado: "0-3", fecha: "2024-06-15", logoLocal: "🦁", logoVisitante: "🐆" },
      { partido: "Águilas FC vs Pumas FC", resultado: "1-1", fecha: "2024-06-16", logoLocal: "🦅", logoVisitante: "🐆" }
    ],
    tablaGrupos: [
      { posicion: 1, equipo: "Águilas FC", puntos: 10, pj: 4, pg: 3, pe: 1, pp: 0, gf: 8, gc: 3, dif: 5, logo: "🦅", puntosExtra: 2 },
      { posicion: 2, equipo: "Tigres SC", puntos: 7, pj: 4, pg: 2, pe: 1, pp: 1, gf: 6, gc: 4, dif: 2, logo: "🐅", puntosExtra: 1 },
      { posicion: 3, equipo: "Pumas FC", puntos: 6, pj: 4, pg: 2, pe: 0, pp: 2, gf: 5, gc: 5, dif: 0, logo: "🐆", puntosExtra: 0 },
      { posicion: 4, equipo: "Leones United", puntos: 1, pj: 4, pg: 0, pe: 1, pp: 3, gf: 2, gc: 9, dif: -7, logo: "🦁", puntosExtra: 0 }
    ]
  };

  const handleSubmit = (formData: any) => {
    const nuevoTorneo: Torneo = {
      id: formData.torneoId,
      nombre: formData.nombreTorneo,
      tipoFutbol: formData.tipoFutbol,
      formato: formData.formato,
      categoria: formData.categoria,
      fechaCierre: formData.fechaCierre,
      estado: "inscripciones_abiertas",
      equiposInscritos: 0,
      numeroGrupos: parseInt(formData.numeroGrupos),
      idaVuelta: formData.idaVuelta,
      puntajeExtra: formData.puntajeExtra,
      diasSemana: formData.diasSemana,
      partidosPorSemana: formData.partidosPorSemana
    };

    setTorneos([nuevoTorneo, ...torneos]);
    console.log("Datos del torneo:", formData);
    toast.success("¡Torneo creado exitosamente! ID: " + formData.torneoId);
  };

  const cerrarInscripciones = (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo) return;

    if (!torneo.numeroGrupos || torneo.numeroGrupos < 1) {
      toast.error("Debe configurar el número de grupos antes de cerrar inscripciones");
      return;
    }

    if (!torneo.diasSemana || torneo.diasSemana.length === 0) {
      toast.error("Debe configurar los días de la semana para los partidos");
      return;
    }

    setTorneos(torneos.map(t => 
      t.id === torneoId 
        ? { ...t, estado: "en_curso" as const }
        : t
    ));
    toast.success("Inscripciones cerradas. ¡Generando fixtures y iniciando torneo!");
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

  const verEstadisticas = (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (torneo) {
      setTorneoEstadisticas(torneo);
      setMostrarEstadisticas(torneoId);
    }
  };

  const verFixtures = (torneoId: string) => {
    const equiposEjemplo = ["Águilas FC", "Tigres SC", "Leones United", "Pumas FC", "Lobos FC", "Halcones United", "Jaguares SC", "Panteras FC"];
    const fixtures: Partido[] = [];
    
    // Generar partidos de grupos
    const equiposPorGrupo = Math.ceil(equiposEjemplo.length / 2);
    const grupoA = equiposEjemplo.slice(0, equiposPorGrupo);
    const grupoB = equiposEjemplo.slice(equiposPorGrupo);
    
    // Partidos Grupo A
    for (let i = 0; i < grupoA.length; i++) {
      for (let j = i + 1; j < grupoA.length; j++) {
        fixtures.push({
          id: `GA${i}${j}`,
          equipoLocal: grupoA[i],
          equipoVisitante: grupoA[j],
          fecha: `2024-06-${15 + fixtures.length}`,
          hora: `${15 + (fixtures.length % 3)}:00`,
          cancha: `Cancha ${(fixtures.length % 3) + 1}`,
          logoLocal: ["🦅", "🐅", "🦁", "🐆"][i % 4],
          logoVisitante: ["🦅", "🐅", "🦁", "🐆"][j % 4],
          grupo: "A",
          fase: "grupos"
        });
      }
    }
    
    // Partidos Grupo B
    for (let i = 0; i < grupoB.length; i++) {
      for (let j = i + 1; j < grupoB.length; j++) {
        fixtures.push({
          id: `GB${i}${j}`,
          equipoLocal: grupoB[i],
          equipoVisitante: grupoB[j],
          fecha: `2024-06-${15 + fixtures.length}`,
          hora: `${15 + (fixtures.length % 3)}:00`,
          cancha: `Cancha ${(fixtures.length % 3) + 1}`,
          logoLocal: ["🐺", "🦅", "🐅", "🐆"][i % 4],
          logoVisitante: ["🐺", "🦅", "🐅", "🐆"][j % 4],
          grupo: "B",
          fase: "grupos"
        });
      }
    }

    // Agregar partidos de eliminatoria simulados
    fixtures.push(
      {
        id: "SF1",
        equipoLocal: "1° Grupo A",
        equipoVisitante: "2° Grupo B",
        fecha: "2024-07-01",
        hora: "16:00",
        cancha: "Cancha Principal",
        logoLocal: "🥇",
        logoVisitante: "🥈",
        fase: "eliminatoria"
      },
      {
        id: "SF2",
        equipoLocal: "1° Grupo B", 
        equipoVisitante: "2° Grupo A",
        fecha: "2024-07-01",
        hora: "18:00",
        cancha: "Cancha Principal",
        logoLocal: "🥇",
        logoVisitante: "🥈",
        fase: "eliminatoria"
      },
      {
        id: "FINAL",
        equipoLocal: "Ganador SF1",
        equipoVisitante: "Ganador SF2",
        fecha: "2024-07-05",
        hora: "19:00",
        cancha: "Cancha Principal",
        logoLocal: "🏆",
        logoVisitante: "🏆",
        fase: "eliminatoria"
      }
    );
    
    setFixturesGenerados(fixtures);
    setMostrarFixtures(torneoId);
    toast.success("Fixtures generados y sorteo realizado!");
  };

  const cerrarEstadisticas = () => {
    setMostrarEstadisticas(null);
    setTorneoEstadisticas(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPerfilOrganizador({ ...perfilOrganizador, logo: file });
      toast.success("Logo cargado exitosamente");
    }
  };

  const getPuntajeExtraLabel = (puntajeExtra?: string) => {
    switch (puntajeExtra) {
      case "NA": return "N/A";
      case "penales": return "Penales";
      case "shootouts": return "Rondas de Shoot Outs";
      case "otros": return "Otros";
      default: return "N/A";
    }
  };

  const getFormatoLabel = (formato: string) => {
    switch (formato) {
      case "completo": return "Completo (Grupos + Eliminatoria)";
      case "eliminatorio": return "Eliminatorio (Llaves de muerte súbita)";
      case "relampago": return "Relámpago";
      default: return formato;
    }
  };

  const manejarNotificacion = (notifId: number, accion: "aprobar" | "rechazar") => {
    const notif = notificaciones.find(n => n.id === notifId);
    if (notif) {
      if (accion === "aprobar") {
        toast.success(`Solicitud aprobada: ${notif.mensaje.substring(0, 50)}...`);
      } else {
        toast.success(`Solicitud rechazada: ${notif.mensaje.substring(0, 50)}...`);
      }
      setNotificaciones(notificaciones.filter(n => n.id !== notifId));
    }
  };

  const descargarFixtures = (tipo: "grupos" | "eliminatoria") => {
    toast.success(`Descargando fixtures de ${tipo === "grupos" ? "fase de grupos" : "eliminatoria"} como imagen...`);
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
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-primary">🔵 Panel de Organizador</h1>
                <p className="text-sm text-muted-foreground">Crea y gestiona tus torneos</p>
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
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
                    {notificaciones.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarPerfilModal(true)}
                className="flex items-center gap-2"
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold">Mis Torneos</h2>
            <Button 
              onClick={() => setMostrarFormulario(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Nuevo Torneo
            </Button>
          </div>

          {torneos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No has creado ningún torneo aún</p>
                <Button 
                  onClick={() => setMostrarFormulario(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Crear mi primer torneo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {torneos.map((torneo) => (
                <Card key={torneo.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-lg md:text-xl">{torneo.nombre}</CardTitle>
                        <p className="text-sm text-muted-foreground">ID: {torneo.id}</p>
                      </div>
                      {getEstadoBadge(torneo.estado)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div><span className="font-medium">Tipo:</span> {torneo.tipoFutbol}</div>
                      <div><span className="font-medium">Formato:</span> {getFormatoLabel(torneo.formato)}</div>
                      <div><span className="font-medium">Categoría:</span> {torneo.categoria}</div>
                      <div><span className="font-medium">Cierre inscripciones:</span> {torneo.fechaCierre}</div>
                      <div><span className="font-medium">Equipos:</span> {torneo.equiposInscritos}</div>
                      {torneo.numeroGrupos && (
                        <div><span className="font-medium">Grupos:</span> {torneo.numeroGrupos}</div>
                      )}
                      <div><span className="font-medium">Puntaje extra:</span> {getPuntajeExtraLabel(torneo.puntajeExtra)}</div>
                      {torneo.diasSemana && (
                        <div><span className="font-medium">Días:</span> {torneo.diasSemana.join(", ")}</div>
                      )}
                      {torneo.partidosPorSemana && (
                        <div><span className="font-medium">Partidos/semana:</span> {torneo.partidosPorSemana}</div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        disabled={torneo.estado === "en_curso" || torneo.estado === "finalizado"}
                      >
                        <Edit className="w-3 h-3" />
                        Editar Torneo
                      </Button>
                      
                      {(torneo.estado === "en_curso" || torneo.estado === "finalizado") && (
                        <>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => verEstadisticas(torneo.id)}
                          >
                            <BarChart3 className="w-3 h-3" />
                            Estadísticas
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => verFixtures(torneo.id)}
                          >
                            <Calendar className="w-3 h-3" />
                            Fixtures
                          </Button>
                        </>
                      )}
                      
                      {torneo.estado === "inscripciones_abiertas" && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => cerrarInscripciones(torneo.id)}
                        >
                          <X className="w-3 h-3" />
                          Cerrar inscripciones e iniciar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal del perfil del organizador */}
      <Dialog open={mostrarPerfilModal} onOpenChange={setMostrarPerfilModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil del Organizador
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                {perfilOrganizador.logo ? (
                  <img 
                    src={URL.createObjectURL(perfilOrganizador.logo)} 
                    alt="Logo"
                    className="w-14 h-14 object-contain rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{perfilOrganizador.nombre}</h3>
                <p className="text-sm text-muted-foreground">{torneos.length} torneos creados</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nombre del Organizador</Label>
                <Input
                  value={perfilOrganizador.nombre}
                  onChange={(e) => setPerfilOrganizador({...perfilOrganizador, nombre: e.target.value})}
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label>Encargados</Label>
                <Input
                  value={perfilOrganizador.encargados}
                  onChange={(e) => setPerfilOrganizador({...perfilOrganizador, encargados: e.target.value})}
                  placeholder="María García, Carlos López"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logoOrganizadorModal"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('logoOrganizadorModal')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Subir Logo
                </Button>
                {perfilOrganizador.logo && (
                  <Badge variant="secondary">{perfilOrganizador.logo.name}</Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Mis Torneos</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {torneos.map((torneo) => (
                  <div key={torneo.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{torneo.nombre}</p>
                      <p className="text-xs text-muted-foreground">{torneo.categoria} • {torneo.equiposInscritos} equipos</p>
                    </div>
                    {getEstadoBadge(torneo.estado)}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => {
                  setMostrarPerfilModal(false);
                  toast.success("Perfil actualizado");
                }}
                className="flex-1"
              >
                Guardar Cambios
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setMostrarPerfilModal(false)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones Pendientes
              <Badge variant="secondary">{notificaciones.length}</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No tienes notificaciones pendientes
              </p>
            ) : (
              notificaciones.map((notif) => (
                <div key={notif.id} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <Badge variant={notif.tipo === "inscripcion" ? "default" : "secondary"}>
                      {notif.tipo === "inscripcion" ? "Inscripción" : "Reprogramación"}
                    </Badge>
                    <p className="text-sm mt-1">{notif.mensaje}</p>
                    <p className="text-xs text-muted-foreground">{notif.fecha}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => manejarNotificacion(notif.id, "aprobar")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Aprobar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => manejarNotificacion(notif.id, "rechazar")}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal del formulario de torneo */}
      <TorneoFormModal
        open={mostrarFormulario}
        onClose={() => setMostrarFormulario(false)}
        onSubmit={handleSubmit}
        torneoId={torneoId}
      />

      {/* Modal de estadísticas */}
      <Dialog open={!!mostrarEstadisticas} onOpenChange={() => cerrarEstadisticas()}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estadísticas del Torneo
            </DialogTitle>
          </DialogHeader>
          
          {torneoEstadisticas && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div><span className="font-medium">Torneo:</span> {torneoEstadisticas.nombre}</div>
                <div><span className="font-medium">Categoría:</span> {torneoEstadisticas.categoria}</div>
                <div><span className="font-medium">Tipo:</span> {torneoEstadisticas.tipoFutbol}</div>
                <div><span className="font-medium">Grupos:</span> {torneoEstadisticas.numeroGrupos || 1}</div>
                <div>
                  <span className="font-medium">Ida y vuelta:</span> 
                  {torneoEstadisticas.idaVuelta?.grupos && " Grupos"}
                  {torneoEstadisticas.idaVuelta?.eliminatoria && " Eliminatoria"}
                  {!torneoEstadisticas.idaVuelta?.grupos && !torneoEstadisticas.idaVuelta?.eliminatoria && " No"}
                </div>
                <div><span className="font-medium">Puntaje extra:</span> {getPuntajeExtraLabel(torneoEstadisticas.puntajeExtra)}</div>
              </div>

              <Tabs defaultValue="tabla" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tabla">Tabla General</TabsTrigger>
                  <TabsTrigger value="resultados">Resultados</TabsTrigger>
                  <TabsTrigger value="goleadores">Goleadores</TabsTrigger>
                </TabsList>

                <TabsContent value="tabla">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pos</TableHead>
                          <TableHead>Equipo</TableHead>
                          <TableHead>Pts</TableHead>
                          <TableHead>PJ</TableHead>
                          <TableHead>PG</TableHead>
                          <TableHead>PE</TableHead>
                          <TableHead>PP</TableHead>
                          <TableHead>GF</TableHead>
                          <TableHead>GC</TableHead>
                          <TableHead>Dif</TableHead>
                          {torneoEstadisticas.puntajeExtra !== "NA" && <TableHead>P+</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estadisticasTorneo.tablaGrupos.map((equipo) => (
                          <TableRow key={equipo.posicion}>
                            <TableCell className="font-medium">{equipo.posicion}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{equipo.logo}</span>
                                {equipo.equipo}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">{equipo.puntos}</TableCell>
                            <TableCell>{equipo.pj}</TableCell>
                            <TableCell>{equipo.pg}</TableCell>
                            <TableCell>{equipo.pe}</TableCell>
                            <TableCell>{equipo.pp}</TableCell>
                            <TableCell>{equipo.gf}</TableCell>
                            <TableCell>{equipo.gc}</TableCell>
                            <TableCell className={equipo.dif >= 0 ? "text-green-600" : "text-red-600"}>
                              {equipo.dif > 0 ? `+${equipo.dif}` : equipo.dif}
                            </TableCell>
                            {torneoEstadisticas.puntajeExtra !== "NA" && <TableCell>{equipo.puntosExtra}</TableCell>}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="resultados">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Partido</TableHead>
                          <TableHead>Resultado</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estadisticasTorneo.resultados.map((resultado, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{resultado.logoLocal}</span>
                                <span className="hidden sm:inline">{resultado.partido}</span>
                                <span className="sm:hidden">{resultado.partido.replace(" vs ", " - ")}</span>
                                <span>{resultado.logoVisitante}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono font-bold">{resultado.resultado}</TableCell>
                            <TableCell>{resultado.fecha}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="goleadores">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jugador</TableHead>
                          <TableHead>Equipo</TableHead>
                          <TableHead>Goles</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estadisticasTorneo.goleadores.map((goleador, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{goleador.nombre}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{goleador.logo}</span>
                                {goleador.equipo}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">{goleador.goles}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de fixtures */}
      <Dialog open={!!mostrarFixtures} onOpenChange={() => setMostrarFixtures(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Fixtures del Torneo
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => descargarFixtures("grupos")}
                  className="flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Descargar Grupos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => descargarFixtures("eliminatoria")}
                  className="flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Descargar Eliminatoria
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium">🎲 Sorteo realizado y fechas programadas</p>
              <p className="text-sm text-muted-foreground">Los equipos pueden solicitar reprogramaciones antes del partido</p>
            </div>

            <Tabs defaultValue="grupos" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grupos">Fase de Grupos</TabsTrigger>
                <TabsTrigger value="eliminatoria">Eliminatoria</TabsTrigger>
              </TabsList>

              <TabsContent value="grupos">
                <div className="space-y-6">
                  {/* Grupo A */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-center bg-blue-100 p-2 rounded">Grupo A</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Partido</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Cancha</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fixturesGenerados.filter(p => p.grupo === "A").map((partido) => (
                            <TableRow key={partido.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{partido.logoLocal}</span>
                                  <span className="font-medium text-sm md:text-base">
                                    {partido.equipoLocal} vs {partido.equipoVisitante}
                                  </span>
                                  <span className="text-lg">{partido.logoVisitante}</span>
                                </div>
                              </TableCell>
                              <TableCell>{partido.fecha}</TableCell>
                              <TableCell>{partido.hora}</TableCell>
                              <TableCell>{partido.cancha}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  Editar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Grupo B */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-center bg-green-100 p-2 rounded">Grupo B</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Partido</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Cancha</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fixturesGenerados.filter(p => p.grupo === "B").map((partido) => (
                            <TableRow key={partido.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{partido.logoLocal}</span>
                                  <span className="font-medium text-sm md:text-base">
                                    {partido.equipoLocal} vs {partido.equipoVisitante}
                                  </span>
                                  <span className="text-lg">{partido.logoVisitante}</span>
                                </div>
                              </TableCell>
                              <TableCell>{partido.fecha}</TableCell>
                              <TableCell>{partido.hora}</TableCell>
                              <TableCell>{partido.cancha}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  Editar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="eliminatoria">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">🏆 Llave de Eliminatoria</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Semifinales */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-blue-600">Semifinales</h4>
                        {fixturesGenerados.filter(p => p.id.startsWith("SF")).map((partido) => (
                          <div key={partido.id} className="border-2 border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="text-lg">{partido.logoLocal}</span>
                              <span className="font-bold text-sm">{partido.equipoLocal}</span>
                            </div>
                            <div className="text-center text-xs text-muted-foreground mb-2">VS</div>
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <span className="text-lg">{partido.logoVisitante}</span>
                              <span className="font-bold text-sm">{partido.equipoVisitante}</span>
                            </div>
                            <div className="text-xs text-center">
                              <p>{partido.fecha} - {partido.hora}</p>
                              <p className="text-muted-foreground">{partido.cancha}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Flecha */}
                      <div className="flex items-center justify-center">
                        <div className="text-2xl">➡️</div>
                      </div>

                      {/* Final */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-yellow-600">Final</h4>
                        {fixturesGenerados.filter(p => p.id === "FINAL").map((partido) => (
                          <div key={partido.id} className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="text-lg">{partido.logoLocal}</span>
                              <span className="font-bold text-sm">{partido.equipoLocal}</span>
                            </div>
                            <div className="text-center text-xs text-muted-foreground mb-2">VS</div>
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <span className="text-lg">{partido.logoVisitante}</span>
                              <span className="font-bold text-sm">{partido.equipoVisitante}</span>
                            </div>
                            <div className="text-xs text-center">
                              <p className="font-medium">{partido.fecha} - {partido.hora}</p>
                              <p className="text-muted-foreground">{partido.cancha}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organizador;
