
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users } from "lucide-react";

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

interface TorneoEstadisticasProps {
  torneo: Torneo;
  equiposTorneo: EquipoTabla[];
  resultadosTorneo: Resultado[];
  goleadoresTorneo: Goleador[];
}

const TorneoEstadisticas = ({ torneo, equiposTorneo, resultadosTorneo, goleadoresTorneo }: TorneoEstadisticasProps) => {
  const equiposFiltrados = equiposTorneo.slice(0, 6);
  const resultadosFiltrados = resultadosTorneo.slice(0, 5);
  const goleadoresFiltrados = goleadoresTorneo.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <img 
          src={torneo.logo} 
          alt={torneo.nombre}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{torneo.nombre}</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{torneo.categoria}</span>
            <span>•</span>
            <span>{torneo.formato}</span>
            <span>•</span>
            <Badge variant={
              torneo.estado === "en_curso" ? "default" :
              torneo.estado === "inscripciones_abiertas" ? "secondary" :
              torneo.estado === "finalizado" ? "outline" : "destructive"
            }>
              {torneo.estado.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Tabla de Posiciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {equiposFiltrados.map((equipo, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <img 
                      src={equipo.logo} 
                      alt={equipo.nombre}
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{equipo.nombre}</p>
                      <p className="text-xs text-muted-foreground">PJ: {equipo.pj}</p>
                    </div>
                  </div>
                  <span className="font-bold">{equipo.pts}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Goleadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goleadoresFiltrados.map((goleador, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <img 
                      src={goleador.logoEquipo} 
                      alt={goleador.equipo}
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{goleador.nombre}</p>
                      <p className="text-xs text-muted-foreground">{goleador.equipo}</p>
                    </div>
                  </div>
                  <span className="font-bold">{goleador.goles}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Información del Torneo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Equipos:</span>
              <span>{torneo.equiposInscritos}/{torneo.maxEquipos}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fecha Inicio:</span>
              <span>{torneo.fechaInicio || 'Por definir'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fecha Fin:</span>
              <span>{torneo.fechaFin || 'Por definir'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Partidos/Semana:</span>
              <span>{torneo.partidosPorSemana}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Días: </span>
              <span>{torneo.diasSemana.join(', ')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resultadosFiltrados.length > 0 ? resultadosFiltrados.map((resultado, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={resultado.logoLocal} 
                    alt={resultado.equipoLocal}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <span className="font-medium">{resultado.equipoLocal}</span>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {resultado.golesLocal} - {resultado.golesVisitante}
                  </div>
                  <div className="text-xs text-muted-foreground">{resultado.fecha}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{resultado.equipoVisitante}</span>
                  <img 
                    src={resultado.logoVisitante} 
                    alt={resultado.equipoVisitante}
                    className="w-8 h-8 rounded object-cover"
                  />
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground">No hay resultados disponibles para este torneo</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TorneoEstadisticas;
