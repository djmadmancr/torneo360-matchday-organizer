
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminUser, useCreateUser, useUpdateUser } from '@/services/adminUsers';
import { toast } from 'sonner';

interface CreateEditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AdminUser | null;
}

export const CreateEditUserModal: React.FC<CreateEditUserModalProps> = ({
  open,
  onOpenChange,
  user
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    roles: ['team_admin'] as string[]
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        full_name: user.full_name || '',
        roles: user.roles || [user.role || 'team_admin']
      });
    } else {
      setFormData({
        email: '',
        password: '',
        full_name: '',
        roles: ['team_admin']
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateUserMutation.mutateAsync({
          id: user!.id,
          full_name: formData.full_name,
          roles: formData.roles
        });
        toast.success('Usuario actualizado exitosamente');
      } else {
        if (!formData.password) {
          toast.error('La contraseña es requerida para nuevos usuarios');
          return;
        }
        if (formData.password.length < 8) {
          toast.error('La contraseña debe tener al menos 8 caracteres');
          return;
        }
        if (formData.roles.length === 0) {
          toast.error('Debe seleccionar al menos un rol');
          return;
        }
        await createUserMutation.mutateAsync(formData);
        toast.success('Usuario creado exitosamente');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la solicitud');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (roleValue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleValue]
        : prev.roles.filter(r => r !== roleValue)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </DialogTitle>
        </DialogHeader>

        {(createUserMutation.error || updateUserMutation.error) && (
          <Alert variant="destructive">
            <AlertDescription>
              {createUserMutation.error?.message || updateUserMutation.error?.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={isEditing}
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={8}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Roles de Usuario</Label>
            <div className="space-y-3 p-4 border rounded-md">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin"
                  checked={formData.roles.includes('admin')}
                  onCheckedChange={(checked) => handleRoleChange('admin', checked as boolean)}
                />
                <Label htmlFor="admin" className="text-sm font-medium">
                  Administrador
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="organizer"
                  checked={formData.roles.includes('organizer')}
                  onCheckedChange={(checked) => handleRoleChange('organizer', checked as boolean)}
                />
                <Label htmlFor="organizer" className="text-sm font-medium">
                  Organizador
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="referee"
                  checked={formData.roles.includes('referee')}
                  onCheckedChange={(checked) => handleRoleChange('referee', checked as boolean)}
                />
                <Label htmlFor="referee" className="text-sm font-medium">
                  Árbitro/Fiscal
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="team_admin"
                  checked={formData.roles.includes('team_admin')}
                  onCheckedChange={(checked) => handleRoleChange('team_admin', checked as boolean)}
                />
                <Label htmlFor="team_admin" className="text-sm font-medium">
                  Admin de Equipo
                </Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Selecciona uno o más roles para el usuario
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending || updateUserMutation.isPending || formData.roles.length === 0}
            >
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
