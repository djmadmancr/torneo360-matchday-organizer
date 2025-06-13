
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SuperAdminUserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    tipo: 'organizador' as 'organizador' | 'equipo' | 'fiscal',
    nombre: '',
    email: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('torneo360-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  };

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem('torneo360-users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const createUser = () => {
    if (!newUser.username || !newUser.password || !newUser.nombre || !newUser.email) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (users.some(u => u.username === newUser.username)) {
      toast.error('El nombre de usuario ya existe');
      return;
    }

    const user: User = {
      id: `${newUser.tipo}-${Date.now()}`,
      username: newUser.username,
      password: newUser.password,
      tipo: newUser.tipo,
      nombre: newUser.nombre,
      email: newUser.email,
      activo: true,
      fechaCreacion: new Date().toISOString(),
      perfil: createDefaultProfile(newUser.tipo, newUser.nombre)
    };

    const updatedUsers = [...users, user];
    saveUsers(updatedUsers);
    setShowCreateModal(false);
    setNewUser({
      username: '',
      password: '',
      tipo: 'organizador',
      nombre: '',
      email: ''
    });
    toast.success('Usuario creado exitosamente');
  };

  const createDefaultProfile = (tipo: string, nombre: string) => {
    switch (tipo) {
      case 'organizador':
        return {
          nombreOrganizacion: nombre,
          descripcion: 'Nueva organización',
          telefono: '',
          direccion: '',
          torneos: []
        };
      case 'equipo':
        return {
          nombreEquipo: nombre,
          colores: { principal: '#3B82F6', secundario: '#1E40AF' },
          categoria: 'Primera División',
          entrenador: '',
          jugadores: [],
          coaches: [],
          torneos: []
        };
      case 'fiscal':
        return {
          nombre: nombre,
          experiencia: 0,
          certificaciones: [],
          torneos: []
        };
      default:
        return {};
    }
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, activo: !user.activo } : user
    );
    saveUsers(updatedUsers);
    toast.success('Estado del usuario actualizado');
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    saveUsers(updatedUsers);
    toast.success('Usuario eliminado');
  };

  const getUserStats = () => {
    const stats = {
      total: users.length,
      organizadores: users.filter(u => u.tipo === 'organizador').length,
      equipos: users.filter(u => u.tipo === 'equipo').length,
      fiscales: users.filter(u => u.tipo === 'fiscal').length,
      activos: users.filter(u => u.activo).length
    };
    return stats;
  };

  const stats = getUserStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
            <div className="text-sm text-muted-foreground">Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.organizadores}</div>
            <div className="text-sm text-muted-foreground">Organizadores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.equipos}</div>
            <div className="text-sm text-muted-foreground">Equipos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.fiscales}</div>
            <div className="text-sm text-muted-foreground">Fiscales</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{user.nombre}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <Badge variant={user.tipo === 'organizador' ? 'default' : user.tipo === 'equipo' ? 'secondary' : 'outline'}>
                    {user.tipo}
                  </Badge>
                  <Badge variant={user.activo ? 'default' : 'destructive'}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre Completo</Label>
                <Input
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Usuario</Label>
                <Input
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="nombreusuario"
                />
              </div>
              <div>
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="contraseña"
                />
              </div>
            </div>

            <div>
              <Label>Tipo de Usuario</Label>
              <select
                className="w-full p-2 border rounded"
                value={newUser.tipo}
                onChange={(e) => setNewUser({...newUser, tipo: e.target.value as 'organizador' | 'equipo' | 'fiscal'})}
              >
                <option value="organizador">Organizador</option>
                <option value="equipo">Equipo</option>
                <option value="fiscal">Fiscal</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={createUser} className="flex-1">
                Crear Usuario
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

export default SuperAdminUserManager;
