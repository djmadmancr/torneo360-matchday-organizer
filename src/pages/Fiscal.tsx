
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Search, Calendar, Clock, Camera } from "lucide-react";
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

interface Jugador {
  id: string;
  nombre: string;
  numero: number;
  equipo: "local" | "visitante";
}

interface Goleador {
  id: string;
  jugadorId: string;
  nombre: string;
  goles: number;
}

interface Tarjeta {
  id: string;
  jugadorId: string;
  nombre: string;
  tipo: "amarilla" | "doble_amarilla" | "roja_directa";
  minuto: number;
}

interface Cambio {
  id: string;
  jugadorSaleId: string;
  jugadorEntraId: string;
  nombreSale: string;
  nombreEntra: string;
  minuto: number;
  equipo: "local" | "visitante";
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

  // Jugadores simulados para el partido seleccionado
  const [jugadores] = useState<Jugador[]>([
    { id: "j1", nombre: "Carlos Mendez", numero: 1, equipo: "local" },
    { id: "j2", nombre: "Roberto Silva", numero: 9, equipo: "local" },
    { id: "j3", nombre: "Luis García", numero: 10, equipo: "local" },
    { id: "j4", nombre: "Pedro Ruiz", numero: 7, equipo: "visitante" },
    { id: "j5", nombre: "Marco Torres", numero: 11, equipo: "visitante" },
    { id: "j6", nombre: "Diego López", numero: 8, equipo: "visitante" },
  ]);

  const [partidoSeleccionado, setPartidoSeleccionado] = useState<string>("");
  const [resultado, setResultado] = useState({
    golesLocal: "",
    golesVisitante: "",
    informeArbitral: null as File | null
  });

  const [goleadores, setGoleadores] = useState<Goleador[]>([]);
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [cambios, setCambios] = useState<Cambio[]>([]);

  // Estados para formularios
  const [nuevoGoleador, setNuevoGoleador] = useState({ jugadorId: "", goles: 1 });
  const [nuevaTarjeta, setNuevaTarjeta] = useState({ jugadorId: "", tipo: "", minuto: "" });
  const [nuevoCambio, setNuevoCambio] = useState({ 
    jugadorSaleId: "", 
    jugadorEntraId: "", 
    minuto: "",
    equipo: "" 
  });

  const buscarTorneo = () => {
    if (!torneoId) {
      toast.error("Por favor ingresa el ID del torneo");
      return;
    }
    console.log("Buscando torneo:", torneoId);
    toast.success(`Torneo ${torneoId} encontrado. Mostrando partidos asignados.`);
  };

  const agregarGoleador = () => {
    if (!nuevoGoleador.jugadorId) {
      toast.error("Por favor selecciona un jugador");
      return;
    }

    const jugador = jugadores.find(j => j.id === nuevoGoleador.jugadorId);
    if (!jugador) return;

    const goleador: Goleador = {
      id: Math.random().toString(36).substr(2, 9),
      jugadorId: nuevoGoleador.jugadorId,
      nombre: jugador.nombre,
      goles: nuevoGoleador.goles
    };

    setGoleadores([...goleadores, goleador]);
    setNuevoGoleador({ jugadorId: "", goles: 1 });
    toast.success("Goleador agregado");
  };

  const agregarTarjeta = () => {
    if (!nuevaTarjeta.jugadorId || !nuevaTarjeta.tipo || !nuevaTarjeta.minuto) {
      toast.error("Por favor completa todos los datos de la tarjeta");
      return;
    }

    const jugador = jugadores.find(j => j.id === nuevaTarjeta.jugadorId);
    if (!jugador) return;

    const tarjeta: Tarjeta = {
      id: Math.random().toString(36).substr(2, 9),
      jugadorId: nuevaTarjeta.jugadorId,
      nombre: jugador.nombre,
      tipo: nuevaTarjeta.tipo as "amarilla" | "doble_amarilla" | "roja_directa",
      minuto: parseInt(nuevaTarjeta.minuto)
    };

    setTarjetas([...tarjetas, tarjeta]);
    setNuevaTarjeta({ jugadorId: "", tipo: "", minuto: "" });
    toast.success("Tarjeta registrada");
  };

  const agregarCambio = () => {
    if (!nuevoCambio.jugadorSaleId || !nuevoCambio.jugadorEntraId || !nuevoCambio.minuto || !nuevoCambio.equipo) {
      toast.error("Por favor completa todos los datos del cambio");
      return;
    }

    const jugadorSale = jugadores.find(j => j.id === nuevoCambio.jugadorSaleId);
    const jugadorEntra = jugadores.find(j => j.id === nuevoCambio.jugadorEntraId);
    if (!jugadorSale || !jugadorEntra) return;

    const cambio: Cambio = {
      id: Math.random().toString(36).substr(2, 9),
      jugadorSaleId: nuevoCambio.jugadorSaleId,
      jugadorEntraId: nuevoCambio.jugadorEntraId,
      nombreSale: jugadorSale.nombre,
      nombreEntra: jugadorEntra.nombre,
      minuto: parseInt(nuevoCambio.minuto),
      equipo: nuevoCambio.equipo as "local" | "visitante"
    };

    setCambios([...cambios, cambio]);
    setNuevoCambio({ jugadorSaleId: "", jugadorEntraId: "", minuto: "", equipo: "" });
    toast.success("Cambio registrado");
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
      tarjetas,
      cambios,
      informeArbitral: resultado.informeArbitral
    };

    console.log("Subiendo resultados:", resultadoCompleto);
    toast.success("¡Resultados subidos exitosamente!");

    // Reset form
    setPartidoSeleccionado("");
    setResultado({ golesLocal: "", golesVisitante: "", informeArbitral: null });
    setGoleadores([]);
    setTarjetas([]);
    setCambios([]);
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

