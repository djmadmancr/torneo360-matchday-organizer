import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Download, Calendar, BarChart3, Trophy, Bell, User, FileText, CheckCircle, XCircle, Clock, Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EquipoCard from "@/components/EquipoCard";
import UniformeSelector from "@/components/UniformeSelector";

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
  partidosPorSemana: string;
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

const Equipo = () => {
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  const [mostrarFixtures, setMostrarFixtures] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<Torneo | null>(null);
  const [torneoEditando, setTorneoEditando] = useState<string | null>(null);

  const [equipo, setEquipo] = useState({
    id: "EQ-001",
    nombre: "Águilas FC",
    logo: null as File | null,
    uniformes: {
      principal: {
        camiseta: {
          principal: "#1e40af",
          secundario: "#ffffff"
        },
        pantaloneta: "#1e40af",
        medias: "#1e40af"
      },
      alternativo: {
        camiseta: {
          principal: "#ffffff",
          secundario: "#1e40af"
        },
        pantaloneta: "#ffffff",
        medias: "#ffffff"
      }
    },
    colores: {
      camiseta: "#1e40af",
      pantaloneta: "#1e40af", 
      medias: "#1e40af"
    },
    jugadores: 0
  });

  const [perfil, setPerfil] = useState({
    nombre: "Águilas FC",
    logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center",
    encargados: ["Carlos Rodríguez", "Ana Martínez"],
    email: "info@aguilasfc.com",
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
      partidosPorSemana: "2",
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
      partidosPorSemana: "3",
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
      partidosPorSemana: "4",
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEquipo(prevState => ({ ...prevState, logo: file }));
    }
  };

  const handleUniformeChange = (colores: { camiseta: string; pantaloneta: string; medias: string }, uniformeType: 'principal' | 'alternativo') => {
    setEquipo(prevState => ({
      ...prevState,
      uniformes: {
        ...prevState.uniformes,
        [uniformeType]: {
          ...prevState.uniformes[uniformeType],
          camiseta: { ...prevState.uniformes[uniformeType].camiseta, principal: colores.camiseta },
          pantaloneta: colores.pantaloneta,
          medias: colores.medias
        }
      },
      colores: {
        camiseta: colores.camiseta,
        pantaloneta: colores.pantaloneta,
        medias: colores.medias
      }
    }));
  };

  const equipoParaCard = {
    id: equipo.id,
    nombre: equipo.nombre,
    logo: equipo.logo ? URL.createObjectURL(equipo.logo) : "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center",
    colores: equipo.colores,
    jugadores: equipo.jugadores
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
                  <h1 className="text-xl md:text-2xl font-bold text-primary">🔵 Panel del Equipo</h1>
                  <p className="text-sm text-muted-foreground">Gestiona tu equipo y perfil</p>
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
        <Tabs defaultValue="perfil" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 text-xs md:text-sm">
            <TabsTrigger value="perfil">Perfil del Equipo</TabsTrigger>
            <TabsTrigger value="uniformes">Uniformes</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Información del Equipo</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Equipo</Label>
                    <Input
                      type="text"
                      id="nombre"
                      value={equipo.nombre}
                      onChange={(e) => setEquipo(prevState => ({ ...prevState, nombre: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo del Equipo</Label>
                    <Input
                      type="file"
                      id="logo"
                      onChange={handleLogoChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jugadores">Número de Jugadores</Label>
                    <Input
                      type="number"
                      id="jugadores"
                      value={equipo.jugadores}
                      onChange={(e) => setEquipo(prevState => ({ ...prevState, jugadores: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
                <EquipoCard 
                  equipo={equipoParaCard}
                  onEdit={() => {}}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="uniformes">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Uniforme Principal</h3>
                <UniformeSelector
                  colores={{
                    camiseta: equipo.uniformes.principal.camiseta.principal,
                    pantaloneta: equipo.uniformes.principal.pantaloneta,
                    medias: equipo.uniformes.principal.medias
                  }}
                  onChange={(colores) => handleUniformeChange(colores, 'principal')}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Uniforme Alternativo</h3>
                <UniformeSelector
                  colores={{
                    camiseta: equipo.uniformes.alternativo.camiseta.principal,
                    pantaloneta: equipo.uniformes.alternativo.pantaloneta,
                    medias: equipo.uniformes.alternativo.medias
                  }}
                  onChange={(colores) => handleUniformeChange(colores, 'alternativo')}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
    </div>
  );
};

export default Equipo;
