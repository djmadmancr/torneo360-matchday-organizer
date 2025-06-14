import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { 
  User, ArrowLeft, Bell, FileText, Edit, Plus,
  Trophy, Calendar, MapPin, Users, Clock, Star
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { User as UserType, EquipoPerfil } from "@/types/auth";
import TorneosPublicos from "@/components/TorneosPublicos";
import TorneosInscritos from "@/components/TorneosInscritos";
import EstadisticasEquipo from "@/components/EstadisticasEquipo";
import EditarPerfilEquipo from "@/components/EditarPerfilEquipo";
import NotificacionesEquipo from "@/components/NotificacionesEquipo";
import SeleccionJugadoresModal from "@/components/SeleccionJugadoresModal";
import { useLogs } from "@/hooks/useLogs";

interface TorneoPublico {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  formato: string;
  fechaInicio: string;
  fechaFin: string;
  fechaCierre: string;
  logo: string;
  maxEquipos: number;
  equiposInscritos: number;
  estado: string;
  organizadorNombre: string;
  organizadorId: string;
  esPublico: boolean;
  edadMinima?: number;
  edadMaxima?: number;
  descripcion?: string;
  ubicacion?: string;
}

interface Notificacion {
  id: string;
  tipo: "inscripcion" | "reprogramacion" | "otra" | "aprobacion" | "rechazo";
  titulo: string;
  mensaje: string;
  fecha: string;
  equipoSolicitante?: string;
  torneoId?: string;
  partidoId?: string;
  accionRequerida: boolean;
  equipoId?: string;
  mensajeEquipo?: string;
}

const Equipo = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const equipoPerfil = user?.perfiles?.equipo as EquipoPerfil;
  const { logs, addLog } = useLogs(user?.id || '');

  const [perfil, setPerfil] = React.useState<{
    nombreEquipo: string;
    logo: string;
    colores: {
      principal: string;
      secundario: string;
    };
    categoria: string;
    entrenador: string;
    jugadores: { id: string; nombre: string; posicion: string; numeroIdentificacion: string; edad: number; }[];
    coaches: { nombre: string; tipo: "entrenador" | "asistente"; numeroIdentificacion: string; }[];
    torneos: string[];
  }>({
    nombreEquipo: equipoPerfil?.nombreEquipo || user?.nombre || "Equipo Sin Nombre",
    logo: equipoPerfil?.logo || "https://images.unsplash.com/photo-1517620055442-e394f29128c3?w=50&h=50&fit=crop&crop=center",
    colores: equipoPerfil?.colores || {
      principal: "#2563eb",
      secundario: "#ffffff"
    },
    categoria: equipoPerfil?.categoria || "Libre",
    entrenador: equipoPerfil?.entrenador || "Sin Entrenador",
    jugadores: equipoPerfil?.jugadores || [],
    coaches: equipoPerfil?.coaches || [],
    torneos: equipoPerfil?.torneos || []
  });

  const [mostrarEditarPerfil, setMostrarEditarPerfil] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    const savedNotificaciones = localStorage.getItem('notificacionesEquipo');
    const allNotificaciones = savedNotificaciones ? JSON.parse(savedNotificaciones) : [];
    return allNotificaciones.filter((n: any) => n.equipoId === user?.id);
  });
  const [mostrarLogs, setMostrarLogs] = useState(false);
  const [mostrarSeleccionJugadores, setMostrarSeleccionJugadores] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<any>(null);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<string[]>([]);
  const [torneosInscritos, setTorneosInscritos] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id && equipoPerfil) {
      setPerfil({
        nombreEquipo: equipoPerfil?.nombreEquipo || user?.nombre || "Equipo Sin Nombre",
        logo: equipoPerfil?.logo || "https://images.unsplash.com/photo-1517620055442-e394f29128c3?w=50&h=50&fit=crop&crop=center",
        colores: equipoPerfil?.colores || {
          principal: "#2563eb",
          secundario: "#ffffff"
        },
        categoria: equipoPerfil?.categoria || "Libre",
        entrenador: equipoPerfil?.entrenador || "Sin Entrenador",
        jugadores: equipoPerfil?.jugadores || [],
        coaches: equipoPerfil?.coaches || [],
        torneos: equipoPerfil?.torneos || []
      });
    }
  }, [user?.id, equipoPerfil]);

  useEffect(() => {
    const actualizarNotificaciones = () => {
      const savedNotificaciones = localStorage.getItem('notificacionesEquipo');
      const allNotificaciones = savedNotificaciones ? JSON.parse(savedNotificaciones) : [];
      setNotificaciones(allNotificaciones.filter((n: any) => n.equipoId === user?.id));
    };

    actualizarNotificaciones();
    const interval = setInterval(actualizarNotificaciones, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    // Cargar solicitudes pendientes
    const cargarSolicitudesPendientes = () => {
      const solicitudes = JSON.parse(localStorage.getItem('notificaciones') || '[]');
      const solicitudesEquipo = solicitudes.filter((s: any) => 
        s.equipoId === user?.id && 
        s.tipo === 'inscripcion' && 
        s.accionRequerida === true
      );
      setSolicitudesPendientes(solicitudesEquipo.map((s: any) => s.torneoId));
    };

    cargarSolicitudesPendientes();
    const interval = setInterval(cargarSolicitudesPendientes, 3000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    // Cargar torneos donde el equipo fue aceptado
    const cargarTorneosInscritos = () => {
      const notificaciones = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
      const solicitudesAceptadas = notificaciones.filter((n: any) => 
        n.equipoId === user?.id && 
        n.tipo === 'aprobacion'
      );
      const torneosIds = solicitudesAceptadas.map((s: any) => s.torneoId);
      setTorneosInscritos(torneosIds);
    };

    cargarTorneosInscritos();
    const interval = setInterval(cargarTorneosInscritos, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const guardarPerfil = () => {
    if (equipoPerfil) {
      updateUserProfile('equipo', {
        ...equipoPerfil,
        nombreEquipo: perfil.nombreEquipo,
        logo: perfil.logo,
        colores: perfil.colores,
        categoria: perfil.categoria,
        entrenador: perfil.entrenador,
        jugadores: perfil.jugadores,
        coaches: perfil.coaches
      });
      addLog('Actualizar Perfil', 'Perfil de equipo actualizado', 'edicion', 'perfil');
      toast.success('Perfil actualizado exitosamente');
    }
  };

  const inscribirseATorneo = (torneo: any) => {
    // Validar categoría
    if (torneo.categoria !== perfil.categoria && torneo.categoria !== 'Libre') {
      toast.error(`Tu equipo no cumple con la categoría requerida: ${torneo.categoria}`);
      return;
    }

    // Validar que tenga jugadores y staff
    if (perfil.jugadores.length === 0) {
      toast.error('Debes agregar jugadores antes de inscribirte a un torneo');
      return;
    }

    if (perfil.coaches.length === 0) {
      toast.error('Debes agregar al menos un entrenador antes de inscribirte');
      return;
    }

    // Abrir modal de selección
    setTorneoSeleccionado(torneo);
    setMostrarSeleccionJugadores(true);
  };

  const confirmarInscripcion = (jugadoresSeleccionados: any[], staffSeleccionado: any[]) => {
    if (!torneoSeleccionado) return;

    // Crear solicitud de inscripción con jugadores y staff seleccionados
    const solicitud = {
      id: `SOL-${Date.now()}`,
      tipo: 'inscripcion',
      titulo: 'Nueva Solicitud de Inscripción',
      mensaje: `${perfil.nombreEquipo} solicita inscribirse a ${torneoSeleccionado.nombre}`,
      fecha: new Date().toISOString().split('T')[0],
      equipoSolicitante: perfil.nombreEquipo,
      equipoId: user?.id,
      torneoId: torneoSeleccionado.id,
      organizadorId: torneoSeleccionado.organizadorId,
      accionRequerida: true,
      mensajeEquipo: `Equipo: ${perfil.nombreEquipo}, Categoría: ${perfil.categoria}`,
      jugadoresInscritos: jugadoresSeleccionados,
      staffInscrito: staffSeleccionado,
      detallesCompletos: {
        equipo: {
          nombre: perfil.nombreEquipo,
          logo: perfil.logo,
          categoria: perfil.categoria,
          colores: perfil.colores
        },
        jugadores: jugadoresSeleccionados,
        staff: staffSeleccionado,
        fechaSolicitud: new Date().toISOString()
      }
    };

    const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    notificaciones.push(solicitud);
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));

    addLog('Solicitar Inscripción', `Solicitud enviada para torneo "${torneoSeleccionado.nombre}" con ${jugadoresSeleccionados.length} jugadores y ${staffSeleccionado.length} staff`, 'inscripcion', 'torneo', torneoSeleccionado.id);
    toast.success(`Solicitud de inscripción enviada para "${torneoSeleccionado.nombre}"`);
    
    setTorneoSeleccionado(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
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
                  alt={perfil.nombreEquipo}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-primary">{perfil.nombreEquipo}</h1>
                  <p className="text-sm text-muted-foreground">Equipo de Fútbol</p>
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
                onClick={() => setMostrarLogs(true)}
              >
                <FileText className="w-4 h-4" />
                Logs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarEditarPerfil(true)}
              >
                <User className="w-4 h-4" />
                Perfil
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        <Tabs defaultValue="torneos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="torneos">Torneos Públicos</TabsTrigger>
            <TabsTrigger value="mis-torneos">Mis Torneos</TabsTrigger>
            <TabsTrigger value="mi-equipo">Mi Equipo</TabsTrigger>
          </TabsList>

          <TabsContent value="torneos">
            <TorneosPublicos 
              onInscribirse={inscribirseATorneo} 
              equipoCategoria={perfil.categoria}
              solicitudesPendientes={solicitudesPendientes}
              torneosInscritos={torneosInscritos}
            />
          </TabsContent>

          <TabsContent value="mis-torneos">
            <TorneosInscritos 
              equipoId={user?.id || ''} 
              equipoNombre={perfil.nombreEquipo}
            />
          </TabsContent>

          <TabsContent value="mi-equipo">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Información de mi Equipo</h2>
              
              {/* Información básica del equipo */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Equipo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={perfil.logo} 
                      alt={perfil.nombreEquipo}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{perfil.nombreEquipo}</h3>
                      <p className="text-sm text-muted-foreground">Categoría: {perfil.categoria}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Entrenador</Label>
                      <Input value={perfil.entrenador} readOnly />
                    </div>
                    <div>
                      <Label>Jugadores</Label>
                      <Input value={perfil.jugadores.length.toString()} readOnly />
                    </div>
                  </div>
                  <Button onClick={() => setMostrarEditarPerfil(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </CardContent>
              </Card>

              {/* Estadísticas del equipo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Estadísticas del Equipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EstadisticasEquipo 
                    equipoId={user?.id || ''} 
                    equipoNombre={perfil.nombreEquipo}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Logs */}
      <Dialog open={mostrarLogs} onOpenChange={setMostrarLogs}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Registro de Actividades</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay actividades registradas
                </p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          log.tipo === "creacion" ? "default" :
                          log.tipo === "edicion" ? "secondary" :
                          log.tipo === "inscripcion" ? "default" :
                          log.tipo === "aprobacion" ? "default" : "outline"
                        }>
                          {log.tipo}
                        </Badge>
                        <span className="font-medium">{log.accion}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {log.fecha} - {log.hora}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{log.detalles}</p>
                    {log.entidad && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.entidad}: {log.entidadId}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Perfil */}
      <EditarPerfilEquipo
        open={mostrarEditarPerfil}
        onClose={() => setMostrarEditarPerfil(false)}
        perfil={perfil}
        setPerfil={setPerfil}
        guardarPerfil={guardarPerfil}
      />

      {/* Modal Notificaciones */}
      <NotificacionesEquipo
        open={mostrarNotificaciones}
        onClose={() => setMostrarNotificaciones(false)}
        notificaciones={notificaciones}
        setNotificaciones={setNotificaciones}
      />

      {/* Modal Selección de Jugadores */}
      <SeleccionJugadoresModal
        open={mostrarSeleccionJugadores}
        onClose={() => setMostrarSeleccionJugadores(false)}
        torneo={torneoSeleccionado}
        jugadores={perfil.jugadores}
        coaches={perfil.coaches}
        onConfirmarInscripcion={confirmarInscripcion}
      />
    </div>
  );
};

export default Equipo;
