
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Trophy, Target, Shield, Clock, Users } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface EstadisticasEquipoProps {
  equipoId: string;
  equipoNombre: string;
}

interface PartidoStats {
  id: string;
  torneoId: string;
  torneoNombre: string;
  fecha: string;
  rival: string;
  golesAFavor: number;
  golesEnContra: number;
  resultado: 'victoria' | 'empate' | 'derrota';
  jugadoresStats: {
    jugadorId: string;
    jugadorNombre: string;
    minutosJugados: number;
    goles: number;
    asistencias: number;
    tarjetasAmarillas: number;
    tarjetasRojas: number;
  }[];
}

const EstadisticasEquipo: React.FC<EstadisticasEquipoProps> = ({ equipoId, equipoNombre }) => {
  const [filtroTorneo, setFiltroTorneo] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('todos');

  // Cargar estadísticas del localStorage
  const [partidosStats, setPartidosStats] = useState<PartidoStats[]>(() => {
    const stats = localStorage.getItem(`estadisticasEquipo_${equipoId}`);
    return stats ? JSON.parse(stats) : [];
  });

  // Obtener torneos únicos para el filtro
  const torneosDisponibles = useMemo(() => {
    const torneos = [...new Set(partidosStats.map(p => ({ id: p.torneoId, nombre: p.torneoNombre })))];
    return torneos;
  }, [partidosStats]);

  // Filtrar partidos según criterios seleccionados
  const partidosFiltrados = useMemo(() => {
    let partidos = [...partidosStats];
    
    if (filtroTorneo !== 'todos') {
      partidos = partidos.filter(p => p.torneoId === filtroTorneo);
    }
    
    if (filtroFecha !== 'todos') {
      const hoy = new Date();
      const fechaLimite = new Date();
      
      switch (filtroFecha) {
        case 'ultimo_mes':
          fechaLimite.setMonth(hoy.getMonth() - 1);
          break;
        case 'ultimos_3_meses':
          fechaLimite.setMonth(hoy.getMonth() - 3);
          break;
        case 'ultimo_año':
          fechaLimite.setFullYear(hoy.getFullYear() - 1);
          break;
      }
      
      partidos = partidos.filter(p => new Date(p.fecha) >= fechaLimite);
    }
    
    return partidos;
  }, [partidosStats, filtroTorneo, filtroFecha]);

  // Calcular estadísticas generales
  const estadisticasGenerales = useMemo(() => {
    if (partidosFiltrados.length === 0) {
      return {
        partidosJugados: 0,
        victorias: 0,
        empates: 0,
        derrotas: 0,
        golesAFavor: 0,
        golesEnContra: 0,
        porcentajeGoles: 0,
        arcosEnCero: 0,
        porcentajeArcosEnCero: 0
      };
    }

    const victorias = partidosFiltrados.filter(p => p.resultado === 'victoria').length;
    const empates = partidosFiltrados.filter(p => p.resultado === 'empate').length;
    const derrotas = partidosFiltrados.filter(p => p.resultado === 'derrota').length;
    const golesAFavor = partidosFiltrados.reduce((sum, p) => sum + p.golesAFavor, 0);
    const golesEnContra = partidosFiltrados.reduce((sum, p) => sum + p.golesEnContra, 0);
    const arcosEnCero = partidosFiltrados.filter(p => p.golesEnContra === 0).length;

    return {
      partidosJugados: partidosFiltrados.length,
      victorias,
      empates,
      derrotas,
      golesAFavor,
      golesEnContra,
      porcentajeGoles: partidosFiltrados.length > 0 ? (golesAFavor / partidosFiltrados.length) : 0,
      arcosEnCero,
      porcentajeArcosEnCero: partidosFiltrados.length > 0 ? (arcosEnCero / partidosFiltrados.length) * 100 : 0
    };
  }, [partidosFiltrados]);

  // Calcular estadísticas de jugadores
  const estadisticasJugadores = useMemo(() => {
    const jugadorStats: { [key: string]: any } = {};

    partidosFiltrados.forEach(partido => {
      partido.jugadoresStats.forEach(jugador => {
        if (!jugadorStats[jugador.jugadorId]) {
          jugadorStats[jugador.jugadorId] = {
            nombre: jugador.jugadorNombre,
            minutosJugados: 0,
            goles: 0,
            asistencias: 0,
            partidosJugados: 0
          };
        }
        
        jugadorStats[jugador.jugadorId].minutosJugados += jugador.minutosJugados;
        jugadorStats[jugador.jugadorId].goles += jugador.goles;
        jugadorStats[jugador.jugadorId].asistencias += jugador.asistencias;
        if (jugador.minutosJugados > 0) {
          jugadorStats[jugador.jugadorId].partidosJugados++;
        }
      });
    });

    return Object.values(jugadorStats).sort((a: any, b: any) => b.minutosJugados - a.minutosJugados);
  }, [partidosFiltrados]);

  // Datos para gráficos
  const datosResultados = [
    { name: 'Victorias', value: estadisticasGenerales.victorias, color: '#22c55e' },
    { name: 'Empates', value: estadisticasGenerales.empates, color: '#eab308' },
    { name: 'Derrotas', value: estadisticasGenerales.derrotas, color: '#ef4444' }
  ];

  const datosGolesPorMes = useMemo(() => {
    const meses: { [key: string]: number } = {};
    
    partidosFiltrados.forEach(partido => {
      const fecha = new Date(partido.fecha);
      const mesAño = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
      meses[mesAño] = (meses[mesAño] || 0) + partido.golesAFavor;
    });

    return Object.entries(meses).map(([mes, goles]) => ({
      mes,
      goles
    })).slice(-6); // Últimos 6 meses
  }, [partidosFiltrados]);

  // Generar datos de ejemplo si no hay estadísticas
  React.useEffect(() => {
    if (partidosStats.length === 0) {
      const estadisticasEjemplo: PartidoStats[] = [
        {
          id: 'partido1',
          torneoId: 'torneo1',
          torneoNombre: 'Liga Primavera 2024',
          fecha: '2024-05-15',
          rival: 'FC Rivales',
          golesAFavor: 2,
          golesEnContra: 1,
          resultado: 'victoria',
          jugadoresStats: [
            { jugadorId: 'j1', jugadorNombre: 'Juan Pérez', minutosJugados: 90, goles: 1, asistencias: 0, tarjetasAmarillas: 0, tarjetasRojas: 0 },
            { jugadorId: 'j2', jugadorNombre: 'Carlos López', minutosJugados: 85, goles: 1, asistencias: 1, tarjetasAmarillas: 1, tarjetasRojas: 0 }
          ]
        },
        {
          id: 'partido2',
          torneoId: 'torneo1',
          torneoNombre: 'Liga Primavera 2024',
          fecha: '2024-05-22',
          rival: 'Deportivo Unidos',
          golesAFavor: 0,
          golesEnContra: 0,
          resultado: 'empate',
          jugadoresStats: [
            { jugadorId: 'j1', jugadorNombre: 'Juan Pérez', minutosJugados: 90, goles: 0, asistencias: 0, tarjetasAmarillas: 0, tarjetasRojas: 0 },
            { jugadorId: 'j2', jugadorNombre: 'Carlos López', minutosJugados: 90, goles: 0, asistencias: 0, tarjetasAmarillas: 0, tarjetasRojas: 0 }
          ]
        }
      ];
      setPartidosStats(estadisticasEjemplo);
      localStorage.setItem(`estadisticasEquipo_${equipoId}`, JSON.stringify(estadisticasEjemplo));
    }
  }, [equipoId, partidosStats.length]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Filtros de Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Torneo</label>
              <Select value={filtroTorneo} onValueChange={setFiltroTorneo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar torneo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los torneos</SelectItem>
                  {torneosDisponibles.map(torneo => (
                    <SelectItem key={torneo.id} value={torneo.id}>
                      {torneo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={filtroFecha} onValueChange={setFiltroFecha}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todo el tiempo</SelectItem>
                  <SelectItem value="ultimo_mes">Último mes</SelectItem>
                  <SelectItem value="ultimos_3_meses">Últimos 3 meses</SelectItem>
                  <SelectItem value="ultimo_año">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{estadisticasGenerales.partidosJugados}</p>
                <p className="text-sm text-muted-foreground">Partidos Jugados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{estadisticasGenerales.porcentajeGoles.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Goles por Partido</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{estadisticasGenerales.porcentajeArcosEnCero.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Arcos en Cero</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{estadisticasGenerales.victorias}</p>
                <p className="text-sm text-muted-foreground">Victorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                victorias: { label: "Victorias", color: "#22c55e" },
                empates: { label: "Empates", color: "#eab308" },
                derrotas: { label: "Derrotas", color: "#ef4444" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosResultados}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {datosResultados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goles por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                goles: { label: "Goles", color: "#3b82f6" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGolesPorMes}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="goles" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Jugadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Jugadores con Más Minutos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {estadisticasJugadores.slice(0, 5).map((jugador: any, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{jugador.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {jugador.partidosJugados} partidos jugados
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{jugador.minutosJugados} min</p>
                  <p className="text-sm text-muted-foreground">
                    {jugador.goles} goles | {jugador.asistencias} asist.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstadisticasEquipo;
