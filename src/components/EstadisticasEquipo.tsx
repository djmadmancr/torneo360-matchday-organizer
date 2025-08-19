import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Target, Shield, Clock, Calendar, TrendingUp, Users, Award } from "lucide-react";
import { obtenerEquipoIdDeUsuario } from '../utils/equipoMigration';
import { supabase } from '@/integrations/supabase/client';

interface EstadisticasEquipoProps {
  equipoId: string; // Este es el userId, pero internamente usaremos equipoId numérico
  equipoNombre: string;
}

interface EstadisticasTorneo {
  torneoId: string;
  torneoNombre: string;
  partidosJugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  golesAFavor: number;
  golesEnContra: number;
  posicion?: number;
  fechaInicio: string;
  fechaFin?: string;
  estado: 'activo' | 'finalizado';
}

interface EstadisticasJugador {
  jugadorId: string;
  jugadorNombre: string;
  minutosJugados: number;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
}

const EstadisticasEquipo: React.FC<EstadisticasEquipoProps> = ({ equipoId: userId, equipoNombre }) => {
  const [estadisticasTorneos, setEstadisticasTorneos] = useState<EstadisticasTorneo[]>([]);
  const [estadisticasJugadores, setEstadisticasJugadores] = useState<EstadisticasJugador[]>([]);
  const [filtroAnio, setFiltroAnio] = useState<string>('todos');
  const [filtroTorneo, setFiltroTorneo] = useState<string>('todos');
  const [equipoIdNumerico, setEquipoIdNumerico] = useState<number | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, [userId]);

  const cargarEstadisticas = async () => {
    // Obtener equipoId numérico del usuario actual
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      console.log('❌ No hay usuario actual para estadísticas');
      return;
    }
    
    const user = JSON.parse(userStr);
    const equipoId = obtenerEquipoIdDeUsuario(user);
    
    if (!equipoId) {
      console.log('❌ No se pudo obtener equipoId para estadísticas');
      return;
    }
    
    setEquipoIdNumerico(equipoId);
    console.log('📊 Cargando estadísticas para equipoId numérico:', equipoId);
    
    // Cargar estadísticas usando equipoId numérico
    const historialTorneos = JSON.parse(localStorage.getItem(`historialTorneos_${equipoId}`) || '[]');
    
    console.log('📈 Historial de torneos encontrado (equipoId numérico):', historialTorneos);
    
    setEstadisticasTorneos(historialTorneos);
    
    // Cargar estadísticas reales de jugadores desde Supabase
    await cargarEstadisticasJugadores(equipoId);
  };

  const cargarEstadisticasJugadores = async (equipoId: number) => {
    try {
      // Obtener el ID del equipo en Supabase
      const equipoData = JSON.parse(localStorage.getItem(`equipo_${equipoId}`) || '{}');
      if (!equipoData.id) {
        console.log('❌ No se encontró ID de equipo en Supabase');
        return;
      }
      
      // Buscar partidos completados donde participe el equipo
      const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select('*')
        .or(`home_team_id.eq.${equipoData.id},away_team_id.eq.${equipoData.id}`)
        .in('status', ['completed', 'finished']);

      if (error) {
        console.error('Error cargando fixtures para estadísticas:', error);
        return;
      }

      const jugadoresEstadisticas: EstadisticasJugador[] = [];
      const playerStatsMap: { [key: string]: EstadisticasJugador } = {};

      fixtures?.forEach((fixture: any) => {
        const matchData = fixture.match_data || {};
        
        // Procesar goles
        const goals = matchData.goals || [];
        goals.forEach((goal: any) => {
          // Solo procesar jugadores de nuestro equipo
          if (goal.team_id === equipoData.id) {
            const playerKey = goal.player_name;
            if (!playerStatsMap[playerKey]) {
              playerStatsMap[playerKey] = {
                jugadorId: goal.player_name,
                jugadorNombre: goal.player_name,
                minutosJugados: 90, // Asumimos 90 minutos por partido
                goles: 0,
                asistencias: 0,
                tarjetasAmarillas: 0,
                tarjetasRojas: 0
              };
            }
            playerStatsMap[playerKey].goles++;
          }
        });

        // Procesar tarjetas
        const cards = matchData.cards || [];
        cards.forEach((card: any) => {
          // Solo procesar jugadores de nuestro equipo
          if (card.team_id === equipoData.id) {
            const playerKey = card.player_name;
            if (!playerStatsMap[playerKey]) {
              playerStatsMap[playerKey] = {
                jugadorId: card.player_name,
                jugadorNombre: card.player_name,
                minutosJugados: 90,
                goles: 0,
                asistencias: 0,
                tarjetasAmarillas: 0,
                tarjetasRojas: 0
              };
            }
            if (card.card_type === 'yellow') {
              playerStatsMap[playerKey].tarjetasAmarillas++;
            } else if (card.card_type === 'red') {
              playerStatsMap[playerKey].tarjetasRojas++;
            }
          }
        });
      });

      const estadisticasFinales = Object.values(playerStatsMap);
      console.log('⚽ Estadísticas de jugadores cargadas desde Supabase:', estadisticasFinales);
      
      setEstadisticasJugadores(estadisticasFinales);
    } catch (error) {
      console.error('Error cargando estadísticas de jugadores:', error);
      // Fallback a datos locales
      const historialJugadores = JSON.parse(localStorage.getItem(`historialJugadores_${equipoId}`) || '[]');
      setEstadisticasJugadores(historialJugadores);
    }
  };

  const estadisticasFiltradas = estadisticasTorneos.filter(estadistica => {
    const anioTorneo = new Date(estadistica.fechaInicio).getFullYear().toString();
    const cumpleFiltroAnio = filtroAnio === 'todos' || anioTorneo === filtroAnio;
    const cumpleFiltroTorneo = filtroTorneo === 'todos' || estadistica.torneoId === filtroTorneo;
    
    return cumpleFiltroAnio && cumpleFiltroTorneo;
  });

  const calcularEstadisticasGenerales = () => {
    const stats = estadisticasFiltradas.reduce((acc, curr) => {
      acc.partidosJugados += curr.partidosJugados;
      acc.victorias += curr.victorias;
      acc.empates += curr.empates;
      acc.derrotas += curr.derrotas;
      acc.golesAFavor += curr.golesAFavor;
      acc.golesEnContra += curr.golesEnContra;
      return acc;
    }, {
      partidosJugados: 0,
      victorias: 0,
      empates: 0,
      derrotas: 0,
      golesAFavor: 0,
      golesEnContra: 0
    });

    const porcentajeVictorias = stats.partidosJugados > 0 ? (stats.victorias / stats.partidosJugados * 100).toFixed(1) : '0';
    const golesPorPartido = stats.partidosJugados > 0 ? (stats.golesAFavor / stats.partidosJugados).toFixed(1) : '0';
    const arcosEnCero = stats.partidosJugados > 0 ? Math.max(0, (stats.partidosJugados - stats.golesEnContra) / stats.partidosJugados * 100).toFixed(1) : '0';

    return {
      ...stats,
      porcentajeVictorias,
      golesPorPartido,
      arcosEnCero
    };
  };

  const obtenerJugadoresConMasMinutos = () => {
    return estadisticasJugadores
      .sort((a, b) => b.minutosJugados - a.minutosJugados)
      .slice(0, 5);
  };

  const obtenerAniosDisponibles = () => {
    const anios = estadisticasTorneos.map(est => new Date(est.fechaInicio).getFullYear());
    return [...new Set(anios)].sort((a, b) => b - a);
  };

  const obtenerTorneosDisponibles = () => {
    return estadisticasTorneos.map(est => ({
      id: est.torneoId,
      nombre: est.torneoNombre
    }));
  };

  const statsGenerales = calcularEstadisticasGenerales();
  const jugadoresTopMinutos = obtenerJugadoresConMasMinutos();
  const aniosDisponibles = obtenerAniosDisponibles();
  const torneosDisponibles = obtenerTorneosDisponibles();

  if (estadisticasTorneos.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay estadísticas disponibles</h3>
        <p className="text-gray-500">Las estadísticas se generarán automáticamente cuando el equipo participe en torneos y se ingresen resultados reales</p>
        {equipoIdNumerico && (
          <p className="text-xs text-blue-600 mt-2">
            EquipoID: {equipoIdNumerico}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del equipo */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estadísticas del Equipo</h2>
        {equipoIdNumerico && (
          <Badge variant="secondary">EquipoID: {equipoIdNumerico}</Badge>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Select value={filtroAnio} onValueChange={setFiltroAnio}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los años</SelectItem>
              {aniosDisponibles.map(anio => (
                <SelectItem key={anio} value={anio.toString()}>{anio}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={filtroTorneo} onValueChange={setFiltroTorneo}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por torneo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los torneos</SelectItem>
              {torneosDisponibles.map(torneo => (
                <SelectItem key={torneo.id} value={torneo.id}>{torneo.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statsGenerales.partidosJugados}</div>
            <div className="text-sm text-muted-foreground">Partidos Jugados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statsGenerales.porcentajeVictorias}%</div>
            <div className="text-sm text-muted-foreground">% Victorias</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{statsGenerales.golesPorPartido}</div>
            <div className="text-sm text-muted-foreground">Goles por Partido</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{statsGenerales.arcosEnCero}%</div>
            <div className="text-sm text-muted-foreground">% Arcos en Cero</div>
          </CardContent>
        </Card>
      </div>

      {/* Detalle por Torneo */}
      {estadisticasFiltradas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Rendimiento por Torneo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estadisticasFiltradas.map((torneo) => (
                <div key={torneo.torneoId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{torneo.torneoNombre}</h4>
                      <p className="text-sm text-muted-foreground font-mono">ID: {torneo.torneoId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={torneo.estado === 'finalizado' ? 'secondary' : 'default'}>
                        {torneo.estado === 'finalizado' ? 'Finalizado' : 'En curso'}
                      </Badge>
                      <Badge variant="outline">{new Date(torneo.fechaInicio).getFullYear()}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Partidos:</span>
                      <div className="font-medium">{torneo.partidosJugados}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">V-E-D:</span>
                      <div className="font-medium">{torneo.victorias}-{torneo.empates}-{torneo.derrotas}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Goles:</span>
                      <div className="font-medium">{torneo.golesAFavor}-{torneo.golesEnContra}</div>
                    </div>
                    {torneo.posicion && (
                      <div>
                        <span className="text-muted-foreground">Posición:</span>
                        <div className="font-medium">#{torneo.posicion}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas de Jugadores */}
      {estadisticasJugadores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goleadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Top Goleadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estadisticasJugadores
                  .filter(jugador => jugador.goles > 0)
                  .sort((a, b) => b.goles - a.goles)
                  .slice(0, 5)
                  .map((jugador, index) => (
                    <div key={jugador.jugadorId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{jugador.jugadorNombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {jugador.tarjetasAmarillas} amarillas • {jugador.tarjetasRojas} rojas
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{jugador.goles}</div>
                        <div className="text-sm text-muted-foreground">goles</div>
                      </div>
                    </div>
                  ))}
                {estadisticasJugadores.filter(j => j.goles > 0).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay goleadores registrados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tarjetas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Tarjetas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estadisticasJugadores
                  .filter(jugador => jugador.tarjetasAmarillas > 0 || jugador.tarjetasRojas > 0)
                  .sort((a, b) => (b.tarjetasAmarillas + b.tarjetasRojas * 2) - (a.tarjetasAmarillas + a.tarjetasRojas * 2))
                  .slice(0, 5)
                  .map((jugador, index) => (
                    <div key={jugador.jugadorId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{jugador.jugadorNombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {jugador.goles} goles en total
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        {jugador.tarjetasAmarillas > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-4 bg-yellow-400 rounded-sm"></div>
                            <span className="text-sm font-medium">{jugador.tarjetasAmarillas}</span>
                          </div>
                        )}
                        {jugador.tarjetasRojas > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                            <span className="text-sm font-medium">{jugador.tarjetasRojas}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                {estadisticasJugadores.filter(j => j.tarjetasAmarillas > 0 || j.tarjetasRojas > 0).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay tarjetas registradas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EstadisticasEquipo;
