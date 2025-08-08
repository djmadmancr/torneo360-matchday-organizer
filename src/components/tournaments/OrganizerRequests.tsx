import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Play, Users, Calendar, Trophy } from 'lucide-react';
import { useRegistrationRequests, useApproveRegistration, useGenerateFixture } from '@/hooks/useTournamentRegistrations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrganizerRequestsProps {
  tournamentId: string;
  tournamentName: string;
  tournamentStatus: string;
}

export const OrganizerRequests: React.FC<OrganizerRequestsProps> = ({
  tournamentId,
  tournamentName,
  tournamentStatus,
}) => {
  const { data: requests, isLoading } = useRegistrationRequests(tournamentId);
  const approveRegistration = useApproveRegistration();
  const generateFixture = useGenerateFixture();

  console.log('OrganizerRequests render:', {
    tournamentId,
    requests,
    isLoading,
    requestsCount: requests?.length || 0
  });

  const pendingRequests = requests?.filter(req => req.status === 'pending') || [];
  const approvedRequests = requests?.filter(req => req.status === 'approved') || [];
  const rejectedRequests = requests?.filter(req => req.status === 'rejected') || [];

  const handleApprove = async (registrationId: string) => {
    await approveRegistration.mutateAsync({
      registrationId,
      status: 'approved',
      tournamentId,
    });
  };

  const handleReject = async (registrationId: string) => {
    await approveRegistration.mutateAsync({
      registrationId,
      status: 'rejected',
      tournamentId,
    });
  };

  const handleGenerateFixture = async () => {
    await generateFixture.mutateAsync(tournamentId);
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
      {/* Header con estadísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{tournamentName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gestión de solicitudes de inscripción
              </p>
            </div>
            
            {approvedRequests.length >= 2 && tournamentStatus === 'enrolling' && (
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
                      Se generará automáticamente el calendario de partidos para los {approvedRequests.length} equipos aprobados.
                      Una vez generado, no podrás aprobar más equipos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleGenerateFixture}
                      disabled={generateFixture.isPending}
                    >
                      {generateFixture.isPending ? 'Generando...' : 'Generar Fixture'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
              <div className="text-sm text-yellow-700">Pendientes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
              <div className="text-sm text-green-700">Aprobados</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{rejectedRequests.length}</div>
              <div className="text-sm text-red-700">Rechazados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solicitudes pendientes */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Solicitudes Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Administrador</TableHead>
                  <TableHead>Código</TableHead>
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
                       <div>
                         <div className="font-medium">{request.teams?.admin_user?.full_name}</div>
                         <div className="text-sm text-muted-foreground">{request.teams?.admin_user?.email}</div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline">{request.teams?.invite_code}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.requested_at), 'PPp', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={approveRegistration.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
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

      {/* Equipos aprobados */}
      {approvedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Equipos Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Administrador</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Fecha Aprobación</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedRequests.map((request) => (
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
                       <div>
                         <div className="font-medium">{request.teams?.admin_user?.full_name}</div>
                         <div className="text-sm text-muted-foreground">{request.teams?.admin_user?.email}</div>
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.teams?.invite_code}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.approved_at && format(new Date(request.approved_at), 'PPp', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Aprobado</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Mensaje si no hay solicitudes */}
      {(!requests || requests.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
            <p className="text-muted-foreground">
              Aún no han llegado solicitudes de inscripción para este torneo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};