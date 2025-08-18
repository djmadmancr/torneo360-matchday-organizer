import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Trophy, Users, Calendar, TrendingUp, Play } from "lucide-react";
import { useTournaments } from '@/hooks/useTournaments';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useGenerateFixture } from '@/hooks/useTournamentRegistrations';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';


const OrganizadorDashboard = () => {
  const { user } = useSupabaseAuth();
  const { tournaments = [], isLoading } = useTournaments(user?.id);
  const generateFixture = useGenerateFixture();
  const navigate = useNavigate();

  const handleStartTournament = async (tournamentId: string) => {
    try {
      await generateFixture.mutateAsync(tournamentId);
    } catch (error) {
      console.error('Error starting tournament:', error);
    }
  };

  // Statistics calculations using Supabase data
  const estadisticasPorEstado = [
    { nombre: "Inscripciones Abiertas", valor: tournaments.filter(t => t.status === "enrolling").length, color: "#22c55e" },
    { nombre: "En Curso", valor: tournaments.filter(t => t.status === "in_progress").length, color: "#3b82f6" },
    { nombre: "Finalizados", valor: tournaments.filter(t => t.status === "finished").length, color: "#6b7280" },
    { nombre: "Borrador", valor: tournaments.filter(t => t.status === "draft").length, color: "#f59e0b" }
  ];

  const torneosPorMes = tournaments.reduce((acc, tournament) => {
    const mes = new Date(tournament.created_at).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    const existing = acc.find(item => item.mes === mes);
    if (existing) {
      existing.torneos += 1;
    } else {
      acc.push({ mes, torneos: 1 });
    }
    return acc;
  }, [] as { mes: string; torneos: number }[]);

  // Calculate approved teams count from team_registrations
  const totalEquipos = tournaments.reduce((acc, tournament) => {
    const approvedTeams = tournament.teams?.filter(team => team.enrollment_status === 'approved') || [];
    return acc + approvedTeams.length;
  }, 0);
  const promedioEquiposPorTorneo = tournaments.length > 0 ? Math.round(totalEquipos / tournaments.length) : 0;
  
  // Hook para obtener todas las solicitudes pendientes del organizador
  const { data: allRegistrations = [] } = useQuery({
    queryKey: ['organizer-pending-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('team_registrations')
        .select(`
          id,
          status,
          tournament_id,
          tournaments!inner(
            id,
            organizer_id
          )
        `)
        .eq('tournaments.organizer_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const solicitudesPendientes = allRegistrations.length;

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
            <div className="text-2xl font-bold">{tournaments.length}</div>
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
              {tournaments.filter(t => t.status === "in_progress" || t.status === "enrolling").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{solicitudesPendientes}</div>
            <p className="text-xs text-muted-foreground">
              {solicitudesPendientes > 0 ? 'Requieren atención' : 'Todo al día'}
            </p>
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
            <CardTitle>Torneos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tournaments.slice(0, 5).map((tournament) => (
                <div key={tournament.id} className="flex items-center justify-between p-3 border rounded-lg">
                   <div>
                     <h4 className="font-medium">{tournament.name}</h4>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{tournament.teams?.filter(team => team.enrollment_status === 'approved').length || 0} equipos aprobados</span>
                         <Button
                           variant="outline"
                           size="sm"
                           className="text-xs bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                           onClick={() => navigate(`/organizador/solicitudes/${tournament.id}`)}
                         >
                           Ver Solicitudes
                         </Button>
                        <span>• {tournament.status}</span>
                      </div>
                   </div>
                   {tournament.status === 'enrolling' && (tournament.teams?.filter(team => team.enrollment_status === 'approved').length || 0) >= 2 && (
                    <Button
                      size="sm"
                      onClick={() => handleStartTournament(tournament.id)}
                      disabled={generateFixture.isPending}
                      className="flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Iniciar Torneo
                    </Button>
                  )}
                </div>
              ))}
              {tournaments.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No hay torneos recientes
                </div>
              )}
            </div>
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
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-lg">Cargando torneos...</div>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay torneos</h3>
                <p className="text-muted-foreground">Crea tu primer torneo para ver las estadísticas aquí</p>
              </div>
            ) : (
              tournaments.map((tournament) => (
                <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">
                      {tournament.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium">{tournament.name}</h4>
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <span>{tournament.teams?.filter(team => team.enrollment_status === 'approved').length || 0}/{tournament.max_teams} equipos</span>
                         <span>•</span>
                         <span>Creado: {new Date(tournament.created_at).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tournament.status === 'enrolling' && (tournament.teams?.filter(team => team.enrollment_status === 'approved').length || 0) >= 2 && (
                      <Button
                        size="sm"
                        onClick={() => handleStartTournament(tournament.id)}
                        disabled={generateFixture.isPending}
                        className="flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Iniciar
                      </Button>
                    )}
                    <Badge variant={
                      tournament.status === "in_progress" ? "default" :
                      tournament.status === "enrolling" ? "secondary" :
                      tournament.status === "finished" ? "outline" : "destructive"
                    }>
                      {tournament.status === "enrolling" ? "Inscripciones" :
                       tournament.status === "in_progress" ? "En Curso" :
                       tournament.status === "finished" ? "Finalizado" : "Borrador"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizadorDashboard;
