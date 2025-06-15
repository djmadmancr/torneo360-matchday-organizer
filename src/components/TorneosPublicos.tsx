import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Calendar, MapPin, Users, Plus, Clock, Search, Eye, Target, Award, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { obtenerEquipoIdDeUsuario } from '../utils/equipoMigration';

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
  const { user } = useAuth();
  const [torneos, setTorneos] = useState<TorneoPublico[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<TorneoPublico | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [busquedaId, setBusquedaId] = useState('');
  const [torneosBuscados, setTorneosBuscados] = useState<TorneoPublico[]>([]);
  const [equiposInscritos, setEquiposInscritos] = useState<string[]>([]);
  const [equipoIdNumerico, setEquipoIdNumerico] = useState<number | null>(null);

  const verificarInscripcionDetallada = (torneoId: string, equipoId: number, userId: string): boolean => {
    console.log(`🔍 VERIFICACIÓN DETALLADA - Torneo: ${torneoId}, EquipoId: ${equipoId}, UserId: ${userId}`);
    
    // Método 1: Búsqueda por clave principal
    const clave1 = `inscripcion_${torneoId}_${equipoId}`;
    const inscripcion1 = localStorage.getItem(clave1);
    if (inscripcion1) {
      try {
        const data = JSON.parse(inscripcion1);
        if (data.estado === 'aprobado') {
          console.log(`✅ INSCRITO por clave1: ${clave1}`);
          return true;
        }
      } catch (e) {
        console.error(`❌ Error parseando ${clave1}:`, e);
      }
    }
    
    // Método 2: Búsqueda por userId
    const clave2 = `inscripcion_${torneoId}_${userId}`;
    const inscripcion2 = localStorage.getItem(clave2);
    if (inscripcion2) {
      try {
        const data = JSON.parse(inscripcion2);
        if (data.estado === 'aprobado') {
          console.log(`✅ INSCRITO por clave2: ${clave2}`);
          return true;
        }
      } catch (e) {
        console.error(`❌ Error parseando ${clave2}:`, e);
      }
    }
    
    // Método 3: Búsqueda por clave inversa
    const clave3 = `torneo_${torneoId}_equipo_${equipoId}`;
    const inscripcion3 = localStorage.getItem(clave3);
    if (inscripcion3) {
      try {
        const data = JSON.parse(inscripcion3);
        if (data.estado === 'aprobado') {
          console.log(`✅ INSCRITO por clave3: ${clave3}`);
          return true;
        }
      } catch (e) {
        console.error(`❌ Error parseando ${clave3}:`, e);
      }
    }
    
    // Método 4: Búsqueda en lista general
    const equiposInscritosKey = `equipos_inscritos_${torneoId}`;
    const equiposInscritos = localStorage.getItem(equiposInscritosKey);
    if (equiposInscritos) {
      try {
        const lista = JSON.parse(equiposInscritos);
        const encontrado = lista.some((e: any) => 
          (e.equipoId === equipoId || e.equipoId === userId || e.userId === userId) &&
          e.estado === 'aprobado'
        );
        if (encontrado) {
          console.log(`✅ INSCRITO por lista general: ${equiposInscritosKey}`);
          return true;
        }
      } catch (e) {
        console.error(`❌ Error parseando lista general:`, e);
      }
    }
    
    // Método 5: Búsqueda por todas las claves que contengan el torneoId
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(torneoId) && key.includes('inscripcion')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.estado === 'aprobado' && 
                (parsed.equipoId === equipoId || parsed.equipoId === userId)) {
              console.log(`✅ INSCRITO por búsqueda amplia: ${key}`);
              return true;
            }
          }
        } catch (e) {
          // Continúa con la siguiente clave
        }
      }
    }
    
    console.log(`❌ NO INSCRITO después de verificación completa`);
    return false;
  };

  useEffect(() => {
    const cargarTorneos = () => {
      console.log('=== INICIO CARGA TORNEOS PÚBLICOS (MEJORADO) ===');
      
      if (!user) {
        console.log('❌ No hay usuario logueado');
        return;
      }

      // Obtener equipoId numérico del usuario actual
      const equipoId = obtenerEquipoIdDeUsuario(user);
      setEquipoIdNumerico(equipoId);
      console.log('🔍 EquipoId numérico obtenido:', equipoId);
      
      if (equipoId) {
        const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
        console.log('🎯 Torneos públicos en localStorage:', torneosPublicos.length);
        
        // Verificar inscripciones para cada torneo
        const inscripcionesDetectadas: string[] = [];
        
        torneosPublicos.forEach((torneo: any) => {
          const estaInscrito = verificarInscripcionDetallada(torneo.id, equipoId, user.id);
          if (estaInscrito) {
            inscripcionesDetectadas.push(torneo.id);
          }
        });
        
        console.log('✅ Inscripciones detectadas (torneoIds):', inscripcionesDetectadas);
        setEquiposInscritos(inscripcionesDetectadas);
        
        const torneosDisponibles = torneosPublicos.filter((torneo: TorneoPublico) => {
          return torneo.esPublico;
        });
        
        console.log('✅ Torneos públicos disponibles:', torneosDisponibles.length);
        setTorneos(torneosDisponibles);
      }
      
      console.log('=== FIN CARGA TORNEOS PÚBLICOS (MEJORADO) ===');
    };

    cargarTorneos();
    
    // Escuchar eventos de actualización
    const handleUpdate = () => {
      console.log('🔄 Evento de actualización recibido en TorneosPublicos');
      setTimeout(cargarTorneos, 100);
    };
    
    // Escuchar múltiples tipos de eventos
    window.addEventListener('torneosInscritosUpdate', handleUpdate);
    window.addEventListener('equiposInscritosUpdate', handleUpdate);
    window.addEventListener('inscripcionesUpdate', handleUpdate);
    
    const interval = setInterval(cargarTorneos, 3000); // Más frecuente
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('torneosInscritosUpdate', handleUpdate);
      window.removeEventListener('equiposInscritosUpdate', handleUpdate);
      window.removeEventListener('inscripcionesUpdate', handleUpdate);
    };
  }, [user]);

  const buscarPorId = () => {
    if (!busquedaId.trim()) {
      setTorneosBuscados([]);
      return;
    }

    const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
    const torneoEncontrado = torneosPublicos.filter((torneo: TorneoPublico) => 
      torneo.id.toLowerCase() === busquedaId.toLowerCase().trim() && torneo.esPublico
    );
    
    setTorneosBuscados(torneoEncontrado);
  };

  const limpiarBusqueda = () => {
    setBusquedaId('');
    setTorneosBuscados([]);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'inscripciones_abiertas':
        return <Badge className="bg-green-500">Inscripciones Abiertas</Badge>;
      case 'en_curso':
        return <Badge className="bg-blue-500">En Progreso</Badge>;
      case 'finalizado':
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const puedeInscribirse = (torneo: TorneoPublico) => {
    return torneo.estado === 'inscripciones_abiertas' && 
           new Date(torneo.fechaCierre) > new Date() &&
           !solicitudesPendientes.includes(torneo.id) &&
           !estaInscrito(torneo.id);
  };

  const getTextoBoton = (torneo: TorneoPublico) => {
    if (estaInscrito(torneo.id)) {
      return "INSCRITO";
    }
    if (solicitudesPendientes.includes(torneo.id)) {
      return "Pendiente";
    }
    if (torneo.estado !== 'inscripciones_abiertas') {
      return "Cerrado";
    }
    if (new Date(torneo.fechaCierre) <= new Date()) {
      return "Expirado";
    }
    return "Inscribirse";
  };

  const verDetallesTorneo = (torneo: TorneoPublico) => {
    setTorneoSeleccionado(torneo);
    setMostrarDetalle(true);
  };

  const torneosAMostrar = torneosBuscados.length > 0 ? torneosBuscados : torneos;

  const estaInscrito = (torneoId: string) => {
    const inscrito = equiposInscritos.includes(torneoId);
    console.log(`🔍 Estado de inscripción para torneo ${torneoId}:`, inscrito ? 'INSCRITO' : 'NO INSCRITO');
    return inscrito;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Torneos</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{torneos.length} torneos disponibles</Badge>
          {equipoIdNumerico && (
            <Badge variant="secondary">Mi ID: {equipoIdNumerico}</Badge>
          )}
          <Badge variant="destructive">{equiposInscritos.length} inscritos</Badge>
        </div>
      </div>

      {/* Buscador por ID */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Torneo por ID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ingresa el ID del torneo (ej: TRN-123)"
              value={busquedaId}
              onChange={(e) => setBusquedaId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscarPorId()}
            />
            <Button onClick={buscarPorId}>Buscar</Button>
            {torneosBuscados.length > 0 && (
              <Button variant="outline" onClick={limpiarBusqueda}>Limpiar</Button>
            )}
          </div>
          {busquedaId && torneosBuscados.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              No se encontró ningún torneo con el ID "{busquedaId}"
            </p>
          )}
        </CardContent>
      </Card>

      {torneosAMostrar.length === 0 && !busquedaId ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay torneos disponibles</h3>
          <p className="text-gray-500">Los torneos públicos aparecerán aquí cuando los organizadores los publiquen</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {torneosAMostrar.map((torneo) => (
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
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Cierre: {new Date(torneo.fechaCierre).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{torneo.equiposInscritos}/{torneo.maxEquipos} equipos</span>
                  </div>
                  {torneo.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{torneo.ubicacion}</span>
                    </div>
                  )}
                </div>

                {/* Mostrar estado de inscripción */}
                {estaInscrito(torneo.id) && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">✅ Equipo Inscrito</h4>
                    <p className="text-sm text-green-700">
                      Tu equipo está participando en este torneo
                    </p>
                    {equipoIdNumerico && (
                      <p className="text-xs text-green-600 mt-1">
                        EquipoID: {equipoIdNumerico}
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  {/* Si está inscrito, mostrar botón INSCRITO deshabilitado y botón Ver Info */}
                  {estaInscrito(torneo.id) ? (
                    <>
                      <Button 
                        disabled
                        className="w-full bg-green-600 hover:bg-green-600 text-white cursor-default"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        INSCRITO
                      </Button>
                      <Button 
                        onClick={() => verDetallesTorneo(torneo)}
                        className="w-full"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Info del Torneo
                      </Button>
                    </>
                  ) : (
                    /* Si no está inscrito, mostrar botón de inscripción */
                    <Button 
                      onClick={() => onInscribirse(torneo)}
                      disabled={!puedeInscribirse(torneo)}
                      className="w-full"
                      variant={puedeInscribirse(torneo) ? "default" : "secondary"}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {getTextoBoton(torneo)}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalles del Torneo */}
      <Dialog open={mostrarDetalle} onOpenChange={setMostrarDetalle}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {torneoSeleccionado?.nombre} - Información Completa
            </DialogTitle>
          </DialogHeader>
          
          {torneoSeleccionado && (
            <div className="space-y-6 mt-4">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Detalles del Torneo</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">ID:</span> {torneoSeleccionado.id}
                      </div>
                      <div>
                        <span className="font-medium">Categoría:</span> {torneoSeleccionado.categoria}
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span> {torneoSeleccionado.tipo}
                      </div>
                      <div>
                        <span className="font-medium">Formato:</span> {torneoSeleccionado.formato}
                      </div>
                      <div>
                        <span className="font-medium">Organizador:</span> {torneoSeleccionado.organizadorNombre}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Fechas Importantes</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Inicio:</span> {new Date(torneoSeleccionado.fechaInicio).toLocaleDateString('es-ES')}
                      </div>
                      <div>
                        <span className="font-medium">Fin:</span> {new Date(torneoSeleccionado.fechaFin).toLocaleDateString('es-ES')}
                      </div>
                      <div>
                        <span className="font-medium">Cierre Inscripciones:</span> {new Date(torneoSeleccionado.fechaCierre).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Equipos</h3>
                    <div className="text-sm">
                      <span className="font-medium">Inscritos:</span> {torneoSeleccionado.equiposInscritos}/{torneoSeleccionado.maxEquipos}
                    </div>
                  </div>
                  
                  {torneoSeleccionado.ubicacion && (
                    <div>
                      <h3 className="font-semibold mb-2">Ubicación</h3>
                      <p className="text-sm">{torneoSeleccionado.ubicacion}</p>
                    </div>
                  )}
                  
                  {(torneoSeleccionado.edadMinima || torneoSeleccionado.edadMaxima) && (
                    <div>
                      <h3 className="font-semibold mb-2">Restricciones de Edad</h3>
                      <div className="text-sm">
                        {torneoSeleccionado.edadMinima && (
                          <div>Edad mínima: {torneoSeleccionado.edadMinima} años</div>
                        )}
                        {torneoSeleccionado.edadMaxima && (
                          <div>Edad máxima: {torneoSeleccionado.edadMaxima} años</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {torneoSeleccionado.descripcion && (
                <div>
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-sm text-muted-foreground">{torneoSeleccionado.descripcion}</p>
                </div>
              )}

              {/* Reglas de Puntaje */}
              <div>
                <h3 className="font-semibold mb-2">Reglas de Puntaje</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-green-600" />
                      <span><strong>Victoria:</strong> 3 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-yellow-600" />
                      <span><strong>Empate:</strong> 1 pt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-red-600 rounded-full"></span>
                      <span><strong>Derrota:</strong> 0 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TorneosPublicos;
