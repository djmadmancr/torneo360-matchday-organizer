
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
import { ArrowLeft, Upload, Plus, Edit, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Torneo {
  id: string;
  nombre: string;
  tipoFutbol: string;
  formato: string;
  categoria: string;
  fechaInicio: string;
  fechaCierre: string;
  estado: "inscripciones_abiertas" | "inscripciones_cerradas" | "en_curso" | "finalizado";
  equiposInscritos: number;
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
    fechaInicio: "",
    fechaCierre: "",
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
      fechaInicio: "2024-07-01",
      fechaCierre: "2024-06-25",
      estado: "inscripciones_abiertas",
      equiposInscritos: 8
    },
    {
      id: "TRN-DEF67890",
      nombre: "Torneo Relampago",
      tipoFutbol: "futbol7",
      formato: "rapido",
      categoria: "mixto",
      fechaInicio: "2024-06-20",
      fechaCierre: "2024-06-18",
      estado: "en_curso",
      equiposInscritos: 16
    }
  ]);

  const [torneoId] = useState(() => {
    return 'TRN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

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
      fechaInicio: formData.fechaInicio,
      fechaCierre: formData.fechaCierre,
      estado: "inscripciones_abiertas",
      equiposInscritos: 0
    };

    setTorneos([nuevoTorneo, ...torneos]);
    console.log("Datos del torneo:", { ...formData, torneoId });
    toast.success("¡Torneo creado exitosamente! ID: " + torneoId);
    
    // Reset form
    setFormData({
      nombreTorneo: "",
      tipoFutbol: "",
      formato: "",
      tipoTorneo: "",
      categoria: "",
      edadMinima: "",
      edadMaxima: "",
      maxJugadores: "",
      fechaInicio: "",
      fechaCierre: "",
      puntoPenales: false,
      torneoPublico: true,
      reglamento: "",
      reglamentoPDF: null
    });
    setMostrarFormulario(false);
  };

  const cerrarInscripciones = (torneoId: string) => {
    setTorneos(torneos.map(t => 
      t.id === torneoId 
        ? { ...t, estado: "inscripciones_cerradas" as const }
        : t
    ));
    toast.success("Inscripciones cerradas e iniciando campeonato");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
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
              <h1 className="text-2xl font-bold text-primary">🔵 Panel de Organizador</h1>
              <p className="text-muted-foreground">Crea y gestiona tus torneos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="torneos" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="torneos">Mis Torneos</TabsTrigger>
            <TabsTrigger value="crear" disabled={!mostrarFormulario}>
              {mostrarFormulario ? "Crear Torneo" : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="torneos">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Torneos Creados</h2>
                <Button 
                  onClick={() => setMostrarFormulario(true)}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
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
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{torneo.nombre}</CardTitle>
                            <p className="text-muted-foreground">ID: {torneo.id}</p>
                          </div>
                          {getEstadoBadge(torneo.estado)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="font-medium">Tipo:</span> {torneo.tipoFutbol}
                          </div>
                          <div>
                            <span className="font-medium">Formato:</span> {torneo.formato}
                          </div>
                          <div>
                            <span className="font-medium">Categoría:</span> {torneo.categoria}
                          </div>
                          <div>
                            <span className="font-medium">Inicio:</span> {torneo.fechaInicio}
                          </div>
                          <div>
                            <span className="font-medium">Cierre inscripciones:</span> {torneo.fechaCierre}
                          </div>
                          <div>
                            <span className="font-medium">Equipos:</span> {torneo.equiposInscritos}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Edit className="w-3 h-3" />
                            Editar Torneo
                          </Button>
                          
                          {torneo.estado === "inscripciones_abiertas" && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => cerrarInscripciones(torneo.id)}
                            >
                              <X className="w-3 h-3" />
                              Cerrar inscripciones e iniciar campeonato
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="crear">
            {mostrarFormulario && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl flex items-center gap-2">
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
                    {/* Información Básica */}
                    <div className="grid md:grid-cols-2 gap-6">
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

                    {/* Configuración del Torneo */}
                    <div className="grid md:grid-cols-3 gap-6">
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

                    <div className="space-y-2">
                      <Label htmlFor="tipoTorneo">Tipo de Torneo</Label>
                      <Select onValueChange={(value) => setFormData({...formData, tipoTorneo: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de torneo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                          <SelectItem value="internacional">Internacional</SelectItem>
                          <SelectItem value="invitacional">Invitacional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fechas */}
                    <div className="grid md:grid-cols-2 gap-6">
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
                      <div className="space-y-2">
                        <Label htmlFor="fechaInicio">Fecha de inicio del torneo *</Label>
                        <Input
                          id="fechaInicio"
                          type="date"
                          value={formData.fechaInicio}
                          onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    {/* Configuración de Participantes */}
                    <div className="grid md:grid-cols-3 gap-6">
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

                    {/* Opciones Adicionales */}
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

                    {/* Reglamento */}
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
                        <div className="flex items-center gap-4">
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

                    <div className="flex gap-4 pt-6">
                      <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        🏆 Crear Torneo
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setMostrarFormulario(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Organizador;
