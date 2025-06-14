
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

  useEffect(() => {
    if (esOrganizador) {
      // Cargar equipos aprobados para este torneo
      const notificacionesEquipo = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
      const equiposAprobados = notificacionesEquipo
        .filter((n: any) => 
          n.tipo === 'aprobacion' && 
          n.mensaje.includes(torneo.nombre)
        )
        .map((n: any, index: number) => ({
          id: n.equipoId || `equipo-${index}`,
          nombre: `Equipo ${index + 1}`, // En una app real, esto vendría de la base de datos
          logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center",
          categoria: torneo.categoria,
          fechaInscripcion: n.fecha,
          grupo: `Grupo ${String.fromCharCode(65 + (index % 4))}`, // A, B, C, D
          posicion: (index % 8) + 1
        }));
      
      setEquiposInscritos(equiposAprobados);
    }
  }, [torneo, esOrganizador]);

  // Datos demo para estadísticas
  const estadisticasGenerales = [
    { nombre: "Partidos Jugados", valor: 12, color: "#3b82f6" },
    { nombre: "Goles Totales", valor: 48, color: "#22c55e" },
    { nombre: "Tarjetas Amarillas", valor: 23, color: "#f59e0b" },
    { nombre: "Tarjetas Rojas", valor: 3, color: "#ef4444" }
  ];

  const partidosPorFecha = [
    { fecha: "Fecha 1", partidos: 4, goles: 12 },
    { fecha: "Fecha 2", partidos: 4, goles: 15 },
    { fecha: "Fecha 3", partidos: 4, goles: 21 }
  ];

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
                      {equiposInscritos.map((equipo) => (
                        <TableRow key={equipo.id}>
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
                <CardTitle>Estadísticas Generales</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={estadisticasGenerales}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partidos por Fecha</CardTitle>
              </CardHeader>
              <CardContent>
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
