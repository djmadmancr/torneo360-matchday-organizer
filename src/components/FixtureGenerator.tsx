
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy } from 'lucide-react';

interface Equipo {
  id: string;
  nombre: string;
  logo: string;
}

interface Partido {
  id: string;
  equipoLocal: Equipo;
  equipoVisitante: Equipo;
  fecha: string;
  hora: string;
  fase: string;
  grupo?: string;
  estado: 'programado' | 'jugado' | 'suspendido';
  resultado?: {
    golesLocal: number;
    golesVisitante: number;
  };
}

interface Torneo {
  id: string;
  nombre: string;
  formato: string;
  equiposInscritos: number;
  maxEquipos: number;
}

interface FixtureGeneratorProps {
  torneo: Torneo;
  equipos: Equipo[];
}

const FixtureGenerator: React.FC<FixtureGeneratorProps> = ({ torneo, equipos }) => {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [fixtureGenerado, setFixtureGenerado] = useState(false);

  const generarFixture = () => {
    const nuevosPartidos: Partido[] = [];
    let partidoId = 1;

    if (torneo.formato.includes('Grupos')) {
      // Generar partidos de grupos
      const grupoA = equipos.slice(0, Math.ceil(equipos.length / 2));
      const grupoB = equipos.slice(Math.ceil(equipos.length / 2));

      [grupoA, grupoB].forEach((grupo, grupoIndex) => {
        const nombreGrupo = grupoIndex === 0 ? 'A' : 'B';
        
        for (let i = 0; i < grupo.length; i++) {
          for (let j = i + 1; j < grupo.length; j++) {
            nuevosPartidos.push({
              id: `P${partidoId.toString().padStart(3, '0')}`,
              equipoLocal: grupo[i],
              equipoVisitante: grupo[j],
              fecha: new Date(Date.now() + partidoId * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              hora: '15:00',
              fase: 'Grupos',
              grupo: `Grupo ${nombreGrupo}`,
              estado: 'programado'
            });
            partidoId++;
          }
        }
      });
    } else if (torneo.formato.includes('Eliminatorio')) {
      // Generar eliminatorias
      let equiposRestantes = [...equipos];
      let fase = 'Octavos';
      
      if (equiposRestantes.length <= 4) fase = 'Semifinal';
      if (equiposRestantes.length <= 2) fase = 'Final';

      while (equiposRestantes.length >= 2) {
        const partidosFase: Partido[] = [];
        
        for (let i = 0; i < equiposRestantes.length; i += 2) {
          if (i + 1 < equiposRestantes.length) {
            partidosFase.push({
              id: `P${partidoId.toString().padStart(3, '0')}`,
              equipoLocal: equiposRestantes[i],
              equipoVisitante: equiposRestantes[i + 1],
              fecha: new Date(Date.now() + partidoId * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              hora: '15:00',
              fase: fase,
              estado: 'programado'
            });
            partidoId++;
          }
        }
        
        nuevosPartidos.push(...partidosFase);
        equiposRestantes = equiposRestantes.slice(0, Math.ceil(equiposRestantes.length / 2));
        
        if (fase === 'Octavos') fase = 'Cuartos';
        else if (fase === 'Cuartos') fase = 'Semifinal';
        else if (fase === 'Semifinal') fase = 'Final';
        else break;
      }
    } else {
      // Todos contra todos
      for (let i = 0; i < equipos.length; i++) {
        for (let j = i + 1; j < equipos.length; j++) {
          nuevosPartidos.push({
            id: `P${partidoId.toString().padStart(3, '0')}`,
            equipoLocal: equipos[i],
            equipoVisitante: equipos[j],
            fecha: new Date(Date.now() + partidoId * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hora: '15:00',
            fase: 'Liga',
            estado: 'programado'
          });
          partidoId++;
        }
      }
    }

    setPartidos(nuevosPartidos);
    setFixtureGenerado(true);
  };

  const agruparPartidosPorFase = () => {
    const agrupados: { [key: string]: Partido[] } = {};
    partidos.forEach(partido => {
      const clave = partido.grupo ? `${partido.fase} - ${partido.grupo}` : partido.fase;
      if (!agrupados[clave]) {
        agrupados[clave] = [];
      }
      agrupados[clave].push(partido);
    });
    return agrupados;
  };

  const partidosAgrupados = agruparPartidosPorFase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fixture del Torneo</h3>
        {!fixtureGenerado ? (
          <Button onClick={generarFixture}>
            <Calendar className="w-4 h-4 mr-2" />
            Generar Fixture
          </Button>
        ) : (
          <Badge variant="secondary">Fixture Generado</Badge>
        )}
      </div>

      {fixtureGenerado && (
        <div className="space-y-4">
          {Object.entries(partidosAgrupados).map(([fase, partidosFase]) => (
            <Card key={fase}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {fase}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partidosFase.map((partido) => (
                    <div key={partido.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src={partido.equipoLocal.logo} 
                            alt={partido.equipoLocal.nombre}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="font-medium">{partido.equipoLocal.nombre}</span>
                        </div>
                        <span className="text-muted-foreground">vs</span>
                        <div className="flex items-center gap-2">
                          <img 
                            src={partido.equipoVisitante.logo} 
                            alt={partido.equipoVisitante.nombre}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="font-medium">{partido.equipoVisitante.nombre}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{partido.fecha}</div>
                        <div className="text-sm">{partido.hora}</div>
                        <Badge variant="outline">{partido.estado}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FixtureGenerator;
