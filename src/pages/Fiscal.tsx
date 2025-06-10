
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Search, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Partido {
  id: string;
  equipoLocal: string;
  equipoVisitante: string;
  fecha: string;
  hora: string;
  cancha: string;
  estado: "pendiente" | "en_curso" | "finalizado";
}

interface Goleador {
  id: string;
  nombre: string;
  goles: string;
}

interface Asistencia {
  id: string;
  nombre: string;
  asistencias: string;
}

const Fiscal = () => {
  const navigate = useNavigate();
  const [torneoId, setTorneoId] = useState("");
  const [partidos] = useState<Partido[]>([
    {
      id: "PT-001",
      equipoLocal: "Águilas FC",
      equipoVisitante: "Leones United",
      fecha: "2024-06-15",
      hora: "15:00",
      cancha: "Cancha Principal",
      estado: "pendiente"
    },
    {
      id: "PT-002",
      equipoLocal: "Tigres SC",
      equipoVisitante: "Pumas FC",
      fecha: "2024-06-15",
      hora: "17:00",
      cancha: "Cancha 2",
      estado: "pendiente"
    }
  ]);

  const [partidoSeleccionado, setPartidoSeleccionado] = useState<string>("");
  const [resultado, setResultado] = useState({
    golesLocal: "",
    golesVisitante: "",
    informeArbitral: null as File | null
  });

  const [goleadores, setGoleadores] = useState<Goleador[]>([]);
  const [nuevoGoleador, setNuevoGoleador] = useState({ nombre: "", goles: "" });

  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [nuevaAsistencia, setNuevaAsistencia] = useState({ nombre: "", asistencias: "" });

  const buscarTorneo = () => {
    if (!torneoId) {
      toast.error("Por favor ingresa el ID del torneo");
      return;
    }

    console.log("Buscando torneo:", torneoId);
    toast.success(`Torneo ${torneoId} encontrado. Mostrando partidos asignados.`);
  };

  const agregarGoleador = () => {
    if (!nuevoGoleador.nombre || !nuevoGoleador.goles) {
      toast.error("Por favor completa los datos del goleador");
      return;
    }

    const goleador: Goleador = {
      id: Math.random().toString(36).substr(2, 9),
      ...nuevoGoleador
    };

    setGoleadores([...goleadores, goleador]);
    setNuevoGoleador({ nombre: "", goles: "" });
    toast.success("Goleador agregado");
  };

  const agregarAsistencia = () => {
    if (!nuevaAsistencia.nombre || !nuevaAsistencia.asistencias) {
      toast.error("Por favor completa los datos de la asistencia");
      return;
    }

    const asistencia: Asistencia = {
      id: Math.random().toString(36).substr(2, 9),
      ...nuevaAsistencia
    };

    setAsistencias([...asistencias, asistencia]);
    setNuevaAsistencia({ nombre: "", asistencias: "" });
    toast.success("Asistencia agregada");
  };

  const subirResultados = () => {
    if (!partidoSeleccionado) {
      toast.error("Por favor selecciona un partido");
      return;
    }

    if (!resultado.golesLocal || !resultado.golesVisitante) {
      toast.error("Por favor ingresa el marcador final");
      return;
    }

    const resultadoCompleto = {
      partidoId: partidoSeleccionado,
      marcador: `${resultado.golesLocal} - ${resultado.golesVisitante}`,
      goleadores,
      asistencias,
      informeArbitral: resultado.informeArbitral
    };

    console.log("Subiendo resultados:", resultadoCompleto);
    toast.success("¡Resultados subidos exitosamente!");

    // Reset form
    setPartidoSeleccionado("");
    setResultado({ golesLocal: "", golesVisitante: "", informeArbitral: null });
    setGoleadores([]);
    setAsistencias([]);
  };

  const handleInformeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResultado({ ...resultado, informeArbitral: file });
      toast.success("Informe arbitral cargado");
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "en_curso":
        return <Badge className="bg-yellow-500">En Curso</Badge>;
      case "finalizado":
        return <Badge className="bg-green-500">Finalizado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
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
              <h1 className="text-2xl font-bold text-primary">🟠 Panel de Fiscal</h1>
              <p className="text-muted-foreground">Supervisa partidos y registra resultados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="torneo" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="torneo">Buscar Torneo</TabsTrigger>
            <TabsTrigger value="partidos">Mis Partidos</TabsTrigger>
            <TabsTrigger value="resultados">Subir Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="torneo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Buscar Torneo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="idTorneo">ID del Torneo</Label>
                  <div className="flex gap-4">
                    <Input
                      id="idTorneo"
                      value={torneoId}
                      onChange={(e) => setTorneoId(e.target.value)}
                      placeholder="Ej: TRN-ABC12345"
                      className="flex-1"
                    />
                    <Button onClick={buscarTorneo} className="bg-orange-600 hover:bg-orange-700">
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>

                {torneoId && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">Información del Torneo</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">ID:</span> {torneoId}
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span> Activo
                      </div>
                      <div>
                        <span className="font-medium">Partidos asignados:</span> 2
                      </div>
                      <div>
                        <span className="font-medium">Rol:</span> Árbitro Principal
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partidos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📅 Partidos Asignados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partidos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No tienes partidos asignados. Busca un torneo para ver tus asignaciones.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {partidos.map((partido) => (
                      <div key={partido.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {partido.equipoLocal} vs {partido.equipoVisitante}
                            </h4>
                            <p className="text-sm text-muted-foreground">ID: {partido.id}</p>
                          </div>
                          {getEstadoBadge(partido.estado)}
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span>{partido.fecha}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span>{partido.hora}</span>
                          </div>
                          <div>
                            <span className="font-medium">Cancha:</span> {partido.cancha}
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setPartidoSeleccionado(partido.id)}
                          >
                            Seleccionar para Resultados
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resultados">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 Subir Resultados del Partido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="partidoSelect">Partido Seleccionado</Label>
                    <Input
                      id="partidoSelect"
                      value={partidoSeleccionado || "Ningún partido seleccionado"}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="golesLocal">Goles Equipo Local</Label>
                      <Input
                        id="golesLocal"
                        type="number"
                        value={resultado.golesLocal}
                        onChange={(e) => setResultado({...resultado, golesLocal: e.target.value})}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="golesVisitante">Goles Equipo Visitante</Label>
                      <Input
                        id="golesVisitante"
                        type="number"
                        value={resultado.golesVisitante}
                        onChange={(e) => setResultado({...resultado, golesVisitante: e.target.value})}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Goleadores */}
                  <div className="space-y-4">
                    <Label>Goleadores</Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Nombre del jugador"
                        value={nuevoGoleador.nombre}
                        onChange={(e) => setNuevoGoleador({...nuevoGoleador, nombre: e.target.value})}
                      />
                      <Input
                        placeholder="Cantidad de goles"
                        type="number"
                        value={nuevoGoleador.goles}
                        onChange={(e) => setNuevoGoleador({...nuevoGoleador, goles: e.target.value})}
                        min="1"
                      />
                      <Button onClick={agregarGoleador} variant="outline">
                        Agregar Goleador
                      </Button>
                    </div>
                    
                    {goleadores.length > 0 && (
                      <div className="space-y-2">
                        {goleadores.map((goleador) => (
                          <div key={goleador.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                            <span>{goleador.nombre}</span>
                            <Badge>{goleador.goles} gol(es)</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Asistencias */}
                  <div className="space-y-4">
                    <Label>Asistencias</Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Nombre del jugador"
                        value={nuevaAsistencia.nombre}
                        onChange={(e) => setNuevaAsistencia({...nuevaAsistencia, nombre: e.target.value})}
                      />
                      <Input
                        placeholder="Cantidad de asistencias"
                        type="number"
                        value={nuevaAsistencia.asistencias}
                        onChange={(e) => setNuevaAsistencia({...nuevaAsistencia, asistencias: e.target.value})}
                        min="1"
                      />
                      <Button onClick={agregarAsistencia} variant="outline">
                        Agregar Asistencia
                      </Button>
                    </div>
                    
                    {asistencias.length > 0 && (
                      <div className="space-y-2">
                        {asistencias.map((asistencia) => (
                          <div key={asistencia.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                            <span>{asistencia.nombre}</span>
                            <Badge>{asistencia.asistencias} asistencia(s)</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Informe Arbitral */}
                  <div className="space-y-2">
                    <Label htmlFor="informe">Foto del Informe Arbitral</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="informe"
                        type="file"
                        accept="image/*"
                        onChange={handleInformeUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('informe')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Subir Informe
                      </Button>
                      {resultado.informeArbitral && (
                        <Badge variant="secondary">{resultado.informeArbitral.name}</Badge>
                      )}
                    </div>
                  </div>

                  <Button onClick={subirResultados} className="w-full bg-orange-600 hover:bg-orange-700">
                    📊 Subir Resultados Completos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Fiscal;
