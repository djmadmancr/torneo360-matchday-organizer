
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users, Target, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  estado: string;
  organizadorId?: string;
}

interface EquipoInscrito {
  id: string;
  nombre: string;
  logo: string;
  categoria: string;
  fechaInscripcion: string;
  grupo?: string;
  posicion?: number;
}

interface EstadisticasReales {
  partidosJugados: number;
  golesTotales: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
}

interface TorneoEstadisticasProps {
  torneo: Torneo;
  equiposTorneo: any[];
  resultadosTorneo: any[];
  goleadoresTorneo: any[];
  esOrganizador?: boolean;
}

const TorneoEstadisticas: React.FC<TorneoEstadisticasProps> = ({ 
  torneo, 
  equiposTorneo, 
  resultadosTorneo, 
  goleadoresTorneo,
  esOrganizador = false
}) => {
  const [equiposInscritos, setEquiposInscritos] = useState<EquipoInscrito[]>([]);
  const [estadisticasReales, setEstadisticasReales] = useState<EstadisticasReales>({
    partidosJugados: 0,
    golesTotales: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0
  });

  useEffect(() => {
    cargarEquiposInscritos();
    calcularEstadisticasReales();
  }, [torneo.id]);

  const cargarEquiposInscritos = () => {
    console.log('📊 Cargando equipos inscritos para torneo:', torneo.id);
    
    const equiposData: EquipoInscrito[] = [];
    
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
              logo: equipoData.logo || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center",
              categoria: torneo.categoria,
              fechaInscripcion: inscripcionData.fechaInscripcion || new Date().toISOString(),
              grupo: `Grupo ${String.fromCharCode(65 + (equiposData.length % 4))}`, // A, B, C, D
              posicion: equiposData.length + 1
            });
          }
        }
      }
    }
    
    console.log('🏆 Equipos inscritos cargados:', equiposData);
    setEquiposInscritos(equiposData);
  };

  const calcularEstadisticasReales = () => {
    // Buscar partidos jugados para este torneo
    const partidosKey = `partidos_${torneo.id}`;
    const partidosData = JSON.parse(localStorage.getItem(partidosKey) || '[]');
    
    // Buscar resultados del torneo
    const resultadosKey = `resultados_${torneo.id}`;
    const resultadosData = JSON.parse(localStorage.getItem(resultadosKey) || '[]');
    
    // Calcular estadísticas reales basadas en los datos existentes
    let partidosJugados = 0;
    let golesTotales = 0;
    let tarjetasAmarillas = 0;
    let tarjetasRojas = 0;

    // Contar partidos con estado 'jugado'
    partidosJugados = partidosData.filter((partido: any) => partido.estado === 'jugado').length;
    
    // Sumar goles de los resultados
    resultadosData.forEach((resultado: any) => {
      if (resultado.golesLocal !== undefined && resultado.golesVisitante !== undefined) {
        golesTotales += resultado.golesLocal + resultado.golesVisitante;
      }
      
      // Sumar tarjetas si existen
      if (resultado.tarjetasAmarillas) tarjetasAmarillas += resultado.tarjetasAmarillas;
      if (resultado.tarjetasRojas) tarjetasRojas += resultado.tarjetasRojas;
    });

    console.log('📈 Estadísticas calculadas:', {
      partidosJugados,
      golesTotales,
      tarjetasAmarillas,
      tarjetasRojas
    });

    setEstadisticasReales({
      partidosJugados,
      golesTotales,
      tarjetasAmarillas,
      tarjetasRojas
    });
  };

  // Datos para gráficos basados en estadísticas reales
  const estadisticasGenerales = [
    { nombre: "Partidos Jugados", valor: estadisticasReales.partidosJugados, color: "#3b82f6" },
    { nombre: "Goles Totales", valor: estadisticasReales.golesTotales, color: "#22c55e" },
    { nombre: "Tarjetas Amarillas", valor: estadisticasReales.tarjetasAmarillas, color: "#f59e0b" },
    { nombre: "Tarjetas Rojas", valor: estadisticasReales.tarjetasRojas, color: "#ef4444" }
  ];

  // Generar datos de partidos por fecha basado en equipos inscritos
  const generarPartidosPorFecha = () => {
    const totalEquipos = equiposInscritos.length;
    if (totalEquipos < 2) return [];

    const fechas = [];
    const partidosPorFecha = Math.floor(totalEquipos / 2);
    
    for (let i = 1; i <= 3; i++) {
      fechas.push({
        fecha: `Fecha ${i}`,
        partidos: partidosPorFecha,
        goles: Math.floor(estadisticasReales.golesTotales / 3) || 0
      });
    }
    
    return fechas;
  };

  const partidosPorFecha = generarPartidosPorFecha();

  return (
    <div className="space-y-6">
      {/* Header del Torneo */}
      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <img 
          src={torneo.logo} 
          alt={torneo.nombre}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{torneo.nombre}</h2>
          <p className="text-muted-foreground">{torneo.categoria} • {torneo.tipo}</p>
          <Badge variant="outline">{torneo.estado}</Badge>
        </div>
      </div>

      <Tabs defaultValue={esOrganizador ? "equipos" : "general"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {esOrganizador && <TabsTrigger value="equipos">Equipos Inscritos</TabsTrigger>}
          <TabsTrigger value="general">Estadísticas</TabsTrigger>
          <TabsTrigger value="tabla">Tabla</TabsTrigger>
          <TabsTrigger value="goleadores">Goleadores</TabsTrigger>
        </TabsList>

        {esOrganizador && (
          <TabsContent value="equipos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Equipos Inscritos y Aprobados ({equiposInscritos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {equiposInscritos.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay equipos inscritos aún</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipo</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Fecha Inscripción</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equiposInscritos.map((equipo, index) => (
                        <TableRow key={`${equipo.id}-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img 
                                src={equipo.logo} 
                                alt={equipo.nombre}
                                className="w-8 h-8 rounded object-cover"
                              />
                              <span className="font-medium">{equipo.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell>{equipo.categoria}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{equipo.grupo}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(equipo.fechaInscripcion).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Aprobado</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas del Torneo</CardTitle>
              </CardHeader>
              <CardContent>
                {estadisticasReales.partidosJugados === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Las estadísticas aparecerán cuando se jueguen partidos
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={estadisticasGenerales.filter(stat => stat.valor > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="valor"
                        label={({ nombre, valor }) => `${nombre}: ${valor}`}
                      >
                        {estadisticasGenerales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partidos por Fecha</CardTitle>
              </CardHeader>
              <CardContent>
                {partidosPorFecha.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Se necesitan equipos inscritos para mostrar el calendario
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={partidosPorFecha}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="partidos" fill="#3b82f6" name="Partidos" />
                      <Bar dataKey="goles" fill="#22c55e" name="Goles" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumen de estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{estadisticasReales.partidosJugados}</div>
                <div className="text-sm text-muted-foreground">Partidos Jugados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{estadisticasReales.golesTotales}</div>
                <div className="text-sm text-muted-foreground">Goles Totales</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{estadisticasReales.tarjetasAmarillas}</div>
                <div className="text-sm text-muted-foreground">Tarjetas Amarillas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{estadisticasReales.tarjetasRojas}</div>
                <div className="text-sm text-muted-foreground">Tarjetas Rojas</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tabla">
          <Card>
            <CardHeader>
              <CardTitle>Tabla de Posiciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">La tabla se generará cuando comience el torneo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goleadores">
          <Card>
            <CardHeader>
              <CardTitle>Tabla de Goleadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Los goleadores aparecerán cuando se jueguen partidos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TorneoEstadisticas;
