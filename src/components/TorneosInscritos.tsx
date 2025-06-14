
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Calendar, MapPin, Users, Eye, Award } from "lucide-react";
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
  };
}

interface TorneosInscritosProps {
  equipoId: string;
  equipoNombre: string;
}

const TorneosInscritos: React.FC<TorneosInscritosProps> = ({ equipoId, equipoNombre }) => {
  const [torneosInscritos, setTorneosInscritos] = useState<TorneoInscrito[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<TorneoInscrito | null>(null);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);

  useEffect(() => {
    const cargarTorneosInscritos = () => {
      // Cargar torneos donde el equipo fue aceptado
      const notificaciones = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
      const solicitudesAceptadas = notificaciones.filter((n: any) => 
        n.equipoId === equipoId && 
        n.tipo === 'aprobacion'
      );

      // Obtener información completa de los torneos
      const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
      const torneosInscritosData = solicitudesAceptadas.map((solicitud: any) => {
        const torneo = torneosPublicos.find((t: any) => t.id === solicitud.torneoId);
        if (torneo) {
          return {
            ...torneo,
            equipoStats: generarEstadisticasEjemplo()
          };
        }
        return null;
      }).filter(Boolean);

      setTorneosInscritos(torneosInscritosData);
    };

    cargarTorneosInscritos();
    const interval = setInterval(cargarTorneosInscritos, 5000);
    return () => clearInterval(interval);
  }, [equipoId]);

  const generarEstadisticasEjemplo = () => {
    const partidosJugados = Math.floor(Math.random() * 10) + 1;
    const victorias = Math.floor(Math.random() * partidosJugados);
    const empates = Math.floor(Math.random() * (partidosJugados - victorias));
    const derrotas = partidosJugados - victorias - empates;
    
    return {
      partidosJugados,
      victorias,
      empates,
      derrotas,
      golesAFavor: Math.floor(Math.random() * 20) + 1,
      golesEnContra: Math.floor(Math.random() * 15) + 1,
      posicion: Math.floor(Math.random() * 8) + 1
    };
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en_progreso':
        return <Badge className="bg-blue-500">En Progreso</Badge>;
      case 'finalizado':
        return <Badge variant="secondary">Finalizado</Badge>;
      case 'inscripciones_abiertas':
        return <Badge className="bg-green-500">Por Comenzar</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const verEstadisticasTorneo = (torneo: TorneoInscrito) => {
    setTorneoSeleccionado(torneo);
    setMostrarEstadisticas(true);
  };

  if (torneosInscritos.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay torneos inscritos</h3>
        <p className="text-gray-500">Los torneos en los que participes aparecerán aquí</p>
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

              {torneo.equipoStats && (
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Mi Rendimiento</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Partidos: {torneo.equipoStats.partidosJugados}</div>
                    <div>Posición: #{torneo.equipoStats.posicion}</div>
                    <div>Victorias: {torneo.equipoStats.victorias}</div>
                    <div>Goles: {torneo.equipoStats.golesAFavor}</div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  onClick={() => verEstadisticasTorneo(torneo)}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Estadísticas
                </Button>
              </div>
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
              Estadísticas en {torneoSeleccionado?.nombre}
            </DialogTitle>
          </DialogHeader>
          
          {torneoSeleccionado && (
            <div className="mt-4">
              <EstadisticasEquipo 
                equipoId={equipoId} 
                equipoNombre={equipoNombre}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TorneosInscritos;
