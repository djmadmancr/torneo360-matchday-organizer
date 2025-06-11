
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Edit, X, BarChart3, Calendar, User, Bell, Upload } from "lucide-react";
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
    }
  ]);

  const [torneoId] = useState(() => {
    return 'TRN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState<string | null>(null);
  const [mostrarFixtures, setMostrarFixtures] = useState<string | null>(null);
  const [torneoEstadisticas, setTorneoEstadisticas] = useState<Torneo | null>(null);
  const [fixturesGenerados, setFixturesGenerados] = useState<Partido[]>([]);
  
  // Perfil del organizador
  const [perfilOrganizador, setPerfilOrganizador] = useState({
    nombre: "",
    encargados: "",
    logo: null as File | null,
    notificaciones: [
      { id: 1, tipo: "inscripcion", mensaje: "Águilas FC solicita inscribirse al torneo Copa Primavera 2024", fecha: "2024-06-15" },
      { id: 2, tipo: "reprogramacion", mensaje: "Tigres SC solicita reprogramar partido vs Leones United", fecha: "2024-06-14" }
    ]
  });

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
    // Generar fixtures aleatorios
    const equiposEjemplo = ["Águilas FC", "Tigres SC", "Leones United", "Pumas FC"];
    const fixtures: Partido[] = [];
    
    for (let i = 0; i < equiposEjemplo.length; i++) {
      for (let j = i + 1; j < equiposEjemplo.length; j++) {
        fixtures.push({
          id: `P${i}${j}`,
          equipoLocal: equiposEjemplo[i],
          equipoVisitante: equiposEjemplo[j],
          fecha: `2024-06-${15 + fixtures.length}`,
          hora: `${15 + (fixtures.length % 3)}:00`,
          cancha: `Cancha ${(fixtures.length % 3) + 1}`,
          logoLocal: ["🦅", "🐅", "🦁", "🐆"][i],
          logoVisitante: ["🦅", "🐅", "🦁", "🐆"][j]
        });
      }
    }
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
              <h1 className="text-xl md:text-2xl font-bold text-primary">🔵 Panel de Organizador</h1>
              <p className="text-sm text-muted-foreground">Crea y gestiona tus torneos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Perfil del Organizador */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Perfil del Organizador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logoOrganizador"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logoOrganizador')?.click()}
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
              </div>

              {/* Notificaciones */}
              {perfilOrganizador.notificaciones.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    <h3 className="font-semibold">Notificaciones Pendientes</h3>
                    <Badge variant="secondary">{perfilOrganizador.notificaciones.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {perfilOrganizador.notificaciones.map((notif) => (
                      <div key={notif.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                        <div>
                          <p className="text-sm font-medium">{notif.mensaje}</p>
                          <p className="text-xs text-muted-foreground">{notif.fecha}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Aprobar</Button>
                          <Button size="sm" variant="destructive">Rechazar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                      <div><span className="font-medium">Formato:</span> {torneo.formato}</div>
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
                      
                      {torneo.estado === "en_curso" && (
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Fixtures del Torneo
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium">Sorteo realizado y fechas programadas</p>
              <p className="text-sm text-muted-foreground">Los equipos pueden solicitar reprogramaciones antes del partido</p>
            </div>

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
                  {fixturesGenerados.map((partido) => (
                    <TableRow key={partido.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{partido.logoLocal}</span>
                          <span className="font-medium">
                            {partido.equipoLocal} vs {partido.equipoVisitante}
                          </span>
                          <span>{partido.logoVisitante}</span>
                        </div>
                      </TableCell>
                      <TableCell>{partido.fecha}</TableCell>
                      <TableCell>{partido.hora}</TableCell>
                      <TableCell>{partido.cancha}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Editar Fecha
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organizador;
