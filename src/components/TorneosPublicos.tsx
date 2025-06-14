
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Trophy, Star } from "lucide-react";

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
}

const TorneosPublicos: React.FC<TorneosPublicosProps> = ({ onInscribirse, equipoCategoria }) => {
  const [torneos, setTorneos] = React.useState<TorneoPublico[]>([]);

  React.useEffect(() => {
    const cargarTorneos = () => {
      const torneosPublicos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
      const torneosDisponibles = torneosPublicos.filter((t: TorneoPublico) => 
        t.esPublico && 
        t.estado === 'inscripciones_abiertas' &&
        t.equiposInscritos < t.maxEquipos
      );
      setTorneos(torneosDisponibles);
    };

    cargarTorneos();
    const interval = setInterval(cargarTorneos, 5000);
    return () => clearInterval(interval);
  }, []);

  const puedeInscribirse = (torneo: TorneoPublico) => {
    // Verificar categoría
    if (torneo.categoria !== equipoCategoria && torneo.categoria !== 'Libre') {
      return false;
    }
    
    // Verificar cupos disponibles
    if (torneo.equiposInscritos >= torneo.maxEquipos) {
      return false;
    }

    // Verificar fecha de cierre
    const fechaCierre = new Date(torneo.fechaCierre);
    const hoy = new Date();
    if (hoy > fechaCierre) {
      return false;
    }

    return true;
  };

  const getRazonNoInscripcion = (torneo: TorneoPublico) => {
    if (torneo.categoria !== equipoCategoria && torneo.categoria !== 'Libre') {
      return `Categoría requerida: ${torneo.categoria}`;
    }
    if (torneo.equiposInscritos >= torneo.maxEquipos) {
      return 'Cupos agotados';
    }
    const fechaCierre = new Date(torneo.fechaCierre);
    const hoy = new Date();
    if (hoy > fechaCierre) {
      return 'Inscripciones cerradas';
    }
    return '';
  };

  if (torneos.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay torneos disponibles</h3>
        <p className="text-gray-500">Los torneos públicos aparecerán aquí cuando estén disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Torneos Disponibles</h2>
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
                </div>
                <Badge variant="secondary">{torneo.categoria}</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{torneo.equiposInscritos}/{torneo.maxEquipos}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
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
                {torneo.ubicacion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{torneo.ubicacion}</span>
                  </div>
                )}
              </div>

              {torneo.descripcion && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {torneo.descripcion}
                </p>
              )}

              {(torneo.edadMinima || torneo.edadMaxima) && (
                <div className="text-sm">
                  <span className="font-medium">Edad: </span>
                  {torneo.edadMinima && torneo.edadMaxima ? (
                    <span>{torneo.edadMinima} - {torneo.edadMaxima} años</span>
                  ) : torneo.edadMinima ? (
                    <span>Mínimo {torneo.edadMinima} años</span>
                  ) : (
                    <span>Máximo {torneo.edadMaxima} años</span>
                  )}
                </div>
              )}

              <div className="pt-2">
                {puedeInscribirse(torneo) ? (
                  <Button 
                    onClick={() => onInscribirse(torneo)}
                    className="w-full"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Solicitar Inscripción
                  </Button>
                ) : (
                  <Button 
                    disabled 
                    className="w-full"
                    variant="outline"
                  >
                    {getRazonNoInscripcion(torneo)}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TorneosPublicos;
