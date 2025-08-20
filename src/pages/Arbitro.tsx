import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Calendar, Clock, MapPin, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Partido {
  id: string;
  equipoLocal: string;
  equipoVisitante: string;
  fecha: string;
  hora: string;
  cancha: string;
  logoLocal: string;
  logoVisitante: string;
  torneo: string;
  categoria: string;
  estado: "programado" | "en_curso" | "finalizado";
}

const Arbitro = () => {
  const navigate = useNavigate();
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<Partido | null>(null);
  const [mostrarFormularioResultado, setMostrarFormularioResultado] = useState(false);
  const [informeArbitral, setInformeArbitral] = useState<File | null>(null);
  
  const [resultado, setResultado] = useState({
    golesLocal: "",
    golesVisitante: "",
    observaciones: "",
    tarjetasAmarillas: "",
    tarjetasRojas: "",
    jugadorDestacado: ""
  });

  const [partidos] = useState<Partido[]>([
    {
      id: "P001",
      equipoLocal: "Águilas FC",
      equipoVisitante: "Tigres SC",
      fecha: "2024-06-20",
      hora: "16:00",
      cancha: "Cancha Principal",
      logoLocal: "🦅",
      logoVisitante: "🐅",
      torneo: "Copa Primavera 2024",
      categoria: "U20",
      estado: "programado"
    },
    {
      id: "P002",
      equipoLocal: "Leones United",
      equipoVisitante: "Pumas FC",
      fecha: "2024-06-20",
      hora: "18:00",
      cancha: "Cancha 2",
      logoLocal: "🦁",
      logoVisitante: "🐆",
      torneo: "Liga Municipal Otoño",
      categoria: "Libre",
      estado: "en_curso"
    },
    {
      id: "P003",
      equipoLocal: "Halcones FC",
      equipoVisitante: "Lobos SC",
      fecha: "2024-06-21",
      hora: "15:00",
      cancha: "Cancha Principal",
      logoLocal: "🦅",
      logoVisitante: "🐺",
      torneo: "Torneo Relámpago Verano",
      categoria: "U17",
      estado: "programado"
    }
  ]);

  const seleccionarPartido = (partido: Partido) => {
    setPartidoSeleccionado(partido);
    setMostrarFormularioResultado(true);
    setResultado({
      golesLocal: "",
      golesVisitante: "",
      observaciones: "",
      tarjetasAmarillas: "",
      tarjetasRojas: "",
      jugadorDestacado: ""
    });
    setInformeArbitral(null);
  };

  const handleInformeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInformeArbitral(file);
      toast.success("Informe arbitral cargado correctamente");
    }
  };

  const enviarResultado = () => {
    if (!partidoSeleccionado) return;
    
    if (!resultado.golesLocal || !resultado.golesVisitante) {
      toast.error("Por favor ingresa el resultado del partido");
      return;
    }

    if (!informeArbitral) {
      toast.error("Por favor adjunta el informe arbitral");
      return;
    }

    const resultadoFinal = {
      partidoId: partidoSeleccionado.id,
      equipoLocal: partidoSeleccionado.equipoLocal,
      equipoVisitante: partidoSeleccionado.equipoVisitante,
      golesLocal: parseInt(resultado.golesLocal),
      golesVisitante: parseInt(resultado.golesVisitante),
      observaciones: resultado.observaciones,
      tarjetasAmarillas: resultado.tarjetasAmarillas,
      tarjetasRojas: resultado.tarjetasRojas,
      jugadorDestacado: resultado.jugadorDestacado,
      informeArbitral: informeArbitral.name,
      fecha: new Date().toISOString()
    };

    console.log("Resultado enviado:", resultadoFinal);
    toast.success(`Resultado enviado: ${partidoSeleccionado.equipoLocal} ${resultado.golesLocal} - ${resultado.golesVisitante} ${partidoSeleccionado.equipoVisitante}`);
    
    setMostrarFormularioResultado(false);
    setPartidoSeleccionado(null);
  };

  const cerrarModal = () => {
    setMostrarFormularioResultado(false);
    setPartidoSeleccionado(null);
    setResultado({
      golesLocal: "",
      golesVisitante: "",
      observaciones: "",
      tarjetasAmarillas: "",
      tarjetasRojas: "",
      jugadorDestacado: ""
    });
    setInformeArbitral(null);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "programado":
        return <Badge className="bg-blue-500">Programado</Badge>;
      case "en_curso":
        return <Badge className="bg-green-500">En Curso</Badge>;
      case "finalizado":
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const puedeEnviarResultado = resultado.golesLocal && resultado.golesVisitante && informeArbitral;

  return (
    <div className="min-h-screen relative" style={{ 
      backgroundImage: `var(--admin-overlay), var(--admin-gradient)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
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
              <h1 className="text-xl md:text-2xl font-bold text-primary">🟠 Panel de Árbitro</h1>
              <p className="text-sm text-muted-foreground">Registra los resultados de los partidos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold">Partidos Disponibles</h2>
            <Badge variant="outline" className="text-sm">
              {partidos.filter(p => p.estado !== "finalizado").length} partidos pendientes
            </Badge>
          </div>

          <div className="grid gap-6">
            {partidos.map((partido) => (
              <Card key={partido.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg">{partido.torneo}</CardTitle>
                      <p className="text-sm text-muted-foreground">Categoría: {partido.categoria}</p>
                    </div>
                    {getEstadoBadge(partido.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Equipos */}
                    <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-2xl">{partido.logoLocal}</span>
                          <span className="font-semibold text-lg">{partido.equipoLocal}</span>
                        </div>
                      </div>
                      
                      <div className="text-center px-4">
                        <span className="text-2xl font-bold text-gray-500">VS</span>
                      </div>
                      
                      <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="font-semibold text-lg">{partido.equipoVisitante}</span>
                          <span className="text-2xl">{partido.logoVisitante}</span>
                        </div>
                      </div>
                    </div>

                    {/* Información del partido */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{partido.fecha}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{partido.hora}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{partido.cancha}</span>
                      </div>
                    </div>

                    {/* ID del partido */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">ID del Partido:</span> {partido.id}
                      </p>
                    </div>

                    {/* Botón de acción */}
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => seleccionarPartido(partido)}
                        className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                        disabled={partido.estado === "finalizado"}
                      >
                        <FileText className="w-4 h-4" />
                        {partido.estado === "finalizado" ? "Finalizado" : "Registrar Resultado"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de registro de resultado */}
      <Dialog open={mostrarFormularioResultado} onOpenChange={cerrarModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Registrar Resultado del Partido
            </DialogTitle>
          </DialogHeader>
          
          {partidoSeleccionado && (
            <div className="space-y-6">
              {/* Información del partido */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{partidoSeleccionado.logoLocal}</span>
                      <span className="font-semibold">{partidoSeleccionado.equipoLocal}</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold">VS</span>
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{partidoSeleccionado.equipoVisitante}</span>
                      <span className="text-xl">{partidoSeleccionado.logoVisitante}</span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  <p><strong>ID:</strong> {partidoSeleccionado.id}</p>
                  <p>{partidoSeleccionado.fecha} - {partidoSeleccionado.hora} - {partidoSeleccionado.cancha}</p>
                  <p>{partidoSeleccionado.torneo} ({partidoSeleccionado.categoria})</p>
                </div>
              </div>

              {/* Formulario de resultado */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Goles {partidoSeleccionado.equipoLocal} *</Label>
                    <Input
                      type="number"
                      value={resultado.golesLocal}
                      onChange={(e) => setResultado({...resultado, golesLocal: e.target.value})}
                      placeholder="0"
                      min="0"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goles {partidoSeleccionado.equipoVisitante} *</Label>
                    <Input
                      type="number"
                      value={resultado.golesVisitante}
                      onChange={(e) => setResultado({...resultado, golesVisitante: e.target.value})}
                      placeholder="0"
                      min="0"
                      max="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tarjetas Amarillas</Label>
                    <Input
                      value={resultado.tarjetasAmarillas}
                      onChange={(e) => setResultado({...resultado, tarjetasAmarillas: e.target.value})}
                      placeholder="Ej: Juan Pérez (15'), María López (45')"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tarjetas Rojas</Label>
                    <Input
                      value={resultado.tarjetasRojas}
                      onChange={(e) => setResultado({...resultado, tarjetasRojas: e.target.value})}
                      placeholder="Ej: Carlos Ruiz (67')"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Jugador Destacado</Label>
                  <Input
                    value={resultado.jugadorDestacado}
                    onChange={(e) => setResultado({...resultado, jugadorDestacado: e.target.value})}
                    placeholder="Nombre del jugador más destacado del partido"
                  />
                </div>

                {/* Informe Arbitral */}
                <div className="space-y-2">
                  <Label>Informe Arbitral *</Label>
                  <div className="flex items-center gap-4">
                    {informeArbitral && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="w-4 h-4" />
                        <span>{informeArbitral.name}</span>
                      </div>
                    )}
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="informe-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {informeArbitral ? 'Cambiar Archivo' : 'Subir Informe'}
                        <input
                          id="informe-upload"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleInformeChange}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formatos permitidos: PDF, DOC, DOCX, TXT
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <textarea
                    className="w-full p-3 border rounded-md resize-none"
                    rows={4}
                    value={resultado.observaciones}
                    onChange={(e) => setResultado({...resultado, observaciones: e.target.value})}
                    placeholder="Observaciones adicionales del partido (incidentes, lesiones, etc.)"
                  />
                </div>
              </div>

              {/* Vista previa del resultado */}
              {resultado.golesLocal && resultado.golesVisitante && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Vista previa del resultado:</h4>
                  <p className="text-lg font-bold text-center">
                    {partidoSeleccionado.equipoLocal} {resultado.golesLocal} - {resultado.golesVisitante} {partidoSeleccionado.equipoVisitante}
                  </p>
                  {informeArbitral && (
                    <p className="text-sm text-center text-green-600 mt-2">
                      ✓ Informe arbitral adjunto: {informeArbitral.name}
                    </p>
                  )}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4">
                <Button 
                  onClick={enviarResultado} 
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  disabled={!puedeEnviarResultado}
                >
                  📤 Enviar Resultado
                </Button>
                <Button 
                  variant="outline" 
                  onClick={cerrarModal}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Arbitro;