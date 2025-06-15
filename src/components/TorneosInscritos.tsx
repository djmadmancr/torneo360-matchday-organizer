import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, MapPin, Users, Eye, Award, Target, Search, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { obtenerEquipoIdDeUsuario } from '../utils/equipoMigration';

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

interface TorneosInscritosProps {
  equipoId: string;
  equipoNombre: string;
}

const TorneosInscritos: React.FC<TorneosInscritosProps> = ({ equipoId: userId, equipoNombre }) => {
  const { user } = useAuth();
  const [torneosInscritos, setTorneosInscritos] = useState<TorneoInscrito[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<TorneoInscrito | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [tabActiva, setTabActiva] = useState('tabla');
  const [equipoIdNumerico, setEquipoIdNumerico] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const debugLocalStorage = () => {
    console.log('🔍 === DEBUG COMPLETO DE LOCALSTORAGE ===');
    console.log(`📊 Total de claves en localStorage: ${localStorage.length}`);
    
    const todasLasClaves: string[] = [];
    const clavesRelacionadas: { [key: string]: string } = {};
    
    // Recopilar TODAS las claves
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        todasLasClaves.push(key);
        
        // Buscar claves que contengan términos relacionados con inscripciones
        if (key.includes('inscripcion') || key.includes('torneo') || key.includes('TRN-') || key.includes('equipo')) {
          const value = localStorage.getItem(key);
          clavesRelacionadas[key] = value || '';
        }
      }
    }
    
    console.log('📋 TODAS las claves de localStorage:', todasLasClaves);
    console.log('🎯 Claves relacionadas con inscripciones/torneos:', Object.keys(clavesRelacionadas));
    
    // Mostrar el contenido de cada clave relacionada
    Object.entries(clavesRelacionadas).forEach(([key, value]) => {
      console.log(`📄 ${key}:`, value);
      try {
        const parsed = JSON.parse(value);
        console.log(`📊 ${key} (parseado):`, parsed);
      } catch (e) {
        console.log(`❌ ${key} no es JSON válido`);
      }
    });
    
    // Buscar específicamente TRN-937
    console.log('🎯 === BÚSQUEDA ESPECÍFICA PARA TRN-937 ===');
    Object.entries(clavesRelacionadas).forEach(([key, value]) => {
      if (key.includes('TRN-937') || value.includes('TRN-937')) {
        console.log(`🔍 TRN-937 encontrado en ${key}:`, value);
        try {
          const parsed = JSON.parse(value);
          console.log(`📊 TRN-937 data parseada:`, parsed);
        } catch (e) {
          console.log(`❌ Error parseando TRN-937 en ${key}`);
        }
      }
    });
  };

  const verificarInscripcionUltraExhaustiva = (torneoId: string, equipoId: number, userId: string): boolean => {
    console.log(`🔍 === VERIFICACIÓN ULTRA EXHAUSTIVA ===`);
    console.log(`Torneo: ${torneoId}, EquipoId: ${equipoId}, UserId: ${userId}`);
    
    // Ejecutar debug completo
    debugLocalStorage();
    
    // Método 1: Búsqueda por patrones estándar
    const patronesEstandar = [
      `inscripcion_${torneoId}_${equipoId}`,
      `inscripcion_${torneoId}_${userId}`,
      `torneo_${torneoId}_equipo_${equipoId}`,
      `equipos_inscritos_${torneoId}`,
      `${torneoId}_inscripcion_${equipoId}`,
      `${torneoId}_inscripcion_${userId}`,
      `${equipoId}_inscripcion_${torneoId}`,
      `${userId}_inscripcion_${torneoId}`
    ];
    
    console.log('🎯 Patrones estándar a verificar:', patronesEstandar);
    
    for (const patron of patronesEstandar) {
      const data = localStorage.getItem(patron);
      if (data) {
        console.log(`📄 Encontrado en patrón ${patron}:`, data);
        try {
          const parsed = JSON.parse(data);
          console.log(`📊 Data parseada:`, parsed);
          
          // Verificar si es una inscripción válida
          if (Array.isArray(parsed)) {
            const encontrado = parsed.some((item: any) => 
              (item.equipoId === equipoId || item.equipoId === userId || item.userId === userId) &&
              item.torneoId === torneoId &&
              (item.estado === 'aprobado' || item.estado === 'inscrito')
            );
            if (encontrado) {
              console.log(`✅ INSCRITO encontrado en array ${patron}`);
              return true;
            }
          } else if (parsed.torneoId === torneoId && 
                    (parsed.equipoId === equipoId || parsed.equipoId === userId) &&
                    (parsed.estado === 'aprobado' || parsed.estado === 'inscrito')) {
            console.log(`✅ INSCRITO encontrado en objeto ${patron}`);
            return true;
          }
        } catch (e) {
          console.error(`❌ Error parseando ${patron}:`, e);
        }
      }
    }
    
    // Método 2: Búsqueda COMPLETAMENTE exhaustiva por TODAS las claves
    console.log('🔍 === BÚSQUEDA COMPLETAMENTE EXHAUSTIVA ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            // Verificar si el contenido menciona el torneoId
            if (data.includes(torneoId)) {
              console.log(`🎯 TorneoId ${torneoId} encontrado en clave: ${key}`);
              console.log(`📄 Contenido:`, data);
              
              const parsed = JSON.parse(data);
              console.log(`📊 Data parseada:`, parsed);
              
              // Verificar inscripción en objetos
              if (parsed.torneoId === torneoId && 
                  (parsed.equipoId === equipoId || parsed.equipoId === userId) &&
                  (parsed.estado === 'aprobado' || parsed.estado === 'inscrito')) {
                console.log(`✅ INSCRITO encontrado por búsqueda exhaustiva: ${key}`);
                return true;
              }
              
              // Verificar inscripción en arrays
              if (Array.isArray(parsed)) {
                const encontrado = parsed.some((item: any) => 
                  item.torneoId === torneoId &&
                  (item.equipoId === equipoId || item.equipoId === userId || item.userId === userId) &&
                  (item.estado === 'aprobado' || item.estado === 'inscrito')
                );
                if (encontrado) {
                  console.log(`✅ INSCRITO encontrado en array por búsqueda exhaustiva: ${key}`);
                  return true;
                }
              }
              
              // Verificar en notificaciones
              if (parsed.tipo === 'aprobacion' && parsed.torneoId === torneoId) {
                console.log(`✅ INSCRITO por notificación de aprobación: ${key}`);
                return true;
              }
            }
          } catch (e) {
            // Continuar con la siguiente clave si no es JSON
          }
        }
      }
    }
    
    // Método 3: Verificar notificaciones específicamente
    console.log('🔍 === VERIFICACIÓN EN NOTIFICACIONES ===');
    const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
    console.log('📋 Notificaciones del equipo:', notificacionesEquipo);
    
    const notificacionAprobacion = notificacionesEquipo.find((n: any) => 
      n.tipo === 'aprobacion' && 
      n.torneoId === torneoId &&
      !n.accionRequerida
    );
    
    if (notificacionAprobacion) {
      console.log(`✅ INSCRITO por notificación aprobada:`, notificacionAprobacion);
      return true;
    }
    
    console.log(`❌ NO INSCRITO después de verificación ULTRA EXHAUSTIVA`);
    return false;
  };

  const cargarTorneosInscritos = () => {
    console.log('=== INICIO CARGA TORNEOS INSCRITOS (VERSIÓN ULTRA EXHAUSTIVA) ===');
    setLoading(true);
    
    if (!user) {
      console.log('❌ No hay usuario actual');
      setLoading(false);
      return;
    }
    
    try {
      // Obtener equipoId numérico del usuario actual
      const equipoId = obtenerEquipoIdDeUsuario(user);
      
      if (!equipoId) {
        console.log('❌ No se pudo obtener equipoId para el usuario');
        setLoading(false);
        return;
      }
      
      setEquipoIdNumerico(equipoId);
      console.log('🔍 Usando equipoId numérico:', equipoId);
      console.log('🔍 Usando userId:', user.id);
      
      // Obtener todos los torneos públicos
      const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
      console.log('📋 Torneos públicos disponibles:', torneosPublicos.length);
      console.log('📋 Lista de torneos:', torneosPublicos.map((t: any) => ({ id: t.id, nombre: t.nombre })));
      
      const torneosConInscripcion: TorneoInscrito[] = [];
      
      // Para cada torneo, verificar si el equipo está inscrito
      torneosPublicos.forEach((torneo: any) => {
        console.log(`\n🎯 ===== VERIFICANDO TORNEO: ${torneo.id} (${torneo.nombre}) =====`);
        const estaInscrito = verificarInscripcionUltraExhaustiva(torneo.id, equipoId, user.id);
        
        if (estaInscrito) {
          console.log(`✅ ===== CONFIRMADO: INSCRITO EN ${torneo.nombre} (${torneo.id}) =====`);
          
          // Cargar estadísticas del equipo para este torneo
          const statsKey = `torneo_${torneo.id}_equipo_${equipoId}_stats`;
          const statsGuardadas = JSON.parse(localStorage.getItem(statsKey) || 'null');
          
          torneosConInscripcion.push({
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
          });
        } else {
          console.log(`❌ ===== CONFIRMADO: NO INSCRITO EN ${torneo.nombre} (${torneo.id}) =====`);
        }
      });
      
      console.log(`🏆 Torneos inscritos finales: ${torneosConInscripcion.length}`);
      console.log('📋 Lista final:', torneosConInscripcion.map(t => ({ id: t.id, nombre: t.nombre })));
      setTorneosInscritos(torneosConInscripcion);
      
    } catch (error) {
      console.error('❌ Error cargando torneos inscritos:', error);
      setTorneosInscritos([]);
    } finally {
      setLoading(false);
    }
    
    console.log('=== FIN CARGA TORNEOS INSCRITOS (VERSIÓN ULTRA EXHAUSTIVA) ===');
  };

  useEffect(() => {
    if (user) {
      cargarTorneosInscritos();
      
      const handleUpdate = () => {
        console.log('🔄 Evento de actualización recibido, recargando...');
        setTimeout(cargarTorneosInscritos, 100);
      };
      
      window.addEventListener('torneosInscritosUpdate', handleUpdate);
      window.addEventListener('equiposInscritosUpdate', handleUpdate);
      window.addEventListener('inscripcionesUpdate', handleUpdate);
      const interval = setInterval(cargarTorneosInscritos, 5000);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('torneosInscritosUpdate', handleUpdate);
        window.removeEventListener('equiposInscritosUpdate', handleUpdate);
        window.removeEventListener('inscripcionesUpdate', handleUpdate);
      };
    }
  }, [user, equipoNombre]);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mis Torneos</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando torneos inscritos...</p>
        </div>
      </div>
    );
  }

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
          {equipoIdNumerico && (
            <p className="text-xs text-blue-600 mt-2">
              EquipoID: {equipoIdNumerico}
            </p>
          )}
          <button 
            onClick={cargarTorneosInscritos}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Torneos</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{torneosInscritos.length} torneos inscritos</Badge>
          {equipoIdNumerico && (
            <Badge variant="secondary">ID: {equipoIdNumerico}</Badge>
          )}
          <button 
            onClick={cargarTorneosInscritos}
            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Recargar
          </button>
        </div>
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
