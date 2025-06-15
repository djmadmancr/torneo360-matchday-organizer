import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Calendar, MapPin, Users, Eye, Award, Target, Search, AlertCircle } from "lucide-react";
import EstadisticasEquipo from './EstadisticasEquipo';

interface TorneoInscrito {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  formato: string;
  fechaInicio: string;
  fechaFin: string;
  logo: string;
  organizadorNombre: string;
  estado: string;
  ubicacion?: string;
  equipoStats?: {
    partidosJugados: number;
    victorias: number;
    empates: number;
    derrotas: number;
    golesAFavor: number;
    golesEnContra: number;
    posicion?: number;
    grupo?: string;
  };
}

interface PartidoPendiente {
  id: string;
  fecha: string;
  hora: string;
  equipoLocal: string;
  equipoVisitante: string;
  logoLocal: string;
  logoVisitante: string;
  jornada: number;
  ubicacion?: string;
}

interface TorneosInscritosProps {
  equipoId: string;
  equipoNombre: string;
}

const TorneosInscritos: React.FC<TorneosInscritosProps> = ({ equipoId, equipoNombre }) => {
  const [torneosInscritos, setTorneosInscritos] = useState<TorneoInscrito[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<TorneoInscrito | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [tabActiva, setTabActiva] = useState('tabla');

  const cargarTorneosInscritos = () => {
    console.log('=== INICIO CARGA TORNEOS INSCRITOS ===');
    console.log('🔍 Cargando torneos inscritos para equipoId:', equipoId);
    
    // Método 1: Buscar inscripciones directas guardadas
    const todasLasClaves = Object.keys(localStorage);
    const clavesInscripcion = todasLasClaves.filter(clave => 
      clave.startsWith(`inscripcion_`) && clave.endsWith(`_${equipoId}`)
    );
    
    console.log('🔑 Claves de inscripción encontradas:', clavesInscripcion);
    
    const inscripcionesDirectas = clavesInscripcion.map(clave => {
      const inscripcion = JSON.parse(localStorage.getItem(clave) || '{}');
      console.log('📄 Inscripción directa encontrada:', clave, inscripcion);
      return inscripcion;
    }).filter(inscripcion => inscripcion.estado === 'aprobado');
    
    console.log('✅ Inscripciones directas aprobadas:', inscripcionesDirectas);

    // Método 2: Buscar notificaciones de aprobación y extraer torneoId del mensaje
    const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
    console.log('📢 Todas las notificaciones equipo encontradas:', notificacionesEquipo);
    
    const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
    console.log('📋 Torneos públicos disponibles:', torneosPublicos);
    
    const solicitudesAceptadas = notificacionesEquipo.filter((n: any) => {
      const esParaEsteEquipo = n.equipoId === equipoId;
      const esAprobacion = n.tipo === 'aprobacion';
      
      console.log(`🔍 Evaluando notificación ${n.id}:`, {
        esParaEsteEquipo,
        esAprobacion,
        equipoId: n.equipoId,
        tipo: n.tipo,
        mensaje: n.mensaje
      });
      
      return esParaEsteEquipo && esAprobacion;
    });
    
    console.log('✅ Solicitudes aceptadas encontradas:', solicitudesAceptadas);

    // Intentar extraer torneoId del mensaje si no está presente
    const solicitudesConTorneoId = solicitudesAceptadas.map((notificacion: any) => {
      if (notificacion.torneoId) {
        console.log('✅ Notificación ya tiene torneoId:', notificacion.torneoId);
        return notificacion;
      }
      
      // Intentar extraer el nombre del torneo del mensaje
      const mensaje = notificacion.mensaje || '';
      console.log('🔍 Intentando extraer torneoId del mensaje:', mensaje);
      
      // Buscar coincidencia por nombre en el mensaje
      for (const torneo of torneosPublicos) {
        if (mensaje.includes(torneo.nombre)) {
          console.log('✅ Torneo encontrado por nombre en mensaje:', torneo.nombre, '->', torneo.id);
          return {
            ...notificacion,
            torneoId: torneo.id,
            torneoExtraido: true
          };
        }
      }
      
      console.log('❌ No se pudo extraer torneoId del mensaje');
      return notificacion;
    });
    
    console.log('🎯 Solicitudes procesadas con torneoId:', solicitudesConTorneoId);

    // Combinar ambos métodos
    let torneosIds: string[] = [];
    
    // Agregar IDs de inscripciones directas
    const idsDirectos = inscripcionesDirectas.map(i => i.torneoId).filter(Boolean);
    torneosIds = [...torneosIds, ...idsDirectos];
    
    // Agregar IDs de notificaciones de aprobación
    const idsDeNotificaciones = solicitudesConTorneoId
      .map((n: any) => n.torneoId)
      .filter(Boolean);
    torneosIds = [...torneosIds, ...idsDeNotificaciones];
    
    // Eliminar duplicados
    torneosIds = [...new Set(torneosIds)];
    
    console.log('🎯 IDs de torneos únicos finales:', torneosIds);

    if (torneosIds.length === 0) {
      console.log('❌ No hay inscripciones aprobadas para este equipo');
      setTorneosInscritos([]);
      return;
    }

    // Para cada torneo encontrado, crear/actualizar la inscripción en localStorage
    torneosIds.forEach(torneoId => {
      const inscripcionKey = `inscripcion_${torneoId}_${equipoId}`;
      const inscripcionExistente = localStorage.getItem(inscripcionKey);
      
      if (!inscripcionExistente) {
        const nuevaInscripcion = {
          equipoId: equipoId,
          torneoId: torneoId,
          fechaInscripcion: new Date().toISOString(),
          estado: 'aprobado'
        };
        localStorage.setItem(inscripcionKey, JSON.stringify(nuevaInscripcion));
        console.log('✅ Nueva inscripción creada:', inscripcionKey, nuevaInscripcion);
      }
    });

    // Obtener información completa de los torneos
    const torneosInscritosData = torneosIds
      .map((torneoId: string) => {
        console.log('🔍 Buscando torneo para ID:', torneoId);
        const torneo = torneosPublicos.find((t: any) => t.id === torneoId);
        
        if (torneo) {
          console.log('✅ Torneo encontrado:', torneo.nombre, torneo.id);
          // Cargar estadísticas si existen
          const statsKey = `torneo_${torneo.id}_equipo_${equipoId}_stats`;
          const statsGuardadas = JSON.parse(localStorage.getItem(statsKey) || 'null');
          
          const torneoCompleto = {
            ...torneo,
            equipoStats: statsGuardadas || {
              partidosJugados: 0,
              victorias: 0,
              empates: 0,
              derrotas: 0,
              golesAFavor: 0,
              golesEnContra: 0,
              posicion: null,
              grupo: null
            }
          };
          
          return torneoCompleto;
        } else {
          console.log('❌ Torneo no encontrado para ID:', torneoId);
          return null;
        }
      })
      .filter(Boolean);

    console.log('📊 Torneos inscritos finales:', torneosInscritosData);
    setTorneosInscritos(torneosInscritosData);
    console.log('=== FIN CARGA TORNEOS INSCRITOS ===');
  };

  useEffect(() => {
    if (equipoId) {
      cargarTorneosInscritos();
      
      // Escuchar evento personalizado para actualizaciones
      const handleUpdate = () => {
        console.log('🔄 Evento de actualización recibido, recargando torneos inscritos...');
        setTimeout(cargarTorneosInscritos, 100);
      };
      
      window.addEventListener('torneosInscritosUpdate', handleUpdate);
      
      const interval = setInterval(cargarTorneosInscritos, 3000);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('torneosInscritosUpdate', handleUpdate);
      };
    }
  }, [equipoId, equipoNombre]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'inscripciones_abiertas':
        return <Badge className="bg-green-500">Por Comenzar</Badge>;
      case 'en_curso':
        return <Badge className="bg-blue-500">En Progreso</Badge>;
      case 'finalizado':
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const verDetallesTorneo = (torneo: TorneoInscrito) => {
    setTorneoSeleccionado(torneo);
    setMostrarDetalles(true);
  };

  if (torneosInscritos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mis Torneos</h2>
          <Badge variant="outline">0 torneos inscritos</Badge>
        </div>

        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay torneos inscritos</h3>
          <p className="text-gray-500">Los torneos en los que tu equipo sea aceptado aparecerán aquí</p>
          <p className="text-sm text-muted-foreground mt-2">
            También podrás ver aquí el historial de torneos finalizados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Torneos</h2>
        <Badge variant="outline">{torneosInscritos.length} torneos inscritos</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {torneosInscritos.map((torneo) => (
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
                </div>
                {getEstadoBadge(torneo.estado)}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                <p className="text-sm font-medium text-blue-700">
                  <span className="font-bold">ID Torneo:</span> {torneo.id}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span>{torneo.categoria}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span>{torneo.tipo}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Inicio: {new Date(torneo.fechaInicio).toLocaleDateString('es-ES')}</span>
                </div>
                {torneo.ubicacion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{torneo.ubicacion}</span>
                  </div>
                )}
              </div>

              {torneo.equipoStats && (torneo.equipoStats.partidosJugados > 0 || torneo.equipoStats.posicion) && (
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Mi Rendimiento</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {torneo.equipoStats.grupo && <div>Grupo: {torneo.equipoStats.grupo}</div>}
                    {torneo.equipoStats.posicion && <div>Posición: #{torneo.equipoStats.posicion}</div>}
                    <div>Partidos: {torneo.equipoStats.partidosJugados}</div>
                    <div>Victorias: {torneo.equipoStats.victorias}</div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  onClick={() => verDetallesTorneo(torneo)}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Detalles del Torneo */}
      <Dialog open={mostrarDetalles} onOpenChange={setMostrarDetalles}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {torneoSeleccionado?.nombre} - Detalles
              {torneoSeleccionado && (
                <Badge variant="outline" className="ml-2">ID: {torneoSeleccionado.id}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {torneoSeleccionado && (
            <div className="mt-4">
              <Tabs value={tabActiva} onValueChange={setTabActiva}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tabla">Tabla de Grupo</TabsTrigger>
                  <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
                </TabsList>

                <TabsContent value="tabla" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        {torneoSeleccionado.equipoStats?.grupo || 'Información de Grupo'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Los datos de la tabla se mostrarán cuando se ingresen resultados reales del torneo
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="fixtures" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Fixtures del Torneo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Los fixtures se mostrarán cuando el organizador los genere
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TorneosInscritos;
