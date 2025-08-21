import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUser, useResetPassword, useSetUserPassword } from '@/services/adminUsers';
import { toast } from 'sonner';
import { Mail, Key } from 'lucide-react';

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onOpenChange,
  user
}) => {
  const [newPassword, setNewPassword] = useState('');
  const resetPasswordMutation = useResetPassword();
  const setPasswordMutation = useSetUserPassword();

  const handleEmailReset = async () => {
    try {
      await resetPasswordMutation.mutateAsync(user.email);
      toast.success('Email de reseteo enviado exitosamente');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar email de reseteo');
    }
  };

  const handleDirectReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      toast.error('La contraseña es requerida');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await setPasswordMutation.mutateAsync({
        userId: user.auth_user_id,
        password: newPassword
      });
      toast.success('Contraseña actualizada exitosamente');
      setNewPassword('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar contraseña');
    }
  };

  const handleClose = () => {
    setNewPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Resetear Contraseña - {user.full_name || user.email}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Directa
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Se enviará un email a <strong>{user.email}</strong> con un enlace para resetear la contraseña.
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleEmailReset}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? 'Enviando...' : 'Enviar Email'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="direct" className="space-y-4">
            <form onSubmit={handleDirectReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa la nueva contraseña"
                  minLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={setPasswordMutation.isPending}
                >
                  {setPasswordMutation.isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};