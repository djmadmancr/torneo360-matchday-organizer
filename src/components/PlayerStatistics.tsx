
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target } from 'lucide-react';

interface JugadorGoleador {
  id: string;
  nombre: string;
  posicion: string;
  goles: number;
  torneos: string[];
}

interface PlayerStatisticsProps {
  jugadores: any[];
  className?: string;
}

const PlayerStatistics: React.FC<PlayerStatisticsProps> = ({ jugadores, className }) => {
  // Generar estadísticas demo para los goleadores
  const generarEstadisticasGoleadores = (): JugadorGoleador[] => {
    return jugadores.slice(0, 5).map((jugador, index) => ({
      id: jugador.id,
      nombre: jugador.nombre,
      posicion: jugador.posicion,
      goles: Math.floor(Math.random() * 15) + 5 - index * 2, // Generar goles de forma decreciente
      torneos: ['Copa Primavera 2024', 'Liga Municipal Otoño']
    })).sort((a, b) => b.goles - a.goles);
  };

  const goleadores = generarEstadisticasGoleadores();

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Top 5 Goleadores del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {goleadores.length > 0 ? goleadores.map((jugador, index) => (
              <div key={jugador.id} className="flex items-center justify-between p-3 rounded bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-primary text-primary-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{jugador.nombre}</p>
                    <p className="text-sm text-muted-foreground">{jugador.posicion}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span className="font-bold text-lg">{jugador.goles}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">goles</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">
                No hay jugadores registrados para mostrar estadísticas
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerStatistics;
