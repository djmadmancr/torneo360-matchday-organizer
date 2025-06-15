import React, { useState, useEffect } from 'react';
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
  const [equiposInscritos, setEquiposInscritos] = useState<Equipo[]>([]);

  useEffect(() => {
    // Cargar equipos inscritos desde localStorage
    const cargarEquiposInscritos = () => {
      const equiposData: Equipo[] = [];
      
      // Buscar todas las inscripciones aprobadas para este torneo
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`inscripcion_${torneo.id}_`)) {
          const inscripcionData = JSON.parse(localStorage.getItem(key) || '{}');
          if (inscripcionData.estado === 'aprobado') {
            const equipoId = inscripcionData.equipoId;
            
            // Buscar datos del equipo
            const equipoKey = `equipo_${equipoId}`;
            const equipoData = JSON.parse(localStorage.getItem(equipoKey) || '{}');
            
            if (equipoData.nombre) {
              equiposData.push({
                id: equipoId.toString(),
                nombre: equipoData.nombre,
                logo: equipoData.logo || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center"
              });
            }
          }
        }
      }
      
      console.log('🏆 Equipos inscritos cargados para fixture:', equiposData);
      setEquiposInscritos(equiposData);
    };

    cargarEquiposInscritos();

    // Escuchar cambios en las inscripciones
    const handleInscripcionesUpdate = () => {
      cargarEquiposInscritos();
    };

    window.addEventListener('torneosInscritosUpdate', handleInscripcionesUpdate);
    
    return () => {
      window.removeEventListener('torneosInscritosUpdate', handleInscripcionesUpdate);
    };
  }, [torneo.id]);

  const generarFixture = () => {
    if (equiposInscritos.length < 2) {
      alert('Se necesitan al menos 2 equipos inscritos para generar el fixture');
      return;
    }

    const nuevosPartidos: Partido[] = [];
    let partidoId = 1;

    console.log('🏁 Generando fixture con equipos:', equiposInscritos);

    if (torneo.formato.includes('Grupos')) {
      // Generar partidos de grupos
      const grupoA = equiposInscritos.slice(0, Math.ceil(equiposInscritos.length / 2));
      const grupoB = equiposInscritos.slice(Math.ceil(equiposInscritos.length / 2));

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
      let equiposRestantes = [...equiposInscritos];
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
      for (let i = 0; i < equiposInscritos.length; i++) {
        for (let j = i + 1; j < equiposInscritos.length; j++) {
          nuevosPartidos.push({
            id: `P${partidoId.toString().padStart(3, '0')}`,
            equipoLocal: equiposInscritos[i],
            equipoVisitante: equiposInscritos[j],
            fecha: new Date(Date.now() + partidoId * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hora: '15:00',
            fase: 'Liga',
            estado: 'programado'
          });
          partidoId++;
        }
      }
    }

    console.log('⚽ Fixture generado:', nuevosPartidos);
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
        <div>
          <h3 className="text-lg font-semibold">Fixture del Torneo</h3>
          <p className="text-sm text-muted-foreground">
            Equipos inscritos: {equiposInscritos.length} / {torneo.maxEquipos}
          </p>
        </div>
        {!fixtureGenerado ? (
          <div className="text-right">
            {equiposInscritos.length < 2 ? (
              <p className="text-sm text-red-500 mb-2">Se necesitan al menos 2 equipos inscritos</p>
            ) : null}
            <Button 
              onClick={generarFixture}
              disabled={equiposInscritos.length < 2}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Generar Fixture
            </Button>
          </div>
        ) : (
          <Badge variant="secondary">Fixture Generado</Badge>
        )}
      </div>

      {equiposInscritos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Equipos Inscritos ({equiposInscritos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {equiposInscritos.map((equipo) => (
                <div key={equipo.id} className="flex items-center gap-2 p-2 border rounded-lg">
                  <img 
                    src={equipo.logo} 
                    alt={equipo.nombre}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <span className="text-sm font-medium truncate">{equipo.nombre}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
