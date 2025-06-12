
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Trophy, Users, Calendar, TrendingUp } from "lucide-react";

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

interface OrganizadorDashboardProps {
  torneos: Torneo[];
}

const OrganizadorDashboard = ({ torneos }: OrganizadorDashboardProps) => {
  // Datos para gráficos
  const estadisticasPorEstado = [
    { nombre: "Inscripciones Abiertas", valor: torneos.filter(t => t.estado === "inscripciones_abiertas").length, color: "#22c55e" },
    { nombre: "En Curso", valor: torneos.filter(t => t.estado === "en_curso").length, color: "#3b82f6" },
    { nombre: "Finalizados", valor: torneos.filter(t => t.estado === "finalizado").length, color: "#6b7280" },
    { nombre: "Inscripciones Cerradas", valor: torneos.filter(t => t.estado === "inscripciones_cerradas").length, color: "#f59e0b" }
  ];

  const estadisticasPorCategoria = torneos.reduce((acc, torneo) => {
    const existing = acc.find(item => item.categoria === torneo.categoria);
    if (existing) {
      existing.cantidad += 1;
      existing.equipos += torneo.equiposInscritos;
    } else {
      acc.push({
        categoria: torneo.categoria,
        cantidad: 1,
        equipos: torneo.equiposInscritos
      });
    }
    return acc;
  }, [] as { categoria: string; cantidad: number; equipos: number }[]);

  const torneosPorMes = torneos.reduce((acc, torneo) => {
    const mes = new Date(torneo.fechaCreacion).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    const existing = acc.find(item => item.mes === mes);
    if (existing) {
      existing.torneos += 1;
    } else {
      acc.push({ mes, torneos: 1 });
    }
    return acc;
  }, [] as { mes: string; torneos: number }[]);

  const totalEquipos = torneos.reduce((acc, torneo) => acc + torneo.equiposInscritos, 0);
  const promedioEquiposPorTorneo = torneos.length > 0 ? Math.round(totalEquipos / torneos.length) : 0;

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Torneos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{torneos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Torneos Activos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {torneos.filter(t => t.estado === "en_curso" || t.estado === "inscripciones_abiertas").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Equipos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promedioEquiposPorTorneo}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Torneos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadisticasPorEstado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre, valor }) => `${nombre}: ${valor}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {estadisticasPorEstado.map((entry, index) => (
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
            <CardTitle>Torneos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticasPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6" name="Torneos" />
                <Bar dataKey="equipos" fill="#22c55e" name="Equipos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Torneos Creados por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={torneosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="torneos" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lista de todos los torneos */}
      <Card>
        <CardHeader>
          <CardTitle>Reporte de Todos los Torneos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {torneos.map((torneo) => (
              <div key={torneo.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <img 
                    src={torneo.logo} 
                    alt={torneo.nombre}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{torneo.nombre}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{torneo.categoria}</span>
                      <span>•</span>
                      <span>{torneo.equiposInscritos}/{torneo.maxEquipos} equipos</span>
                      <span>•</span>
                      <span>Creado: {torneo.fechaCreacion}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={
                  torneo.estado === "en_curso" ? "default" :
                  torneo.estado === "inscripciones_abiertas" ? "secondary" :
                  torneo.estado === "finalizado" ? "outline" : "destructive"
                }>
                  {torneo.estado.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizadorDashboard;
