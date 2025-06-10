import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Upload, Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface Jugador {
  id: string;
  nombre: string;
  identificacion: string;
  edad: string;
  seleccionado: boolean;
}

interface TorneoPublico {
  id: string;
  nombre: string;
  tipoFutbol: string;
  categoria: string;
  fechaInicio: string;
  fechaCierre: string;
  equiposInscritos: number;
  maxEquipos: number;
}

const Equipo = () => {
  const navigate = useNavigate();
  const [equipoData, setEquipoData] = useState({
    nombre: "",
    logo: null as File | null
  });

  const [equipoId] = useState(() => {
    return 'EQP-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  });

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [nuevoJugador, setNuevoJugador] = useState({
    nombre: "",
    identificacion: "",
    edad: ""
  });

  const [torneoId, setTorneoId] = useState("");
  const [canchasCasa, setCanchasCasa] = useState<string[]>([]);
  const [nuevaCancha, setNuevaCancha] = useState("");
  const [busquedaTorneo, setBusquedaTorneo] = useState("");

  const [torneosPublicos] = useState<TorneoPublico[]>([
    {
      id: "TRN-PUB001",
      nombre: "Liga Municipal Verano",
      tipoFutbol: "futbol7",
      categoria: "masculino",
      fechaInicio: "2024-07-01",
      fechaCierre: "2024-06-25",
      equiposInscritos: 12,
      maxEquipos: 16
    },
    {
      id: "TRN-PUB002",
      nombre: "Copa Barrios Unidos",
      tipoFutbol: "futbol5",
      categoria: "mixto",
      fechaInicio: "2024-06-20",
      fechaCierre: "2024-06-18",
      equiposInscritos: 8,
      maxEquipos: 12
    },
    {
      id: "TRN-PUB003",
      nombre: "Torneo Empresarial",
      tipoFutbol: "futbol11",
      categoria: "masculino",
      fechaInicio: "2024-08-01",
      fechaCierre: "2024-07-20",
      equiposInscritos: 6,
      maxEquipos: 10
    }
  ]);

  const agregarJugador = () => {
    if (!nuevoJugador.nombre || !nuevoJugador.identificacion || !nuevoJugador.edad) {
      toast.error("Por favor completa todos los campos del jugador");
      return;
    }

    const jugador: Jugador = {
      id: Math.random().toString(36).substr(2, 9),
      ...nuevoJugador,
      seleccionado: false
    };

    setJugadores([...jugadores, jugador]);
    setNuevoJugador({ nombre: "", identificacion: "", edad: "" });
    toast.success("Jugador agregado exitosamente");
  };

  const eliminarJugador = (id: string) => {
    setJugadores(jugadores.filter(j => j.id !== id));
    toast.success("Jugador eliminado");
  };

  const toggleSeleccionJugador = (id: string) => {
    setJugadores(jugadores.map(j => 
      j.id === id ? { ...j, seleccionado: !j.seleccionado } : j
    ));
  };

  const crearEquipo = () => {
    if (!equipoData.nombre) {
      toast.error("Por favor ingresa el nombre del equipo");
      return;
    }

    console.log("Equipo creado:", { ...equipoData, equipoId, jugadores });
    toast.success("¡Equipo creado exitosamente! ID: " + equipoId);
  };

  const aplicarATorneo = () => {
    if (!torneoId) {
      toast.error("Por favor ingresa el ID del torneo");
      return;
    }

    const jugadoresSeleccionados = jugadores.filter(j => j.seleccionado);
    if (jugadoresSeleccionados.length === 0) {
      toast.error("Por favor selecciona al menos un jugador para el torneo");
      return;
    }

    console.log("Aplicando al torneo:", { 
      equipoId, 
      torneoId, 
      jugadoresSeleccionados 
    });
    toast.success(`¡Aplicación enviada al torneo ${torneoId} con ${jugadoresSeleccionados.length} jugadores!`);
  };

  const aplicarATorneoPublico = (torneoId: string) => {
    const jugadoresSeleccionados = jugadores.filter(j => j.seleccionado);
    if (jugadoresSeleccionados.length === 0) {
      toast.error("Por favor selecciona al menos un jugador para el torneo");
      return;
    }

    console.log("Aplicando a torneo público:", { 
      equipoId, 
      torneoId, 
      jugadoresSeleccionados 
    });
    toast.success(`¡Aplicación enviada al torneo ${torneoId}!`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEquipoData({ ...equipoData, logo: file });
      toast.success("Logo cargado exitosamente");
    }
  };

  const torneosPublicosFiltrados = torneosPublicos.filter(torneo =>
    torneo.nombre.toLowerCase().includes(busquedaTorneo.toLowerCase()) ||
    torneo.id.toLowerCase().includes(busquedaTorneo.toLowerCase())
  );

  const agregarCancha = () => {
    if (!nuevaCancha.trim()) {
      toast.error("Por favor ingresa el nombre de la cancha");
      return;
    }

    if (canchasCasa.length >= 3) {
      toast.error("Máximo 3 canchas como casa");
      return;
    }

    setCanchasCasa([...canchasCasa, nuevaCancha]);
    setNuevaCancha("");
    toast.success("Cancha agregada como casa");
  };

  const eliminarCancha = (index: number) => {
    setCanchasCasa(canchasCasa.filter((_, i) => i !== index));
    toast.success("Cancha eliminada");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
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
              <h1 className="text-2xl font-bold text-primary">🟢 Panel de Equipo</h1>
              <p className="text-muted-foreground">Gestiona tu equipo y jugadores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="equipo" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="equipo">Crear Equipo</TabsTrigger>
            <TabsTrigger value="jugadores">Gestionar Jugadores</TabsTrigger>
            <TabsTrigger value="canchas">Canchas Casa</TabsTrigger>
            <TabsTrigger value="torneos-publicos">Torneos Públicos</TabsTrigger>
            <TabsTrigger value="torneo">Aplicar por ID</TabsTrigger>
          </TabsList>

          <TabsContent value="equipo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚽ Crear Equipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombreEquipo">Nombre del Equipo *</Label>
                    <Input
                      id="nombreEquipo"
                      value={equipoData.nombre}
                      onChange={(e) => setEquipoData({...equipoData, nombre: e.target.value})}
                      placeholder="Ej: Águilas FC"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipoId">ID del Equipo</Label>
                    <Input
                      id="equipoId"
                      value={equipoId}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo del Equipo (Opcional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Subir Logo
                    </Button>
                    {equipoData.logo && (
                      <Badge variant="secondary">{equipoData.logo.name}</Badge>
                    )}
                  </div>
                </div>

                <Button onClick={crearEquipo} className="w-full bg-green-600 hover:bg-green-700">
                  ⚽ Crear Equipo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jugadores">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Agregar Nuevo Jugador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombreJugador">Nombre Completo</Label>
                      <Input
                        id="nombreJugador"
                        value={nuevoJugador.nombre}
                        onChange={(e) => setNuevoJugador({...nuevoJugador, nombre: e.target.value})}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="identificacion">Identificación</Label>
                      <Input
                        id="identificacion"
                        value={nuevoJugador.identificacion}
                        onChange={(e) => setNuevoJugador({...nuevoJugador, identificacion: e.target.value})}
                        placeholder="12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edad">Edad</Label>
                      <Input
                        id="edad"
                        type="number"
                        value={nuevoJugador.edad}
                        onChange={(e) => setNuevoJugador({...nuevoJugador, edad: e.target.value})}
                        placeholder="25"
                        min="16"
                        max="50"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={agregarJugador} className="w-full">
                        Agregar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>👥 Lista de Jugadores ({jugadores.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {jugadores.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay jugadores registrados. Agrega jugadores usando el formulario de arriba.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {jugadores.map((jugador) => (
                        <div key={jugador.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={jugador.seleccionado}
                              onCheckedChange={() => toggleSeleccionJugador(jugador.id)}
                            />
                            <div>
                              <p className="font-medium">{jugador.nombre}</p>
                              <p className="text-sm text-muted-foreground">
                                ID: {jugador.identificacion} • Edad: {jugador.edad} años
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => eliminarJugador(jugador.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="canchas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Definir Canchas Casa (2-3 canchas)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <Input
                    value={nuevaCancha}
                    onChange={(e) => setNuevaCancha(e.target.value)}
                    placeholder="Nombre de la cancha (ej: Estadio Municipal)"
                    className="flex-1"
                  />
                  <Button 
                    onClick={agregarCancha} 
                    disabled={canchasCasa.length >= 3}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label>Canchas Casa ({canchasCasa.length}/3)</Label>
                  {canchasCasa.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 border rounded-lg">
                      Define entre 2 y 3 canchas donde tu equipo juega como local
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {canchasCasa.map((cancha, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span>{cancha}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarCancha(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {canchasCasa.length < 2 && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      Se recomienda definir al menos 2 canchas casa para mayor flexibilidad en la programación de partidos.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="torneos-publicos">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Buscar Torneos Públicos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Input
                      value={busquedaTorneo}
                      onChange={(e) => setBusquedaTorneo(e.target.value)}
                      placeholder="Buscar por nombre o ID del torneo..."
                      className="flex-1"
                    />
                  </div>

                  <div className="space-y-4">
                    {torneosPublicosFiltrados.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No se encontraron torneos públicos disponibles
                      </p>
                    ) : (
                      torneosPublicosFiltrados.map((torneo) => (
                        <div key={torneo.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{torneo.nombre}</h4>
                              <p className="text-sm text-muted-foreground">ID: {torneo.id}</p>
                            </div>
                            <Badge className="bg-green-500">
                              {torneo.equiposInscritos}/{torneo.maxEquipos} equipos
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div>
                              <span className="font-medium">Tipo:</span> {torneo.tipoFutbol}
                            </div>
                            <div>
                              <span className="font-medium">Categoría:</span> {torneo.categoria}
                            </div>
                            <div>
                              <span className="font-medium">Inicio:</span> {torneo.fechaInicio}
                            </div>
                            <div>
                              <span className="font-medium">Cierre:</span> {torneo.fechaCierre}
                            </div>
                          </div>

                          <Button 
                            onClick={() => aplicarATorneoPublico(torneo.id)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={torneo.equiposInscritos >= torneo.maxEquipos}
                          >
                            {torneo.equiposInscritos >= torneo.maxEquipos ? "Torneo Lleno" : "Aplicar al Torneo"}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="torneo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏆 Aplicar a Torneo por ID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="idTorneo">ID del Torneo</Label>
                  <Input
                    id="idTorneo"
                    value={torneoId}
                    onChange={(e) => setTorneoId(e.target.value)}
                    placeholder="Ej: TRN-ABC12345"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Jugadores para este Torneo</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecciona qué jugadores participarán en este torneo específico.
                  </p>
                  
                  {jugadores.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4 border rounded-lg">
                      Primero debes agregar jugadores en la pestaña "Gestionar Jugadores"
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {jugadores.map((jugador) => (
                        <div key={jugador.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={jugador.seleccionado}
                            onCheckedChange={() => toggleSeleccionJugador(jugador.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{jugador.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {jugador.identificacion} • {jugador.edad} años
                            </p>
                          </div>
                          {jugador.seleccionado && (
                            <Badge variant="default">Seleccionado</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Jugadores seleccionados:</strong> {jugadores.filter(j => j.seleccionado).length}
                  </p>
                </div>

                <Button onClick={aplicarATorneo} className="w-full bg-green-600 hover:bg-green-700">
                  🏆 Aplicar al Torneo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Equipo;
