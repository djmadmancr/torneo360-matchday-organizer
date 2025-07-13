
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseUsers, CreateUserData } from "@/hooks/useSupabaseUsers";
import { toast } from "sonner";
import { Users, Plus, Trash2, Loader2 } from "lucide-react";

const SupabaseUserManager = () => {
  const { users, isLoading, createUser, deleteUser, isCreating, isDeleting } = useSupabaseUsers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserData>({
    email: '',
    password: '',
    full_name: '',
    role: 'team_admin'
  });

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await createUser(newUser);
      setNewUser({ email: '', password: '', full_name: '', role: 'team_admin' });
      setShowCreateModal(false);
      toast.success('Usuario creado exitosamente');
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Error al crear usuario');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
    
    try {
      await deleteUser(userId);
      toast.success('Usuario eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Error al eliminar usuario');
    }
  };

  const createDemoUsers = async () => {
    setIsCreatingDemo(true);
    
    try {
      const response = await fetch('https://aiqexycpxikjmvatrsej.supabase.co/functions/v1/create-demo-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpcWV4eWNweGlram12YXRyc2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODYyNDcsImV4cCI6MjA2Nzg2MjI0N30.8jmjPbc6DhMkpRlU-gDbL3Oydq6d0W4t_FxAo0oh8ZA`
        }
      });

      if (!response.ok) {
        throw new Error('Error al crear usuarios de demo');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('¡Usuarios de demo creados exitosamente!');
        // Refresh the users list
        window.location.reload();
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error: any) {
      console.error('Error creating demo users:', error);
      toast.error('Error al crear usuarios de demo: ' + error.message);
    } finally {
      setIsCreatingDemo(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Usuarios</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-muted-foreground">Administradores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'organizer').length}
            </div>
            <div className="text-sm text-muted-foreground">Organizadores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'team_admin').length}
            </div>
            <div className="text-sm text-muted-foreground">Equipos</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => setShowCreateModal(true)} disabled={isCreating || isCreatingDemo}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Usuario
        </Button>
        <Button 
          variant="outline" 
          onClick={createDemoUsers} 
          disabled={isCreating || isCreatingDemo}
        >
          {isCreatingDemo ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Users className="w-4 h-4 mr-2" />
          )}
          Crear Usuarios de Demo
        </Button>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuarios en Supabase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{user.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge className={`mt-1 ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                    user.role === 'organizer' ? 'bg-blue-100 text-blue-800' : 
                    user.role === 'referee' ? 'bg-orange-100 text-orange-800' : 
                    'bg-green-100 text-green-800'}`}>
                    {user.role === 'admin' ? 'Administrador' :
                     user.role === 'organizer' ? 'Organizador' :
                     user.role === 'referee' ? 'Árbitro' :
                     'Admin de Equipo'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay usuarios creados. Haz clic en "Crear Usuarios de Demo" para empezar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                value={newUser.full_name}
                onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Nombre completo del usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Contraseña"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value: any) => setNewUser(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="organizer">Organizador</SelectItem>
                  <SelectItem value="referee">Árbitro</SelectItem>
                  <SelectItem value="team_admin">Admin de Equipo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCreateUser} 
                className="flex-1"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Usuario'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupabaseUserManager;
