
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
  User, Trophy, Users, BarChart3, ArrowLeft, LogOut, Plus, Edit, 
  Calendar, MapPin, Upload, Eye, TrendingUp, Bell, Download, CheckCircle, XCircle, Play
} from "lucide-react";
import { toast } from "sonner";
import TorneoFormModal from "@/components/TorneoFormModal";
import TorneoEstadisticas from "@/components/TorneoEstadisticas";
import OrganizadorDashboard from "@/components/OrganizadorDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { User as UserType, OrganizadorPerfil } from "@/types/auth";
import FixtureGenerator from "@/components/FixtureGenerator";
import ReportDownloader from "@/components/ReportDownloader";
import { useLogs } from "@/hooks/useLogs";

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
  esPublico?: boolean;
  edadMinima?: number;
  edadMaxima?: number;
  descripcion?: string;
  ubicacion?: string;
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
  torneosInscritos: string[];
  estadisticasPorTorneo: { [torneoId: string]: { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number; posicion: number } };
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

const Organizador = () => {
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [mostrarFixture, setMostrarFixture] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<Torneo | null>(null);
  const [torneoEditando, setTorneoEditando] = useState<string | null>(null);

  const { user, updateUserProfile } = useAuth();
  const organizadorPerfil = user?.perfiles?.organizador as OrganizadorPerfil;
  const { logs, addLog } = useLogs(user?.id || '');
  
  const [perfil, setPerfil] = useState<{
    nombre: string;
    logo: string;
    encargados: string[];
    email: string;
    telefono: string;
  }>({
    nombre: organizadorPerfil?.nombreOrganizacion || user?.nombre || "Liga Municipal de Fútbol",
    logo: organizadorPerfil?.logo || "https://images.unsplash.com/photo-1614632537190-23e4b93dc25e?w=100&h=100&fit=crop&crop=center",
    encargados: ["Carlos Rodríguez", "Ana Martínez"],
    email: user?.email || "admin@ligamunicipal.com",
    telefono: organizadorPerfil?.telefono || "+57 300 123 4567"
  });

  // Estado de torneos específico del usuario con datos demo
  const [torneos, setTorneos] = useState<Torneo[]>(() => {
    const savedTorneos = localStorage.getItem(`torneos_${user?.id}`);
    if (savedTorneos) {
      return JSON.parse(savedTorneos);
    }
    
    // Torneos demo para el organizador
    const torneosDemo: Torneo[] = [
      {
        id: "TRN-001",
        nombre: "Copa Primavera 2024",
        categoria: "Primera División",
        tipo: "Fútbol 11",
        formato: "Grupos + Eliminatorio",
        fechaInicio: "2024-07-01",
        fechaFin: "2024-07-31",
        logo: "https://images.unsplash.com/photo-1614632537190-23e4b93dc25e?w=100&h=100&fit=crop&crop=center",
        maxEquipos: 16,
        equiposInscritos: 8,
        estado: "inscripciones_abiertas",
        fechaCierre: "2024-06-25",
        puntajeExtra: "Gol de visitante",
        idaVuelta: { grupos: true, eliminatoria: false },
        diasSemana: ["sabado", "domingo"],
        partidosPorSemana: "4",
        fechaCreacion: "2024-06-01",
        esPublico: true,
        edadMinima: 18,
        edadMaxima: 35,
        descripcion: "Torneo de fútbol profesional para equipos de primera división",
        ubicacion: "Estadio Municipal Central"
      },
      {
        id: "TRN-002",
        nombre: "Liga Juvenil Verano",
        categoria: "Sub-20",
        tipo: "Fútbol 7",
        formato: "Todos contra Todos",
        fechaInicio: "2024-06-15",
        fechaFin: "2024-08-15",
        logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop&crop=center",
        maxEquipos: 12,
        equiposInscritos: 6,
        estado: "inscripciones_abiertas",
        fechaCierre: "2024-06-20",
        puntajeExtra: "Fair Play",
        idaVuelta: { grupos: false, eliminatoria: false },
        diasSemana: ["viernes", "sabado"],
        partidosPorSemana: "3",
        fechaCreacion: "2024-05-15",
        esPublico: true,
        edadMinima: 16,
        edadMaxima: 20,
        descripcion: "Liga para jóvenes talentos del fútbol local",
        ubicacion: "Complejo Deportivo Norte"
      }
    ];
    
    return torneosDemo;
  });

  // Estado de notificaciones específico del usuario
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    const savedNotificaciones = localStorage.getItem('notificaciones');
    const allNotificaciones = savedNotificaciones ? JSON.parse(savedNotificaciones) : [];
    return allNotificaciones.filter((n: any) => n.organizadorId === user?.id);
  });

  // Efecto para guardar torneos cuando cambien
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`torneos_${user.id}`, JSON.stringify(torneos));
      
      // También actualizar torneos públicos
      const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
      const torneosPublicosActualizados = torneosPublicos.filter((t: any) => t.organizadorId !== user.id);
      const torneosPublicosNuevos = torneos
        .filter(t => t.esPublico)
        .map(t => ({
          ...t,
          organizadorId: user.id,
          organizadorNombre: perfil.nombre
        }));
      
      localStorage.setItem('torneosPublicos', JSON.stringify([...torneosPublicosActualizados, ...torneosPublicosNuevos]));
    }
  }, [torneos, user?.id, perfil.nombre]);

  // Efecto para actualizar notificaciones periódicamente
  useEffect(() => {
    const actualizarNotificaciones = () => {
      const savedNotificaciones = localStorage.getItem('notificaciones');
      const allNotificaciones = savedNotificaciones ? JSON.parse(savedNotificaciones) : [];
      setNotificaciones(allNotificaciones.filter((n: any) => n.organizadorId === user?.id));
    };

    actualizarNotificaciones();
    const interval = setInterval(actualizarNotificaciones, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, [user?.id]);

  const generarIdTorneo = () => {
    const numeroAleatorio = Math.floor(Math.random() * 900) + 100;
    return `TRN-${numeroAleatorio}`;
  };

  const handleCrearTorneo = (data: any) => {
    if (torneoEditando) {
      // Editar torneo existente
      setTorneos(prev => prev.map(torneo => 
        torneo.id === torneoEditando 
          ? {
              ...torneo,
              nombre: data.nombreTorneo,
              categoria: data.categoria,
              tipo: data.tipoFutbol,
              formato: data.formato,
              fechaInicio: data.fechaInicio || torneo.fechaInicio,
              fechaFin: data.fechaFin || torneo.fechaFin,
              logo: data.logo || torneo.logo,
              maxEquipos: data.maxEquipos || torneo.maxEquipos,
              fechaCierre: data.fechaCierre,
              puntajeExtra: data.puntajeExtra,
              idaVuelta: data.idaVuelta,
              diasSemana: data.diasSemana,
              partidosPorSemana: data.partidosPorSemana,
              esPublico: data.esPublico || false,
              edadMinima: data.edadMinima,
              edadMaxima: data.edadMaxima,
              descripcion: data.descripcion,
              ubicacion: data.ubicacion
            }
          : torneo
      ));
      addLog('Editar Torneo', `Torneo "${data.nombreTorneo}" actualizado`, 'edicion', 'torneo', torneoEditando);
      toast.success("Torneo actualizado exitosamente");
    } else {
      // Crear nuevo torneo
      const nuevoTorneo: Torneo = {
        id: data.torneoId,
        nombre: data.nombreTorneo,
        categoria: data.categoria,
        tipo: data.tipoFutbol,
        formato: data.formato,
        fechaInicio: data.fechaInicio || "",
        fechaFin: data.fechaFin || "",
        logo: data.logo || "https://images.unsplash.com/photo-1614632537190-23e4b93dc25e?w=100&h=100&fit=crop&crop=center",
        maxEquipos: data.maxEquipos || 16,
        equiposInscritos: 0,
        estado: "inscripciones_abiertas",
        fechaCierre: data.fechaCierre,
        puntajeExtra: data.puntajeExtra,
        idaVuelta: data.idaVuelta,
        diasSemana: data.diasSemana,
        partidosPorSemana: data.partidosPorSemana,
        fechaCreacion: new Date().toISOString().split('T')[0],
        esPublico: data.esPublico || false,
        edadMinima: data.edadMinima,
        edadMaxima: data.edadMaxima,
        descripcion: data.descripcion,
        ubicacion: data.ubicacion
      };

      setTorneos(prev => [...prev, nuevoTorneo]);
      addLog('Crear Torneo', `Torneo "${data.nombreTorneo}" creado`, 'creacion', 'torneo', data.torneoId);
      toast.success("Torneo creado exitosamente");
    }
  };

  const handleEditarTorneo = (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo) return;

    if (torneo.estado === "en_curso" || torneo.estado === "finalizado") {
      toast.error("No se puede editar un torneo que ya ha iniciado o finalizado");
      return;
    }

    setTorneoEditando(torneoId);
    setMostrarFormulario(true);
    addLog('Editar Torneo', `Iniciando edición del torneo "${torneo.nombre}"`, 'edicion', 'torneo', torneoId);
  };

  const handleIniciarTorneo = (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    setTorneos(prev => prev.map(torneo => 
      torneo.id === torneoId 
        ? { ...torneo, estado: "en_curso" as const }
        : torneo
    ));
    addLog('Iniciar Torneo', `Torneo "${torneo?.nombre}" iniciado`, 'inicio', 'torneo', torneoId);
    toast.success("Torneo iniciado exitosamente");
  };

  const handleCerrarInscripciones = (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    setTorneos(prev => prev.map(torneo => 
      torneo.id === torneoId 
        ? { ...torneo, estado: "inscripciones_cerradas" as const }
        : torneo
    ));
    addLog('Cerrar Inscripciones', `Inscripciones cerradas para "${torneo?.nombre}"`, 'cierre', 'torneo', torneoId);
    toast.success("Inscripciones cerradas");
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newLogo = e.target?.result as string;
        setPerfil(prev => ({ ...prev, logo: newLogo }));
        
        // Actualizar perfil en el contexto
        if (organizadorPerfil) {
          updateUserProfile('organizador', {
            ...organizadorPerfil,
            logo: newLogo
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const torneoParaEditar = torneoEditando ? torneos.find(t => t.id === torneoEditando) : null;

  // Generar datos específicos por torneo para las estadísticas
  const generarDatosPorTorneo = (torneo: Torneo) => {
    // Simular datos específicos del torneo basados en su ID
    const factor = parseInt(torneo.id.split('-')[1]) || 1;
    
    const equiposTorneo = equiposTabla.map((equipo, index) => ({
      ...equipo,
      pts: equipo.pts + (factor % 3) + index,
      gf: equipo.gf + (factor % 5),
      gc: equipo.gc + (factor % 4)
    })).sort((a, b) => b.pts - a.pts);

    const resultadosTorneo = resultados.filter((_, index) => index < (factor % 3) + 1);
    
    const goleadoresTorneo = goleadores.map((goleador, index) => ({
      ...goleador,
      goles: goleador.goles + (factor % 4) + index
    })).sort((a, b) => b.goles - a.goles);

    return { equiposTorneo, resultadosTorneo, goleadoresTorneo };
  };

  const equiposDemo = [
    { id: "EQ-001", nombre: "Águilas FC", logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center" },
    { id: "EQ-002", nombre: "Tigres SC", logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop&crop=center" },
    { id: "EQ-003", nombre: "Leones United", logo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center" },
    { id: "EQ-004", nombre: "Pumas FC", logo: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=50&h=50&fit=crop&crop=center" }
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

  const equiposTabla: EquipoTabla[] = [
    { 
      nombre: "Águilas FC", 
      logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center", 
      pj: 6, pg: 4, pe: 1, pp: 1, gf: 12, gc: 6, dg: 6, pts: 13, pAdicionales: 2,
      torneosInscritos: ["TRN-001", "TRN-002"],
      estadisticasPorTorneo: {
        "TRN-001": { pj: 3, pg: 2, pe: 1, pp: 0, gf: 7, gc: 3, pts: 7, posicion: 1 },
        "TRN-002": { pj: 3, pg: 2, pe: 0, pp: 1, gf: 5, gc: 3, pts: 6, posicion: 2 }
      }
    },
    { 
      nombre: "Tigres SC", 
      logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop&crop=center", 
      pj: 6, pg: 3, pe: 2, pp: 1, gf: 10, gc: 7, dg: 3, pts: 11, pAdicionales: 0,
      torneosInscritos: ["TRN-002"],
      estadisticasPorTorneo: {
        "TRN-002": { pj: 3, pg: 2, pe: 0, pp: 1, gf: 5, gc: 3, pts: 6, posicion: 2 }
      }
    },
    { 
      nombre: "Leones United", 
      logo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=50&h=50&fit=crop&crop=center", 
      pj: 6, pg: 3, pe: 1, pp: 2, gf: 9, gc: 8, dg: 1, pts: 10, pAdicionales: 1,
      torneosInscritos: ["TRN-001"],
      estadisticasPorTorneo: {
        "TRN-001": { pj: 3, pg: 2, pe: 1, pp: 0, gf: 7, gc: 3, pts: 7, posicion: 1 }
      }
    },
    { 
      nombre: "Pumas FC", 
      logo: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=50&h=50&fit=crop&crop=center", 
      pj: 6, pg: 2, pe: 2, pp: 2, gf: 8, gc: 9, dg: -1, pts: 8, pAdicionales: 0,
      torneosInscritos: ["TRN-001"],
      estadisticasPorTorneo: {
        "TRN-001": { pj: 3, pg: 2, pe: 1, pp: 0, gf: 7, gc: 3, pts: 7, posicion: 1 }
      }
    }
  ];

  const aprobarNotificacion = (notificacionId: string) => {
    const notificacion = notificaciones.find(n => n.id === notificacionId);
    if (!notificacion) return;

    if (notificacion.tipo === "inscripcion" && notificacion.torneoId) {
      // Actualizar torneo con nueva inscripción
      setTorneos(prev => prev.map(torneo => 
        torneo.id === notificacion.torneoId 
          ? { ...torneo, equiposInscritos: torneo.equiposInscritos + 1 }
          : torneo
      ));
      
      // Crear notificación para el equipo
      const notificacionEquipo = {
        id: `NOT-${Date.now()}`,
        tipo: 'aprobacion',
        titulo: 'Inscripción Aprobada',
        mensaje: `Tu solicitud para ${notificacion.mensaje.split(' a ')[1]} ha sido aprobada`,
        fecha: new Date().toISOString().split('T')[0],
        equipoId: notificacion.equipoId,
        accionRequerida: false
      };

      const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
      notificacionesEquipo.push(notificacionEquipo);
      localStorage.setItem('notificacionesEquipo', JSON.stringify(notificacionesEquipo));

      addLog('Aprobar Inscripción', `Inscripción de ${notificacion.equipoSolicitante} aprobada`, 'aprobacion', 'inscripcion', notificacionId);
      toast.success(`Inscripción de ${notificacion.equipoSolicitante} aprobada`);
      guardarInscripcionAprobada(notificacion.torneoId, notificacion.equipoId);
    }

    // Eliminar notificación del localStorage general
    const todasNotificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    const notificacionesActualizadas = todasNotificaciones.filter((n: any) => n.id !== notificacionId);
    localStorage.setItem('notificaciones', JSON.stringify(notificacionesActualizadas));
    
    setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
  };

  const rechazarNotificacion = (notificacionId: string) => {
    const notificacion = notificaciones.find(n => n.id === notificacionId);
    if (!notificacion) return;

    // Crear notificación para el equipo
    const notificacionEquipo = {
      id: `NOT-${Date.now()}`,
      tipo: 'rechazo',
      titulo: 'Inscripción Rechazada',
      mensaje: `Tu solicitud para ${notificacion.mensaje.split(' a ')[1]} ha sido rechazada`,
      fecha: new Date().toISOString().split('T')[0],
      equipoId: notificacion.equipoId,
      accionRequerida: false
    };

    const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
    notificacionesEquipo.push(notificacionEquipo);
    localStorage.setItem('notificacionesEquipo', JSON.stringify(notificacionesEquipo));
    guardarInscripcionAprobada(notificacion.torneoId, notificacion.equipoId);


    addLog('Rechazar Inscripción', `Solicitud de ${notificacion.equipoSolicitante} rechazada`, 'rechazo', 'inscripcion', notificacionId);
    toast.error(`Solicitud de ${notificacion.equipoSolicitante} rechazada`);
    
    // Eliminar notificación del localStorage general
    const todasNotificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    const notificacionesActualizadas = todasNotificaciones.filter((n: any) => n.id !== notificacionId);
    localStorage.setItem('notificaciones', JSON.stringify(notificacionesActualizadas));
    
    setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
  };

  const aprobarTodo = () => {
    const notificacionesPendientes = notificaciones.filter(n => n.accionRequerida);
    
    notificacionesPendientes.forEach(notificacion => {
      if (notificacion.tipo === "inscripcion" && notificacion.torneoId) {
        setTorneos(prev => prev.map(torneo => 
          torneo.id === notificacion.torneoId 
            ? { ...torneo, equiposInscritos: torneo.equiposInscritos + 1 }
            : torneo
        ));

        // Crear notificación para el equipo
        const notificacionEquipo = {
          id: `NOT-${Date.now() + Math.random()}`,
          tipo: 'aprobacion',
          titulo: 'Inscripción Aprobada',
          mensaje: `Tu solicitud para ${notificacion.mensaje.split(' a ')[1]} ha sido aprobada`,
          fecha: new Date().toISOString().split('T')[0],
          equipoId: notificacion.equipoId,
          accionRequerida: false
        };

        const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
        notificacionesEquipo.push(notificacionEquipo);
        localStorage.setItem('notificacionesEquipo', JSON.stringify(notificacionesEquipo));
      }
    });

    // Eliminar todas las notificaciones pendientes
    const todasNotificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    const notificacionesActualizadas = todasNotificaciones.filter((n: any) => 
      !notificacionesPendientes.some(np => np.id === n.id)
    );
    localStorage.setItem('notificaciones', JSON.stringify(notificacionesActualizadas));

    setNotificaciones(prev => prev.filter(n => !n.accionRequerida));
    toast.success("Todas las solicitudes han sido aprobadas");
  };

  const guardarPerfil = () => {
    if (organizadorPerfil) {
      updateUserProfile('organizador', {
        ...organizadorPerfil,
        nombreOrganizacion: perfil.nombre,
        logo: perfil.logo,
        telefono: perfil.telefono
      });
      toast.success('Perfil actualizado exitosamente');
    }
  };

  const handleEliminarTorneo = (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo) return;

    // Primera confirmación
    if (!confirm(`¿Estás seguro de que quieres eliminar el torneo "${torneo.nombre}"?`)) {
      return;
    }

    // Segunda confirmación
    if (!confirm(`ADVERTENCIA: Esta acción no se puede deshacer. El torneo "${torneo.nombre}" y toda su información se perderán permanentemente. ¿Continuar?`)) {
      return;
    }

    // Notificar a equipos inscritos si los hay
    if (torneo.equiposInscritos > 0) {
      // Aquí se notificaría a los equipos - por ahora simulamos
      const notificacionEquipo = {
        id: `NOT-${Date.now()}`,
        tipo: 'otra',
        titulo: 'Torneo Eliminado',
        mensaje: `El torneo "${torneo.nombre}" ha sido eliminado por el organizador`,
        fecha: new Date().toISOString().split('T')[0],
        accionRequerida: false
      };

      // Agregar notificación general (en una app real, se enviaría a cada equipo específico)
      const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
      notificacionesEquipo.push(notificacionEquipo);
      localStorage.setItem('notificacionesEquipo', JSON.stringify(notificacionesEquipo));
    }

    // Eliminar torneo
    setTorneos(prev => prev.filter(t => t.id !== torneoId));
    
    // También eliminar de torneos públicos
    const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
    const torneosPublicosActualizados = torneosPublicos.filter((t: any) => t.id !== torneoId);
    localStorage.setItem('torneosPublicos', JSON.stringify(torneosPublicosActualizados));

    addLog('Eliminar Torneo', `Torneo "${torneo.nombre}" eliminado`, 'eliminacion', 'torneo', torneoId);
    toast.success(`Torneo "${torneo.nombre}" eliminado exitosamente`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
                  alt={perfil.nombre}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-primary">{perfil.nombre}</h1>
                  <p className="text-sm text-muted-foreground">Organizador de Torneos</p>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setTorneoEditando(null);
                    setMostrarFormulario(true);
                  }}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Crear Torneo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setMostrarDashboard(true)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard General
                </Button>
                <ReportDownloader torneos={torneos} organizadorNombre={perfil.nombre} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Torneos Activos</span>
                  <span className="font-medium">{torneos.filter(t => t.estado === "en_curso").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Equipos Inscritos</span>
                  <span className="font-medium">{torneos.reduce((acc, t) => acc + t.equiposInscritos, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Notificaciones</span>
                  <span className="font-medium">{notificaciones.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <Tabs defaultValue="torneos" className="space-y-6">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="torneos">Mis Torneos</TabsTrigger>
              </TabsList>

              <TabsContent value="torneos">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Mis Torneos</h2>
                    <Button onClick={() => {
                      setTorneoEditando(null);
                      setMostrarFormulario(true);
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Torneo
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {torneos.map((torneo) => (
                      <Card key={torneo.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <img 
                                src={torneo.logo} 
                                alt={torneo.nombre}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <CardTitle className="text-lg">{torneo.nombre}</CardTitle>
                                <p className="text-sm text-muted-foreground">{torneo.categoria}</p>
                                <p className="text-xs text-blue-600 font-medium">ID: {torneo.id}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {(torneo.estado === "inscripciones_abiertas" || torneo.estado === "inscripciones_cerradas") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditarTorneo(torneo.id)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarTorneo(torneo.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Equipos:</span>
                            <span>{torneo.equiposInscritos}/{torneo.maxEquipos}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Formato:</span>
                            <span>{torneo.formato}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant={
                              torneo.estado === "en_curso" ? "default" :
                              torneo.estado === "inscripciones_abiertas" ? "secondary" :
                              torneo.estado === "finalizado" ? "outline" : "destructive"
                            }>
                              {torneo.estado.replace("_", " ")}
                            </Badge>
                            {torneo.esPublico && (
                              <Badge variant="outline">Público</Badge>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2">
                            {torneo.estado === "inscripciones_abiertas" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCerrarInscripciones(torneo.id)}
                              >
                                Cerrar Inscripciones
                              </Button>
                            )}
                            
                            {torneo.estado === "inscripciones_cerradas" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleIniciarTorneo(torneo.id)}
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Iniciar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setTorneoSeleccionado(torneo);
                                    setMostrarFixture(true);
                                  }}
                                >
                                  Fixture
                                </Button>
                              </>
                            )}

                            {torneo.estado === "en_curso" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setTorneoSeleccionado(torneo);
                                  setMostrarFixture(true);
                                }}
                              >
                                Ver Fixture
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setTorneoSeleccionado(torneo);
                                setMostrarEstadisticas(true);
                              }}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="equipos">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Equipos Registrados</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {equiposTabla.map((equipo, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <img 
                              src={equipo.logo} 
                              alt={equipo.nombre}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <CardTitle className="text-lg">{equipo.nombre}</CardTitle>
                              <p className="text-sm text-muted-foreground">{equipo.pts} puntos</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-center text-sm">
                            <div>
                              <p className="font-medium">{equipo.pj}</p>
                              <p className="text-muted-foreground">PJ</p>
                            </div>
                            <div>
                              <p className="font-medium">{equipo.gf}</p>
                              <p className="text-muted-foreground">GF</p>
                            </div>
                            <div>
                              <p className="font-medium">{equipo.gc}</p>
                              <p className="text-muted-foreground">GC</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Torneos Registrados:</h4>
                            <div className="space-y-2">
                              {equipo.torneosInscritos.map((torneoId) => {
                                const torneo = torneos.find(t => t.id === torneoId);
                                const stats = equipo.estadisticasPorTorneo[torneoId];
                                return torneo && stats ? (
                                  <div key={torneoId} className="text-xs border rounded p-2">
                                    <p className="font-medium">{torneo.nombre}</p>
                                    <div className="flex justify-between mt-1">
                                      <span>PJ: {stats.pj}</span>
                                      <span>Pts: {stats.pts}</span>
                                      <span>Pos: #{stats.posicion}</span>
                                    </div>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TorneoFormModal
        open={mostrarFormulario}
        onClose={() => {
          setMostrarFormulario(false);
          setTorneoEditando(null);
        }}
        onSubmit={handleCrearTorneo}
        torneoId={generarIdTorneo()}
        torneoEditando={torneoParaEditar}
      />

      <Dialog open={mostrarEstadisticas} onOpenChange={setMostrarEstadisticas}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Estadísticas del Torneo</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            {torneoSeleccionado && (
              <TorneoEstadisticas
                torneo={torneoSeleccionado}
                equiposTorneo={[]}
                resultadosTorneo={[]}
                goleadoresTorneo={[]}
                esOrganizador={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrarFixture} onOpenChange={setMostrarFixture}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Fixture del Torneo</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            {torneoSeleccionado && (
              <FixtureGenerator torneo={torneoSeleccionado} equipos={equiposDemo} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrarDashboard} onOpenChange={setMostrarDashboard}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Dashboard General - Reporte de Torneos</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            <OrganizadorDashboard torneos={torneos} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrarPerfil} onOpenChange={setMostrarPerfil}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Perfil del Organizador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <img 
                src={perfil.logo} 
                alt={perfil.nombre}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{perfil.nombre}</h3>
                <p className="text-sm text-muted-foreground">{perfil.email}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Nombre de la Organización</Label>
                <Input 
                  value={perfil.nombre}
                  onChange={(e) => setPerfil(prev => ({ ...prev, nombre: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  value={perfil.email}
                  onChange={(e) => setPerfil(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input 
                  value={perfil.telefono}
                  onChange={(e) => setPerfil(prev => ({ ...prev, telefono: e.target.value }))}
                />
              </div>
              <Button onClick={guardarPerfil} className="w-full">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrarNotificaciones} onOpenChange={setMostrarNotificaciones}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Notificaciones
              {notificaciones.filter(n => n.accionRequerida).length > 0 && (
                <Button 
                  size="sm" 
                  onClick={aprobarTodo}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Aprobar Todo
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {notificaciones.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No tienes notificaciones pendientes
              </p>
            ) : (
              notificaciones.map((notif) => (
                <div key={notif.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{notif.titulo}</h4>
                    <Badge variant={notif.accionRequerida ? "destructive" : "secondary"}>
                      {notif.accionRequerida ? "Acción requerida" : "Informativa"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.mensaje}</p>
                  {notif.mensajeEquipo && (
                    <div className="text-xs bg-muted p-2 rounded">
                      <strong>Mensaje del equipo:</strong> {notif.mensajeEquipo}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{notif.fecha}</span>
                    <span>{notif.equipoSolicitante}</span>
                  </div>
                  {notif.accionRequerida && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => aprobarNotificacion(notif.id)}
                        className="bg-green-50 hover:bg-green-100 border-green-200"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => rechazarNotificacion(notif.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const guardarInscripcionAprobada = (torneoId: string, equipoId: string) => {
  const claveInscripcion = `inscripcion_${torneoId}_${equipoId}`;
  localStorage.setItem(claveInscripcion, JSON.stringify({
    estado: "aprobado",
    equipoId,
    torneoId,
    fechaAprobacion: new Date().toISOString()
  }));
};


export default Organizador;
