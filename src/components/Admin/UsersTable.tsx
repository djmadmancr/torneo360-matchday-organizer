
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminUser, useToggleUserActive, useResetPassword } from '@/services/adminUsers';
import { Edit, RotateCcw, Ban, CheckCircle } from 'lucide-react';
import { CreateEditUserModal } from './CreateEditUserModal';
import { toast } from 'sonner';

interface UsersTableProps {
  users: AdminUser[];
}

export const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const toggleActiveMutation = useToggleUserActive();
  const resetPasswordMutation = useResetPassword();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'organizer':
        return 'bg-blue-100 text-blue-800';
      case 'referee':
        return 'bg-orange-100 text-orange-800';
      case 'team_admin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'organizer':
        return 'Organizador';
      case 'referee':
        return 'Árbitro';
      case 'team_admin':
        return 'Admin de Equipo';
      default:
        return role;
    }
  };

  const handleToggleActive = async (user: AdminUser, active: boolean) => {
    try {
      await toggleActiveMutation.mutateAsync({ userId: user.id, active });
      toast.success(`Usuario ${active ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      toast.error(`Error al ${active ? 'activar' : 'desactivar'} usuario`);
    }
  };

  const handleResetPassword = async (user: AdminUser) => {
    try {
      await resetPasswordMutation.mutateAsync(user.email);
      toast.success('Email de reseteo de contraseña enviado');
    } catch (error) {
      toast.error('Error al enviar email de reseteo');
    }
  };

  return (
    <>
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.full_name || '-'}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role || 'team_admin')}>
                    {getRoleLabel(user.role || 'team_admin')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={true ? 'default' : 'secondary'}>
                    {true ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetPassword(user)}
                      disabled={resetPasswordMutation.isPending}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(user, false)}
                      disabled={toggleActiveMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron usuarios
          </div>
        )}
      </div>

      <CreateEditUserModal
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
      />
    </>
  );
};