  const getTarjetaBadge = (tipo: string) => {
    switch (tipo) {
      case "amarilla":
        return <Badge className="bg-yellow-500">Amarilla</Badge>;
      case "doble_amarilla":
        return <Badge className="bg-orange-500">Doble Amarilla</Badge>;
      case "roja_directa":
        return <Badge className="bg-red-500">Roja Directa</Badge>;
      default:
        return <Badge variant="outline">Desconocida</Badge>;
    }
  };

  const jugadoresLocales = jugadores.filter(j => j.equipo === "local");
  const jugadoresVisitantes = jugadores.filter(j => j.equipo === "visitante");

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="torneo">Buscar Torneo</TabsTrigger>
            <TabsTrigger value="partidos">Seleccionar Partido</TabsTrigger>
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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📅 Seleccionar Partido para Resultados
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
                              className={partidoSeleccionado === partido.id ? "bg-orange-100 border-orange-500" : ""}
                            >
                              {partidoSeleccionado === partido.id ? "Seleccionado" : "Seleccionar"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {partidoSeleccionado && (
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
                        value={partidoSeleccionado}
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
                      <Label>⚽ Goleadores</Label>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Select value={nuevoGoleador.jugadorId} onValueChange={(value) => setNuevoGoleador({...nuevoGoleador, jugadorId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar jugador" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Ninguno</SelectItem>
                            {jugadores.map((jugador) => (
                              <SelectItem key={jugador.id} value={jugador.id}>
                                {jugador.nombre} #{jugador.numero} ({jugador.equipo === "local" ? "Local" : "Visitante"})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Cantidad de goles"
                          type="number"
                          value={nuevoGoleador.goles}
                          onChange={(e) => setNuevoGoleador({...nuevoGoleador, goles: parseInt(e.target.value) || 1})}
                          min="1"
                        />
                        <Button onClick={agregarGoleador} variant="outline">
                          Agregar Gol
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

                    {/* Tarjetas */}
                    <div className="space-y-4">
                      <Label>🟨🟥 Tarjetas</Label>
                      <div className="grid md:grid-cols-4 gap-4">
                        <Select value={nuevaTarjeta.jugadorId} onValueChange={(value) => setNuevaTarjeta({...nuevaTarjeta, jugadorId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar jugador" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Ninguno</SelectItem>
                            {jugadores.map((jugador) => (
                              <SelectItem key={jugador.id} value={jugador.id}>
                                {jugador.nombre} #{jugador.numero} ({jugador.equipo === "local" ? "Local" : "Visitante"})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={nuevaTarjeta.tipo} onValueChange={(value) => setNuevaTarjeta({...nuevaTarjeta, tipo: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo de tarjeta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amarilla">Amarilla</SelectItem>
                            <SelectItem value="doble_amarilla">Doble Amarilla</SelectItem>
                            <SelectItem value="roja_directa">Roja Directa</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Minuto"
                          type="number"
                          value={nuevaTarjeta.minuto}
                          onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, minuto: e.target.value})}
                          min="1"
                          max="120"
                        />
                        <Button onClick={agregarTarjeta} variant="outline">
                          Agregar Tarjeta
                        </Button>
                      </div>
                      
                      {tarjetas.length > 0 && (
                        <div className="space-y-2">
                          {tarjetas.map((tarjeta) => (
                            <div key={tarjeta.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                              <span>{tarjeta.nombre} - Min {tarjeta.minuto}</span>
                              {getTarjetaBadge(tarjeta.tipo)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cambios */}
                    <div className="space-y-4">
                      <Label>🔄 Cambios de Jugadores</Label>
                      <div className="grid md:grid-cols-5 gap-4">
                        <Select value={nuevoCambio.equipo} onValueChange={(value) => setNuevoCambio({...nuevoCambio, equipo: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Equipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Local</SelectItem>
                            <SelectItem value="visitante">Visitante</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={nuevoCambio.jugadorSaleId} onValueChange={(value) => setNuevoCambio({...nuevoCambio, jugadorSaleId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sale" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Ninguno</SelectItem>
                            {(nuevoCambio.equipo === "local" ? jugadoresLocales : jugadoresVisitantes).map((jugador) => (
                              <SelectItem key={jugador.id} value={jugador.id}>
                                {jugador.nombre} #{jugador.numero}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={nuevoCambio.jugadorEntraId} onValueChange={(value) => setNuevoCambio({...nuevoCambio, jugadorEntraId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Entra" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Ninguno</SelectItem>
                            {(nuevoCambio.equipo === "local" ? jugadoresLocales : jugadoresVisitantes).map((jugador) => (
                              <SelectItem key={jugador.id} value={jugador.id}>
                                {jugador.nombre} #{jugador.numero}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Minuto"
                          type="number"
                          value={nuevoCambio.minuto}
                          onChange={(e) => setNuevoCambio({...nuevoCambio, minuto: e.target.value})}
                          min="1"
                          max="120"
                        />
                        <Button onClick={agregarCambio} variant="outline">
                          Agregar Cambio
                        </Button>
                      </div>
                      
                      {cambios.length > 0 && (
                        <div className="space-y-2">
                          {cambios.map((cambio) => (
                            <div key={cambio.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                              <span>
                                Min {cambio.minuto}: Sale {cambio.nombreSale} → Entra {cambio.nombreEntra}
                              </span>
                              <Badge variant="outline">{cambio.equipo === "local" ? "Local" : "Visitante"}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Informe Arbitral */}
                    <div className="space-y-2">
                      <Label htmlFor="informe">📸 Foto del Informe Arbitral</Label>
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
                          <Camera className="w-4 h-4" />
                          Subir Foto
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
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Fiscal;
