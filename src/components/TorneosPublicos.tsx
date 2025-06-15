import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Calendar, MapPin, Users, Plus, Eye, BarChart3, Award, Target } from "lucide-react";
import TorneoEstadisticas from './TorneoEstadisticas';

interface TorneoPublico {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  formato: string;
  fechaCierre: string;
  fechaInicio: string;
  fechaFin: string;
  logo: string;
  maxEquipos: number;
  equiposInscritos: number;
  estado: "inscripciones_abiertas" | "inscripciones_cerradas" | "en_curso" | "finalizado";
  organizadorNombre: string;
  organizadorId: string;
  esPublico: boolean;
  edadMinima?: number;
  edadMaxima?: number;
  descripcion?: string;
  ubicacion?: string;
  puntajeGane: number;
  puntajeEmpate: number;
  puntajeExtraPenales: boolean;
  puntajeExtra: number;
  idaVuelta: { grupos: boolean; eliminatoria: boolean; };
  diasSemana: string[];
  partidosPorSemana: string;
  fechaCreacion: string;
}

interface TorneosPublicosProps {
  onInscribirse: (torneo: TorneoPublico) => void;
  equipoCategoria: string;
  solicitudesPendientes: string[];
  torneosInscritos: string[];
}

const TorneosPublicos: React.FC<TorneosPublicosProps> = ({ 
  onInscribirse, 
  equipoCategoria, 
  solicitudesPendientes,
  torneosInscritos 
}) => {
  const [torneos, setTorneos] = useState<TorneoPublico[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<TorneoPublico | null>(null);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);

  useEffect(() => {
    const cargarTorneos = () => {
      console.log('=== CARGANDO TODOS LOS TORNEOS PÚBLICOS ===');
      const torneosGuardados = localStorage.getItem('torneosPublicos');
      const equipoId = localStorage.getItem('userId');
      
      console.log('🔍 Datos en localStorage:');
      console.log('- torneosPublicos:', torneosGuardados);
      console.log('- equipoId (userId):', equipoId);
      console.log('- equipoCategoria recibida:', equipoCategoria);
      
      if (torneosGuardados && equipoId) {
        const torneosData = JSON.parse(torneosGuardados);
        console.log('📋 Todos los torneos encontrados:', torneosData);
        console.log('📊 Total de torneos en localStorage:', torneosData.length);
        
        // Obtener notificaciones de aprobación para filtrar torneos ya aprobados
        const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
        console.log('📢 Todas las notificaciones de equipo:', notificacionesEquipo);
        
        const torneosAprobados = notificacionesEquipo
          .filter((n: any) => 
            n.equipoId === equipoId && 
            n.tipo === 'aprobacion'
          )
          .map((n: any) => n.torneoId);
        
        console.log('✅ Torneos ya aprobados para este equipo:', torneosAprobados);
        
        // Obtener solicitudes pendientes
        const solicitudesGuardadas = JSON.parse(localStorage.getItem('notificaciones') || '[]');
        const solicitudesPendientesEquipo = solicitudesGuardadas.filter((s: any) => 
          s.equipoId === equipoId && 
          s.tipo === 'inscripcion' && 
          s.accionRequerida === true
        );
        console.log('⏳ Solicitudes pendientes para este equipo:', solicitudesPendientesEquipo);
        
        // Verificar fecha de cierre de inscripciones
        const fechaActual = new Date();
        console.log('📅 Fecha actual:', fechaActual.toISOString());
        
        // MOSTRAR TODOS LOS TORNEOS PÚBLICOS DE CUALQUIER ORGANIZADOR
        console.log('🔍 FILTRANDO TORNEOS PÚBLICOS:');
        const torneosPublicos = torneosData.filter((t: TorneoPublico) => {
          const fechaCierre = new Date(t.fechaCierre);
          const inscripcionesAbiertas = fechaCierre > fechaActual;
          const esPublico = t.esPublico;
          const noEstaAprobado = !torneosAprobados.includes(t.id);
          const noTieneSolicitudPendiente = !solicitudesPendientesEquipo.some((s: any) => s.torneoId === t.id);
          
          console.log(`📋 Evaluando torneo "${t.nombre}" (${t.id}):`, {
            esPublico,
            organizador: t.organizadorNombre,
            inscripcionesAbiertas,
            noEstaAprobado,
            noTieneSolicitudPendiente,
            cumpleCondiciones: esPublico && inscripcionesAbiertas && noEstaAprobado && noTieneSolicitudPendiente
          });
          
          // Mostrar TODOS los torneos públicos, independientemente del organizador
          return esPublico && inscripcionesAbiertas && noEstaAprobado && noTieneSolicitudPendiente;
        });
        
        console.log('✅ Torneos públicos disponibles:', torneosPublicos);
        console.log('📊 Total de torneos públicos:', torneosPublicos.length);
        
        setTorneos(torneosPublicos);
      } else {
        console.log('❌ No hay torneos guardados o no hay equipoId');
        setTorneos([]);
      }
      console.log('=== FIN CARGA TORNEOS PÚBLICOS ===');
    };

    cargarTorneos();
    const interval = setInterval(cargarTorneos, 2000);
    return () => clearInterval(interval);
  }, [equipoCategoria]);

  const puedeInscribirse = (torneo: TorneoPublico) => {
    return torneo.categoria === 'Libre' || torneo.categoria === equipoCategoria;
  };

  const estaInscrito = (torneoId: string) => {
    return torneosInscritos.includes(torneoId);
  };

  const tieneSolicitudPendiente = (torneoId: string) => {
    return solicitudesPendientes.includes(torneoId);
  };

  const verEstadisticasTorneo = (torneo: TorneoPublico) => {
    setTorneoSeleccionado(torneo);
    setMostrarEstadisticas(true);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'inscripciones_abiertas':
        return <Badge className="bg-green-500">Inscripciones Abiertas</Badge>;
      case 'inscripciones_cerradas':
        return <Badge className="bg-yellow-500">Inscripciones Cerradas</Badge>;
      case 'en_curso':
        return <Badge className="bg-blue-500">En Curso</Badge>;
      case 'finalizado':
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (torneos.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay torneos públicos disponibles</h3>
        <p className="text-gray-500">Los torneos públicos creados por organizadores aparecerán aquí cuando estén disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Torneos Públicos Disponibles</h2>
        <Badge variant="outline">{torneos.length} torneos disponibles</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {torneos.map((torneo) => (
          <Card key={torneo.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={torneo.logo} 
                  alt={torneo.nombre}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg">{torneo.nombre}</CardTitle>
                  <p className="text-sm text-muted-foreground">por {torneo.organizadorNombre}</p>
                  <p className="text-xs text-blue-600 font-mono">ID: {torneo.id}</p>
                </div>
                {getEstadoBadge(torneo.estado)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span>{torneo.categoria}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{torneo.equiposInscritos}/{torneo.maxEquipos}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Cierre: {new Date(torneo.fechaCierre).toLocaleDateString('es-ES')}</span>
                </div>
                {torneo.ubicacion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{torneo.ubicacion}</span>
                  </div>
                )}
              </div>

              {/* Reglas del Torneo */}
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Reglas de Puntaje
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Victoria: {torneo.puntajeGane} pts</div>
                  <div>Empate: {torneo.puntajeEmpate} pts</div>
                  {torneo.puntajeExtraPenales && (
                    <div className="col-span-2">
                      Penales: +{torneo.puntajeExtra} pts extra
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span>Formato: {torneo.formato}</span>
                  <br />
                  <span>Tipo: {torneo.tipo}</span>
                </div>
              </div>

              {torneo.descripcion && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {torneo.descripcion}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                {tieneSolicitudPendiente(torneo.id) ? (
                  <Button 
                    disabled 
                    variant="secondary"
                    className="w-full"
                  >
                    Solicitud Pendiente
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => verEstadisticasTorneo(torneo)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Info
                    </Button>
                    <Button 
                      onClick={() => onInscribirse(torneo)}
                      disabled={!puedeInscribirse(torneo) || torneo.equiposInscritos >= torneo.maxEquipos}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {puedeInscribirse(torneo) ? 'Inscribirse' : 'Categoría No Compatible'}
                    </Button>
                  </>
                )}
              </div>

              {!puedeInscribirse(torneo) && (
                <p className="text-xs text-red-500 text-center">
                  Tu categoría ({equipoCategoria}) no es compatible con este torneo
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Estadísticas del Torneo */}
      <Dialog open={mostrarEstadisticas} onOpenChange={setMostrarEstadisticas}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Información del Torneo
            </DialogTitle>
          </DialogHeader>
          
          {torneoSeleccionado && (
            <div className="mt-4">
              <TorneoEstadisticas 
                torneo={torneoSeleccionado}
                equiposTorneo={[]}
                resultadosTorneo={[]}
                goleadoresTorneo={[]}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TorneosPublicos;
