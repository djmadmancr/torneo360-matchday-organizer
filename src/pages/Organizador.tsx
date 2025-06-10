
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Upload, Plus, Edit, X, BarChart3, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  idaVueltaConfig?: {
    grupos: boolean;
    eliminatoria: boolean;
  };
  puntoPenales?: boolean;
}

const Organizador = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreTorneo: "",
    tipoFutbol: "",
    formato: "",
    tipoTorneo: "",
    categoria: "",
    edadMinima: "",
    edadMaxima: "",
    maxJugadores: "",
    fechaCierre: "",
    numeroGrupos: "1",
    idaVueltaConfig: {
      grupos: false,
      eliminatoria: false
    },
    puntoPenales: false,
    torneoPublico: true,
    reglamento: "",
    reglamentoPDF: null as File | null
  });

  const [torneos, setTorneos] = useState<Torneo[]>([
    {
      id: "TRN-ABC12345",
      nombre: "Copa Primavera 2024",
      tipoFutbol: "futbol5",
      formato: "completo",
      categoria: "masculino",
      fechaCierre: "2024-06-25",
      estado: "inscripciones_abiertas",
      equiposInscritos: 8,
      numeroGrupos: 2,
      idaVueltaConfig: { grupos: true, eliminatoria: false },
      puntoPenales: true
    },
    {
      id: "TRN-DEF67890",
      nombre: "Torneo Relampago",
      tipoFutbol: "futbol7",
      formato: "rapido",
      categoria: "mixto",
      fechaCierre: "2024-06-18",
      estado: "en_curso",
      equiposInscritos: 16,
      numeroGrupos: 1,
      idaVueltaConfig: { grupos: false, eliminatoria: false }
    }
  ]);

  const [torneoId] = useState(() => {
    return 'TRN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState<string | null>(null);
  const [torneoEstadisticas, setTorneoEstadisticas] = useState<Torneo | null>(null);

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
      { posicion: 1, equipo: "Águilas FC", puntos: 10, pj: 4, pg: 3, pe: 1, pp: 0, gf: 8, gc: 3, dif: 5, logo: "🦅" },
      { posicion: 2, equipo: "Tigres SC", puntos: 7, pj: 4, pg: 2, pe: 1, pp: 1, gf: 6, gc: 4, dif: 2, logo: "🐅" },
      { posicion: 3, equipo: "Pumas FC", puntos: 6, pj: 4, pg: 2, pe: 0, pp: 2, gf: 5, gc: 5, dif: 0, logo: "🐆" },
      { posicion: 4, equipo: "Leones United", puntos: 1, pj: 4, pg: 0, pe: 1, pp: 3, gf: 2, gc: 9, dif: -7, logo: "🦁" }
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombreTorneo || !formData.tipoFutbol || !formData.formato || !formData.categoria) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    const nuevoTorneo: Torneo = {
      id: torneoId,
      nombre: formData.nombreTorneo,
      tipoFutbol: formData.tipoFutbol,
      formato: formData.formato,
      categoria: formData.categoria,
      fechaCierre: formData.fechaCierre,
      estado: "inscripciones_abiertas",
      equiposInscritos: 0,
      numeroGrupos: parseInt(formData.numeroGrupos),
      idaVueltaConfig: formData.idaVueltaConfig,
      puntoPenales: formData.puntoPenales
    };

    setTorneos([nuevoTorneo, ...torneos]);
    console.log("Datos del torneo:", { ...formData, torneoId });
    toast.success("¡Torneo creado exitosamente! ID: " + torneoId);
    
    setFormData({
      nombreTorneo: "",
      tipoFutbol: "",
      formato: "",
      tipoTorneo: "",
      categoria: "",
      edadMinima: "",
      edadMaxima: "",
      maxJugadores: "",
      fechaCierre: "",
      numeroGrupos: "1",
      idaVueltaConfig: { grupos: false, eliminatoria: false },
      puntoPenales: false,
      torneoPublico: true,
      reglamento: "",
      reglamentoPDF: null
    });
    setMostrarFormulario(false);
  };

  const cerrarInscripciones = (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo) return;

    if (!torneo.numeroGrupos || torneo.numeroGrupos < 1) {
      toast.error("Debe configurar el número de grupos antes de cerrar inscripciones");
      return;
    }

    if (torneo.formato === "completo" && (!torneo.idaVueltaConfig)) {
      toast.error("Debe configurar las opciones de ida y vuelta antes de cerrar inscripciones");
      return;
    }

    setTorneos(torneos.map(t => 
      t.id === torneoId 
        ? { ...t, estado: "en_curso" as const }
        : t
    ));
    toast.success("Inscripciones cerradas. ¡Generando fixtures y iniciando torneo!");
  };

  const getFormatoDescripcion = (formato: string) => {
    switch (formato) {
      case "completo":
        return "Fase de grupos seguida de eliminatorias directas";
      case "eliminatorio":
        return "Eliminación directa desde el inicio";
      case "rapido":
        return "Partidos de ida y vuelta, formato acelerado";
      default:
        return "";
    }
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

  const handleReglamentoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, reglamentoPDF: file });
      toast.success("Reglamento PDF cargado");
    } else {
      toast.error("Por favor selecciona un archivo PDF válido");
    }
  };

  const verEstadisticas = (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (torneo) {
      setTorneoEstadisticas(torneo);
      setMostrarEstadisticas(torneoId);
    }
  };

  const cerrarEstadisticas = () => {
    setMostrarEstadisticas(null);
    setTorneoEstadisticas(null);
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
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        disabled={torneo.estado === "en_curso"}
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

          {mostrarFormulario && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    🏆 Crear Nuevo Torneo
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    onClick={() => setMostrarFormulario(false)}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nombreTorneo">Nombre del Torneo *</Label>
                      <Input
                        id="nombreTorneo"
                        value={formData.nombreTorneo}
                        onChange={(e) => setFormData({...formData, nombreTorneo: e.target.value})}
                        placeholder="Ej: Copa Primavera 2024"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="torneoId">ID del Torneo</Label>
                      <Input
                        id="torneoId"
                        value={torneoId}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tipoFutbol">Tipo de Fútbol *</Label>
                      <Select onValueChange={(value) => setFormData({...formData, tipoFutbol: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="futbol5">Fútbol 5</SelectItem>
                          <SelectItem value="futbol7">Fútbol 7</SelectItem>
                          <SelectItem value="futbol9">Fútbol 9</SelectItem>
                          <SelectItem value="futbol11">Fútbol 11</SelectItem>
                          <SelectItem value="sala">Fútbol Sala</SelectItem>
                          <SelectItem value="playa">Fútbol Playa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="formato">Formato *</Label>
                      <Select onValueChange={(value) => setFormData({...formData, formato: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completo">Completo</SelectItem>
                          <SelectItem value="eliminatorio">Eliminatorio</SelectItem>
                          <SelectItem value="rapido">Rápido</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.formato && (
                        <p className="text-sm text-muted-foreground">
                          {getFormatoDescripcion(formData.formato)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoría *</Label>
                      <Select onValueChange={(value) => setFormData({...formData, categoria: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="mixto">Mixto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configuración de Grupos</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="numeroGrupos">Número de Grupos *</Label>
                        <Select 
                          value={formData.numeroGrupos}
                          onValueChange={(value) => setFormData({...formData, numeroGrupos: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona grupos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Grupo (Tabla General)</SelectItem>
                            <SelectItem value="2">2 Grupos</SelectItem>
                            <SelectItem value="3">3 Grupos</SelectItem>
                            <SelectItem value="4">4 Grupos</SelectItem>
                            <SelectItem value="6">6 Grupos</SelectItem>
                            <SelectItem value="8">8 Grupos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(formData.formato === "completo" || formData.formato === "rapido") && (
                        <div className="space-y-4">
                          <Label>Ida y Vuelta</Label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="idaVueltaGrupos"
                                checked={formData.idaVueltaConfig.grupos}
                                onCheckedChange={(checked) => setFormData({
                                  ...formData, 
                                  idaVueltaConfig: {...formData.idaVueltaConfig, grupos: !!checked}
                                })}
                              />
                              <Label htmlFor="idaVueltaGrupos" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Grupos - Cada equipo juega 2 veces contra cada rival
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="idaVueltaEliminatoria"
                                checked={formData.idaVueltaConfig.eliminatoria}
                                onCheckedChange={(checked) => setFormData({
                                  ...formData, 
                                  idaVueltaConfig: {...formData.idaVueltaConfig, eliminatoria: !!checked}
                                })}
                              />
                              <Label htmlFor="idaVueltaEliminatoria" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Eliminatoria - Partidos de ida y vuelta en playoffs
                              </Label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaCierre">Fecha límite de inscripciones *</Label>
                    <Input
                      id="fechaCierre"
                      type="date"
                      value={formData.fechaCierre}
                      onChange={(e) => setFormData({...formData, fechaCierre: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edadMinima">Edad Mínima</Label>
                      <Input
                        id="edadMinima"
                        type="number"
                        value={formData.edadMinima}
                        onChange={(e) => setFormData({...formData, edadMinima: e.target.value})}
                        placeholder="16"
                        min="5"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edadMaxima">Edad Máxima</Label>
                      <Input
                        id="edadMaxima"
                        type="number"
                        value={formData.edadMaxima}
                        onChange={(e) => setFormData({...formData, edadMaxima: e.target.value})}
                        placeholder="35"
                        min="5"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxJugadores">Máx. Jugadores por Equipo</Label>
                      <Input
                        id="maxJugadores"
                        type="number"
                        value={formData.maxJugadores}
                        onChange={(e) => setFormData({...formData, maxJugadores: e.target.value})}
                        placeholder="15"
                        min="7"
                        max="30"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="puntoPenales">Punto adicional por penales</Label>
                        <p className="text-sm text-muted-foreground">Solo aplica en fase de grupos</p>
                      </div>
                      <Switch
                        id="puntoPenales"
                        checked={formData.puntoPenales}
                        onCheckedChange={(checked) => setFormData({...formData, puntoPenales: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="torneoPublico">Torneo público</Label>
                        <p className="text-sm text-muted-foreground">Mostrar en la lista pública de torneos</p>
                      </div>
                      <Switch
                        id="torneoPublico"
                        checked={formData.torneoPublico}
                        onCheckedChange={(checked) => setFormData({...formData, torneoPublico: checked})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reglamento">Reglamento General del Torneo</Label>
                      <Textarea
                        id="reglamento"
                        value={formData.reglamento}
                        onChange={(e) => setFormData({...formData, reglamento: e.target.value})}
                        placeholder="Describe las reglas generales del torneo, horarios, sanciones, etc."
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reglamentoPDF">Reglamento PDF (Opcional)</Label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Input
                          id="reglamentoPDF"
                          type="file"
                          accept=".pdf"
                          onChange={handleReglamentoUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('reglamentoPDF')?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Subir PDF
                        </Button>
                        {formData.reglamentoPDF && (
                          <Badge variant="secondary">{formData.reglamentoPDF.name}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      🏆 Crear Torneo
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setMostrarFormulario(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
                  {torneoEstadisticas.idaVueltaConfig?.grupos && " Grupos"}
                  {torneoEstadisticas.idaVueltaConfig?.eliminatoria && " Eliminatoria"}
                  {!torneoEstadisticas.idaVueltaConfig?.grupos && !torneoEstadisticas.idaVueltaConfig?.eliminatoria && " No"}
                </div>
                <div><span className="font-medium">Penales:</span> {torneoEstadisticas.puntoPenales ? "Punto extra" : "No"}</div>
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
    </div>
  );
};

export default Organizador;
