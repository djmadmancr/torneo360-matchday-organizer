
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Upload, Search, MapPin, User, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ColorSelector from "@/components/ColorSelector";
import EquipoCard from "@/components/EquipoCard";

interface Equipo {
  id: string;
  nombre: string;
  logo: File | null;
  colores: {
    camiseta: string;
    pantaloneta: string;
    medias: string;
  };
  contactoPrincipal: {
    nombre: string;
    telefono: string;
    email: string;
  };
  fiscalCasa: {
    nombre: string;
    identificacion: string;
    telefono: string;
  };
  jugadores: Jugador[];
  personalTecnico: PersonalTecnico[];
  canchasCasa: string[];
}

interface Jugador {
  id: string;
  nombre: string;
  identificacion: string;
  edad: string;
  seleccionado: boolean;
}

interface PersonalTecnico {
  id: string;
  nombre: string;
  identificacion: string;
  telefono: string;
  rol: "dt" | "asistente";
}

interface TorneoPublico {
  id: string;
  nombre: string;
  tipoFutbol: string;
  categoria: string;
  fechaCierre: string;
  equiposInscritos: number;
  maxEquipos: number;
}

const Equipo = () => {
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<string>("");
  const [mostrarFormularioEquipo, setMostrarFormularioEquipo] = useState(false);
  const [equipoEditando, setEquipoEditando] = useState<string | null>(null);

  const [formEquipo, setFormEquipo] = useState({
    nombre: "",
    logo: null as File | null,
    colores: {
      camiseta: "#FF0000",
      pantaloneta: "#000000", 
      medias: "#FFFFFF"
    },
    contactoPrincipal: {
      nombre: "",
      telefono: "",
      email: ""
    },
    fiscalCasa: {
      nombre: "",
      identificacion: "",
      telefono: ""
    }
  });

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [personalTecnico, setPersonalTecnico] = useState<PersonalTecnico[]>([]);
  const [canchasCasa, setCanchasCasa] = useState<string[]>([]);
  const [nuevaCancha, setNuevaCancha] = useState("");
  
  const [nuevoJugador, setNuevoJugador] = useState({
    nombre: "",
    identificacion: "",
    edad: ""
  });

  const [nuevoPersonal, setNuevoPersonal] = useState({
    nombre: "",
    identificacion: "",
    telefono: "",
    rol: ""
  });

  const [torneoId, setTorneoId] = useState("");
  const [busquedaTorneo, setBusquedaTorneo] = useState("");
  const [mostrarSeleccionJugadores, setMostrarSeleccionJugadores] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState("");

  const [torneosPublicos] = useState<TorneoPublico[]>([
    {
      id: "TRN-PUB001",
      nombre: "Liga Municipal Verano",
      tipoFutbol: "futbol7",
      categoria: "U20",
      fechaCierre: "2024-06-25",
      equiposInscritos: 12,
      maxEquipos: 16
    },
    {
      id: "TRN-PUB002",
      nombre: "Copa Barrios Unidos",
      tipoFutbol: "futbol5",
      categoria: "Mixto",
      fechaCierre: "2024-06-18",
      equiposInscritos: 8,
      maxEquipos: 12
    }
  ]);

  const generarEquipoId = () => {
    return 'EQP-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const crearEquipo = () => {
    if (!formEquipo.nombre) {
      toast.error("Por favor ingresa el nombre del equipo");
      return;
    }

    const nuevoEquipo: Equipo = {
      id: generarEquipoId(),
      ...formEquipo,
      jugadores,
      personalTecnico,
      canchasCasa
    };

    if (equipoEditando) {
      setEquipos(equipos.map(e => e.id === equipoEditando ? nuevoEquipo : e));
      toast.success("Equipo actualizado exitosamente!");
    } else {
      setEquipos([...equipos, nuevoEquipo]);
      toast.success("¡Equipo creado exitosamente! ID: " + nuevoEquipo.id);
    }

    cerrarFormularioEquipo();
  };

  const cerrarFormularioEquipo = () => {
    setMostrarFormularioEquipo(false);
    setEquipoEditando(null);
    setFormEquipo({
      nombre: "",
      logo: null,
      colores: { camiseta: "#FF0000", pantaloneta: "#000000", medias: "#FFFFFF" },
      contactoPrincipal: { nombre: "", telefono: "", email: "" },
      fiscalCasa: { nombre: "", identificacion: "", telefono: "" }
    });
    setJugadores([]);
    setPersonalTecnico([]);
    setCanchasCasa([]);
  };

  const editarEquipo = (equipoId: string) => {
    const equipo = equipos.find(e => e.id === equipoId);
    if (equipo) {
      setEquipoEditando(equipoId);
      setFormEquipo({
        nombre: equipo.nombre,
        logo: equipo.logo,
        colores: equipo.colores,
        contactoPrincipal: equipo.contactoPrincipal,
        fiscalCasa: equipo.fiscalCasa
      });
      setJugadores(equipo.jugadores);
      setPersonalTecnico(equipo.personalTecnico);
      setCanchasCasa(equipo.canchasCasa);
      setMostrarFormularioEquipo(true);
    }
  };

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

  const agregarPersonal = () => {
    if (!nuevoPersonal.nombre || !nuevoPersonal.identificacion || !nuevoPersonal.telefono || !nuevoPersonal.rol) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const personal: PersonalTecnico = {
      id: Math.random().toString(36).substr(2, 9),
      ...nuevoPersonal,
      rol: nuevoPersonal.rol as "dt" | "asistente"
    };

    setPersonalTecnico([...personalTecnico, personal]);
    setNuevoPersonal({ nombre: "", identificacion: "", telefono: "", rol: "" });
    toast.success("Personal técnico agregado exitosamente");
  };

  const eliminarJugador = (id: string) => {
    setJugadores(jugadores.filter(j => j.id !== id));
    toast.success("Jugador eliminado");
  };

  const eliminarPersonal = (id: string) => {
    setPersonalTecnico(personalTecnico.filter(p => p.id !== id));
    toast.success("Personal técnico eliminado");
  };

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

  const aplicarATorneoPublico = (torneoId: string) => {
    if (!equipoSeleccionado) {
      toast.error("Primero debes seleccionar un equipo");
      return;
    }
    
    const equipo = equipos.find(e => e.id === equipoSeleccionado);
    if (!equipo || equipo.jugadores.length === 0) {
      toast.error("El equipo seleccionado debe tener jugadores registrados");
      return;
    }
    
    setTorneoSeleccionado(torneoId);
    setMostrarSeleccionJugadores(true);
  };

  const confirmarAplicacion = () => {
    const equipo = equipos.find(e => e.id === equipoSeleccionado);
    if (!equipo) return;

    const jugadoresSeleccionados = equipo.jugadores.filter(j => j.seleccionado);
    if (jugadoresSeleccionados.length === 0) {
      toast.error("Por favor selecciona al menos un jugador para el torneo");
      return;
    }

    console.log("Aplicando a torneo público:", { 
      equipoId: equipoSeleccionado, 
      torneoId: torneoSeleccionado, 
      jugadoresSeleccionados 
    });
    toast.success(`¡Aplicación enviada al torneo con ${jugadoresSeleccionados.length} jugadores!`);
    setMostrarSeleccionJugadores(false);
    setTorneoSeleccionado("");
  };

  const toggleSeleccionJugador = (jugadorId: string) => {
    if (!equipoSeleccionado) return;
    
    setEquipos(equipos.map(equipo => 
      equipo.id === equipoSeleccionado 
        ? {
            ...equipo,
            jugadores: equipo.jugadores.map(j => 
              j.id === jugadorId ? { ...j, seleccionado: !j.seleccionado } : j
            )
          }
        : equipo
    ));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormEquipo({ ...formEquipo, logo: file });
      toast.success("Logo cargado exitosamente");
    }
  };

  const torneosPublicosFiltrados = torneosPublicos.filter(torneo =>
    torneo.nombre.toLowerCase().includes(busquedaTorneo.toLowerCase()) ||
    torneo.id.toLowerCase().includes(busquedaTorneo.toLowerCase())
  );

  const equipoActual = equipos.find(e => e.id === equipoSeleccionado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
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
              <h1 className="text-xl md:text-2xl font-bold text-primary">🟢 Panel de Equipo</h1>
              <p className="text-sm text-muted-foreground">Gestiona tus equipos y jugadores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <Tabs defaultValue="equipos" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 text-xs md:text-sm">
            <TabsTrigger value="equipos">Equipos</TabsTrigger>
            <TabsTrigger value="torneos-publicos">Torneos</TabsTrigger>
            <TabsTrigger value="torneo-id">Por ID</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="equipos">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold">Mis Equipos</h2>
                <Button 
                  onClick={() => setMostrarFormularioEquipo(true)}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear Equipo
                </Button>
              </div>

              {equipos.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No has creado ningún equipo aún</p>
                    <Button 
                      onClick={() => setMostrarFormularioEquipo(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Crear mi primer equipo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {equipos.map((equipo) => (
                    <EquipoCard
                      key={equipo.id}
                      equipo={{
                        ...equipo,
                        jugadores: equipo.jugadores.length
                      }}
                      onEdit={() => editarEquipo(equipo.id)}
                    />
                  ))}
                </div>
              )}
            </div>
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
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Input
                      value={busquedaTorneo}
                      onChange={(e) => setBusquedaTorneo(e.target.value)}
                      placeholder="Buscar por nombre o ID del torneo..."
                    />
                    
                    {equipos.length > 0 && (
                      <div className="space-y-2">
                        <Label>Seleccionar equipo para aplicar</Label>
                        <Select value={equipoSeleccionado} onValueChange={setEquipoSeleccionado}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un equipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipos.map((equipo) => (
                              <SelectItem key={equipo.id} value={equipo.id}>
                                {equipo.nombre} ({equipo.jugadores.length} jugadores)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {torneosPublicosFiltrados.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No se encontraron torneos públicos disponibles
                      </p>
                    ) : (
                      torneosPublicosFiltrados.map((torneo) => (
                        <div key={torneo.id} className="border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-3">
                            <div>
                              <h4 className="font-semibold text-lg">{torneo.nombre}</h4>
                              <p className="text-sm text-muted-foreground">ID: {torneo.id}</p>
                            </div>
                            <Badge className="bg-green-500">
                              {torneo.equiposInscritos}/{torneo.maxEquipos} equipos
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div><span className="font-medium">Tipo:</span> {torneo.tipoFutbol}</div>
                            <div><span className="font-medium">Categoría:</span> {torneo.categoria}</div>
                            <div><span className="font-medium">Cierre:</span> {torneo.fechaCierre}</div>
                          </div>

                          <Button 
                            onClick={() => aplicarATorneoPublico(torneo.id)}
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                            disabled={torneo.equiposInscritos >= torneo.maxEquipos || !equipoSeleccionado}
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

          <TabsContent value="torneo-id">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏆 Aplicar a Torneo por ID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>ID del Torneo</Label>
                  <Input
                    value={torneoId}
                    onChange={(e) => setTorneoId(e.target.value)}
                    placeholder="Ej: TRN-ABC12345"
                  />
                </div>

                {equipos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Seleccionar equipo</Label>
                    <Select value={equipoSeleccionado} onValueChange={setEquipoSeleccionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipos.map((equipo) => (
                          <SelectItem key={equipo.id} value={equipo.id}>
                            {equipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  onClick={() => {
                    if (!torneoId || !equipoSeleccionado) {
                      toast.error("Por favor completa todos los campos");
                      return;
                    }
                    toast.success(`Aplicación enviada al torneo ${torneoId}`);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!torneoId || !equipoSeleccionado}
                >
                  🏆 Aplicar al Torneo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracion">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Configuración General</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configuraciones adicionales del equipo aparecerán aquí.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de creación/edición de equipo */}
      <Dialog open={mostrarFormularioEquipo} onOpenChange={(open) => !open && cerrarFormularioEquipo()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {equipoEditando ? "Editar Equipo" : "Crear Nuevo Equipo"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nombre del Equipo *</Label>
                <Input
                  value={formEquipo.nombre}
                  onChange={(e) => setFormEquipo({...formEquipo, nombre: e.target.value})}
                  placeholder="Ej: Águilas FC"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo del Equipo</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logoUpload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logoUpload')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Subir Logo
                  </Button>
                  {formEquipo.logo && (
                    <Badge variant="secondary">{formEquipo.logo.name}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Colores del Equipo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ColorSelector
                  label="Color de Camiseta"
                  value={formEquipo.colores.camiseta}
                  onChange={(color) => setFormEquipo({
                    ...formEquipo,
                    colores: { ...formEquipo.colores, camiseta: color }
                  })}
                />
                <ColorSelector
                  label="Color de Pantaloneta"
                  value={formEquipo.colores.pantaloneta}
                  onChange={(color) => setFormEquipo({
                    ...formEquipo,
                    colores: { ...formEquipo.colores, pantaloneta: color }
                  })}
                />
                <ColorSelector
                  label="Color de Medias"
                  value={formEquipo.colores.medias}
                  onChange={(color) => setFormEquipo({
                    ...formEquipo,
                    colores: { ...formEquipo.colores, medias: color }
                  })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Contacto Principal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    value={formEquipo.contactoPrincipal.nombre}
                    onChange={(e) => setFormEquipo({
                      ...formEquipo,
                      contactoPrincipal: { ...formEquipo.contactoPrincipal, nombre: e.target.value }
                    })}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={formEquipo.contactoPrincipal.telefono}
                    onChange={(e) => setFormEquipo({
                      ...formEquipo,
                      contactoPrincipal: { ...formEquipo.contactoPrincipal, telefono: e.target.value }
                    })}
                    placeholder="+57 300 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formEquipo.contactoPrincipal.email}
                    onChange={(e) => setFormEquipo({
                      ...formEquipo,
                      contactoPrincipal: { ...formEquipo.contactoPrincipal, email: e.target.value }
                    })}
                    placeholder="contacto@equipo.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">🔍 Fiscal de Casa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    value={formEquipo.fiscalCasa.nombre}
                    onChange={(e) => setFormEquipo({
                      ...formEquipo,
                      fiscalCasa: { ...formEquipo.fiscalCasa, nombre: e.target.value }
                    })}
                    placeholder="María García"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Identificación</Label>
                  <Input
                    value={formEquipo.fiscalCasa.identificacion}
                    onChange={(e) => setFormEquipo({
                      ...formEquipo,
                      fiscalCasa: { ...formEquipo.fiscalCasa, identificacion: e.target.value }
                    })}
                    placeholder="12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={formEquipo.fiscalCasa.telefono}
                    onChange={(e) => setFormEquipo({
                      ...formEquipo,
                      fiscalCasa: { ...formEquipo.fiscalCasa, telefono: e.target.value }
                    })}
                    placeholder="+57 300 987 6543"
                  />
                </div>
              </div>
            </div>

            {/* Gestión de Jugadores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">👥 Gestión de Jugadores</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  value={nuevoJugador.nombre}
                  onChange={(e) => setNuevoJugador({...nuevoJugador, nombre: e.target.value})}
                  placeholder="Nombre completo"
                />
                <Input
                  value={nuevoJugador.identificacion}
                  onChange={(e) => setNuevoJugador({...nuevoJugador, identificacion: e.target.value})}
                  placeholder="Identificación"
                />
                <Input
                  type="number"
                  value={nuevoJugador.edad}
                  onChange={(e) => setNuevoJugador({...nuevoJugador, edad: e.target.value})}
                  placeholder="Edad"
                  min="16"
                  max="50"
                />
                <Button onClick={agregarJugador} className="w-full">
                  Agregar
                </Button>
              </div>
              
              {jugadores.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {jugadores.map((jugador) => (
                    <div key={jugador.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{jugador.nombre}</span>
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
            </div>

            {/* Gestión de Personal Técnico */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">👨‍💼 Personal Técnico</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  value={nuevoPersonal.nombre}
                  onChange={(e) => setNuevoPersonal({...nuevoPersonal, nombre: e.target.value})}
                  placeholder="Nombre completo"
                />
                <Input
                  value={nuevoPersonal.identificacion}
                  onChange={(e) => setNuevoPersonal({...nuevoPersonal, identificacion: e.target.value})}
                  placeholder="Identificación"
                />
                <Input
                  value={nuevoPersonal.telefono}
                  onChange={(e) => setNuevoPersonal({...nuevoPersonal, telefono: e.target.value})}
                  placeholder="Teléfono"
                />
                <Select 
                  value={nuevoPersonal.rol}
                  onValueChange={(value) => setNuevoPersonal({...nuevoPersonal, rol: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dt">Director Técnico</SelectItem>
                    <SelectItem value="asistente">Asistente Técnico</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={agregarPersonal} className="w-full">
                  Agregar
                </Button>
              </div>

              {personalTecnico.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {personalTecnico.map((personal) => (
                    <div key={personal.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">
                        {personal.nombre} - {personal.rol === "dt" ? "DT" : "Asistente"}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => eliminarPersonal(personal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Canchas Casa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Canchas Casa (2-3 canchas)
              </h3>
              <div className="flex gap-4">
                <Input
                  value={nuevaCancha}
                  onChange={(e) => setNuevaCancha(e.target.value)}
                  placeholder="Nombre de la cancha"
                  className="flex-1"
                />
                <Button 
                  onClick={agregarCancha} 
                  disabled={canchasCasa.length >= 3}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>

              {canchasCasa.length > 0 && (
                <div className="space-y-2">
                  {canchasCasa.map((cancha, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{cancha}</span>
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

            <div className="flex gap-4 pt-6">
              <Button onClick={crearEquipo} className="flex-1 bg-green-600 hover:bg-green-700">
                {equipoEditando ? "Actualizar Equipo" : "Crear Equipo"}
              </Button>
              <Button 
                variant="outline" 
                onClick={cerrarFormularioEquipo}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de selección de jugadores */}
      <Dialog open={mostrarSeleccionJugadores} onOpenChange={setMostrarSeleccionJugadores}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleccionar Jugadores para el Torneo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecciona los jugadores que participarán en este torneo:
            </p>
            
            {equipoActual && equipoActual.jugadores.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No hay jugadores registrados en el equipo
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {equipoActual?.jugadores.map((jugador) => (
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
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Jugadores seleccionados:</strong> {equipoActual?.jugadores.filter(j => j.seleccionado).length || 0}
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={confirmarAplicacion} className="flex-1 bg-green-600 hover:bg-green-700">
                Confirmar Aplicación
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setMostrarSeleccionJugadores(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Equipo;
