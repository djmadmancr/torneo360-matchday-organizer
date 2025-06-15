import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Calendar, MapPin, Users, Plus, Clock, Search, Eye, Target, Award, CheckCircle } from "lucide-react";
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
  const [torneos, setTorneos] = useState<TorneoPublico[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<TorneoPublico | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [busquedaId, setBusquedaId] = useState('');
  const [torneosBuscados, setTorneosBuscados] = useState<TorneoPublico[]>([]);
  const [equiposInscritos, setEquiposInscritos] = useState<string[]>([]);
  const [equipoIdNumerico, setEquipoIdNumerico] = useState<number | null>(null);

  useEffect(() => {
    const cargarTorneos = () => {
      console.log('=== INICIO CARGA TORNEOS PÚBLICOS (MEJORADO) ===');
      
      // Obtener equipoId numérico del usuario actual
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        const equipoId = obtenerEquipoIdDeUsuario(user);
        setEquipoIdNumerico(equipoId);
        console.log('🔍 EquipoId numérico obtenido:', equipoId);
        
        if (equipoId) {
          // Cargar inscripciones usando equipoId numérico
          const todasLasClaves = Object.keys(localStorage);
          const clavesInscripcion = todasLasClaves.filter(clave => 
            clave.startsWith('inscripcion_') && clave.endsWith(`_${equipoId}`)
          );
          
          const inscripcionesAprobadas = clavesInscripcion
            .map(clave => JSON.parse(localStorage.getItem(clave) || '{}'))
            .filter(inscripcion => inscripcion.estado === 'aprobado')
            .map(inscripcion => inscripcion.torneoId)
            .filter(Boolean);
          
          console.log('✅ Inscripciones aprobadas (equipoId numérico):', inscripcionesAprobadas);
          setEquiposInscritos(inscripcionesAprobadas);
        }
      }
      
      const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
      console.log('🎯 Torneos públicos en localStorage:', torneosPublicos);
      
      const torneosDisponibles = torneosPublicos.filter((torneo: TorneoPublico) => {
        return torneo.esPublico;
      });
      
      console.log('✅ Torneos públicos disponibles:', torneosDisponibles);
      setTorneos(torneosDisponibles);
      console.log('📊 Total de torneos públicos:', torneosDisponibles.length);
      console.log('=== FIN CARGA TORNEOS PÚBLICOS (MEJORADO) ===');
    };

    cargarTorneos();
    const interval = setInterval(cargarTorneos, 3000);
    return () => clearInterval(interval);
  }, []);

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
    return equiposInscritos.includes(torneoId);
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
                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                  <p className="text-sm font-medium text-blue-700">
                    <span className="font-bold">ID:</span> {torneo.id}
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
