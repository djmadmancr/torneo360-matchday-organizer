import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Play, Users, Calendar, Trophy, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useApproveRegistration, useGenerateFixture, TournamentRegistration } from '@/hooks/useTournamentRegistrations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface AllOrganizerRequestsProps {
  organizerId: string;
}

export const AllOrganizerRequests: React.FC<AllOrganizerRequestsProps> = ({
  organizerId,
}) => {
  // Obtener todas las solicitudes de todos los torneos del organizador
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['all-organizer-requests', organizerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_registrations')
        .select(`
          id,
          tournament_id,
          team_id,
          status,
          requested_at,
          approved_at,
          teams(
            id,
            name,
            logo_url,
            invite_code,
            admin_user_id,
            admin_user:admin_user_id(full_name, email)
          ),
          tournaments!inner(
            id,
            name,
            status,
            organizer_id
          )
        `)
        .eq('tournaments.organizer_id', organizerId)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching all organizer requests:', error);
        throw error;
      }
      
      return data as (TournamentRegistration & {
        tournaments: {
          id: string;
          name: string;
          status: string;
          organizer_id: string;
        };
      })[];
    },
    enabled: Boolean(organizerId),
  });

  const approveRegistration = useApproveRegistration();
  const generateFixture = useGenerateFixture();

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  // Agrupar por torneo para mostrar estadísticas y botones de generar fixture
  const tournamentStats = requests.reduce((acc, request) => {
    const tournamentId = request.tournaments.id;
    const tournamentName = request.tournaments.name;
    const tournamentStatus = request.tournaments.status;
    
    if (!acc[tournamentId]) {
      acc[tournamentId] = {
        id: tournamentId,
        name: tournamentName,
        status: tournamentStatus,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
    }
    
    if (request.status === 'pending') acc[tournamentId].pending++;
    else if (request.status === 'approved') acc[tournamentId].approved++;
    else if (request.status === 'rejected') acc[tournamentId].rejected++;
    
    return acc;
  }, {} as Record<string, any>);

  const handleApprove = async (registrationId: string, tournamentId: string) => {
    try {
      await approveRegistration.mutateAsync({
        registrationId,
        status: 'approved',
        tournamentId,
      });
    } catch (error) {
      console.error('Error approving registration:', error);
    }
  };

  const handleReject = async (registrationId: string, tournamentId: string) => {
    try {
      await approveRegistration.mutateAsync({
        registrationId,
        status: 'rejected',
        tournamentId,
      });
    } catch (error) {
      console.error('Error rejecting registration:', error);
    }
  };

  const handleGenerateFixture = async (tournamentId: string) => {
    try {
      await generateFixture.mutateAsync(tournamentId);
      toast.success('Fixture generado exitosamente');
    } catch (error) {
      console.error('Error generating fixture:', error);
      toast.error('Error al generar el fixture');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando solicitudes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen por torneo */}
      {Object.keys(tournamentStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Resumen por Torneo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.values(tournamentStats).map((tournament: any) => (
                <div key={tournament.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{tournament.name}</h4>
                    <div className="flex gap-4 mt-2">
                      <span className="text-sm text-yellow-600">
                        Pendientes: {tournament.pending}
                      </span>
                      <span className="text-sm text-green-600">
                        Aprobados: {tournament.approved}
                      </span>
                      <span className="text-sm text-red-600">
                        Rechazados: {tournament.rejected}
                      </span>
                    </div>
                  </div>
                  
                  {tournament.approved >= 2 && tournament.status === 'enrolling' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />
                          Generar Fixture
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Generar fixture del torneo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se generará automáticamente el calendario de partidos para los {tournament.approved} equipos aprobados.
                            Una vez generado, no podrás aprobar más equipos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleGenerateFixture(tournament.id)}
                            disabled={generateFixture.isPending}
                          >
                            {generateFixture.isPending ? 'Generando...' : 'Generar Fixture'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solicitudes pendientes */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-600" />
              Solicitudes Pendientes ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Torneo</TableHead>
                  <TableHead>Administrador</TableHead>
                  <TableHead>Fecha Solicitud</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {request.teams?.logo_url ? (
                          <img 
                            src={request.teams.logo_url} 
                            alt={`Logo de ${request.teams.name}`}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        {request.teams?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{request.tournaments.name}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.teams?.admin_user?.full_name}</div>
                        <div className="text-sm text-muted-foreground">{request.teams?.admin_user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.requested_at), 'PPp', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id, request.tournament_id)}
                          disabled={approveRegistration.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id, request.tournament_id)}
                          disabled={approveRegistration.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Solicitudes procesadas */}
      {(approvedRequests.length > 0 || rejectedRequests.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Solicitudes Procesadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Torneo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Procesado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...approvedRequests, ...rejectedRequests].map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {request.teams?.logo_url ? (
                          <img 
                            src={request.teams.logo_url} 
                            alt={`Logo de ${request.teams.name}`}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        {request.teams?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{request.tournaments.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {request.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.approved_at && format(new Date(request.approved_at), 'PPp', { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Mensaje si no hay solicitudes */}
      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
            <p className="text-muted-foreground">
              Aún no han llegado solicitudes de inscripción para tus torneos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};