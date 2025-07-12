import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Target, TrendingUp, Calendar, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTorneoEstadisticas } from '../hooks/useTorneoEstadisticas';
import DetalleEquipoModal from './DetalleEquipoModal';

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
  const { equiposInscritos, estadisticasReales, loading, recargar } = useTorneoEstadisticas(torneo);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const abrirDetalleEquipo = (equipo: any) => {
    setEquipoSeleccionado(equipo);
    setModalDetalleAbierto(true);
  };

  const cerrarDetalleEquipo = () => {
    setEquipoSeleccionado(null);
    setModalDetalleAbierto(false);
  };

  const estadisticasGenerales = [
    { nombre: "Partidos Jugados", valor: estadisticasReales.partidosJugados, color: "#3b82f6" },
    { nombre: "Goles Totales", valor: estadisticasReales.golesTotales, color: "#22c55e" },
    { nombre: "Tarjetas Amarillas", valor: estadisticasReales.tarjetasAmarillas, color: "#f59e0b" },
    { nombre: "Tarjetas Rojas", valor: estadisticasReales.tarjetasRojas, color: "#ef4444" }
  ];

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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Equipos Inscritos y Aprobados ({equiposInscritos.length})
                  </div>
                  <Button 
                    onClick={recargar}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? "Cargando..." : "Actualizar"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Cargando equipos...</p>
                  </div>
                ) : equiposInscritos.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay equipos inscritos aún</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Los equipos aparecerán aquí cuando sean aprobados
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipo</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Jugadores</TableHead>
                        <TableHead>Fecha Inscripción</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
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
                            <Badge variant="secondary">
                              {equipo.jugadores?.length || 0} jugadores
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(equipo.fechaInscripcion).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Inscrito</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirDetalleEquipo(equipo)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Detalles
                            </Button>
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

      <DetalleEquipoModal
        equipo={equipoSeleccionado}
        open={modalDetalleAbierto}
        onClose={cerrarDetalleEquipo}
      />
    </div>
  );
};

export default TorneoEstadisticas;
