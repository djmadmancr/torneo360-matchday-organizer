
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { User, OrganizadorPerfil, EquipoPerfil, FiscalPerfil } from '@/types/auth';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Eye, EyeOff, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const SuperAdminUserManager = () => {
  const { users, updateUsers } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    tipos: [] as ('organizador' | 'equipo' | 'fiscal')[],
    nombre: '',
    email: ''
  });

  const createDefaultProfile = (tipo: 'organizador' | 'equipo' | 'fiscal', nombre: string) => {
    switch (tipo) {
      case 'organizador':
        return {
          nombreOrganizacion: nombre,
          descripcion: 'Nueva organización',
          telefono: '',
          direccion: '',
          torneos: []
        } as OrganizadorPerfil;
      case 'equipo':
        return {
          nombreEquipo: nombre,
          colores: { principal: '#3B82F6', secundario: '#1E40AF' },
          categoria: 'Primera División',
          entrenador: '',
          jugadores: [],
          coaches: [],
          torneos: []
        } as EquipoPerfil;
      case 'fiscal':
        return {
          nombre: nombre,
          experiencia: 0,
          certificaciones: [],
          torneos: []
        } as FiscalPerfil;
      default:
        throw new Error(`Tipo de perfil no válido: ${tipo}`);
    }
  };

  const createUser = () => {
    if (!newUser.username || !newUser.password || !newUser.nombre || !newUser.email || newUser.tipos.length === 0) {
      toast.error('Por favor completa todos los campos y selecciona al menos un tipo');
      return;
    }

    if (users.some(u => u.username === newUser.username)) {
      toast.error('El nombre de usuario ya existe');
      return;
    }

    const perfiles: Partial<{
      organizador: OrganizadorPerfil;
      equipo: EquipoPerfil;
      fiscal: FiscalPerfil;
    }> = {};

    newUser.tipos.forEach(tipo => {
      perfiles[tipo] = createDefaultProfile(tipo, newUser.nombre);
    });

    const user: User = {
      id: `user-${Date.now()}`,
      username: newUser.username,
      password: newUser.password,
      tipos: newUser.tipos,
      nombre: newUser.nombre,
      email: newUser.email,
      activo: true,
      fechaCreacion: new Date().toISOString(),
      perfiles
    };

    const updatedUsers = [...users, user];
    updateUsers(updatedUsers);
    setShowCreateModal(false);
    setNewUser({
      username: '',
      password: '',
      tipos: [],
      nombre: '',
      email: ''
    });
    toast.success('Usuario creado exitosamente');
  };

  const editUser = (user: User) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const saveEditUser = () => {
    if (!editingUser) return;

    const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u);
    updateUsers(updatedUsers);
    setShowEditModal(false);
    setEditingUser(null);
    toast.success('Usuario actualizado exitosamente');
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, activo: !user.activo } : user
    );
    updateUsers(updatedUsers);
    toast.success('Estado del usuario actualizado');
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    updateUsers(updatedUsers);
    toast.success('Usuario eliminado');
  };

  const handleTipoChange = (tipo: 'organizador' | 'equipo' | 'fiscal', checked: boolean) => {
    if (checked) {
      setNewUser(prev => ({ ...prev, tipos: [...prev.tipos, tipo] }));
    } else {
      setNewUser(prev => ({ ...prev, tipos: prev.tipos.filter(t => t !== tipo) }));
    }
  };

  const handleEditTipoChange = (tipo: 'organizador' | 'equipo' | 'fiscal', checked: boolean) => {
    if (!editingUser) return;
    
    let newTipos = [...editingUser.tipos];
    let newPerfiles = { ...editingUser.perfiles };

    if (checked) {
      if (!newTipos.includes(tipo)) {
        newTipos.push(tipo);
        newPerfiles[tipo] = createDefaultProfile(tipo, editingUser.nombre);
      }
    } else {
      newTipos = newTipos.filter(t => t !== tipo);
      delete newPerfiles[tipo];
    }

    setEditingUser({
      ...editingUser,
      tipos: newTipos,
      perfiles: newPerfiles
    });
  };

  const getUserStats = () => {
    const stats = {
      total: users.length,
      organizadores: users.filter(u => u.tipos.includes('organizador')).length,
      equipos: users.filter(u => u.tipos.includes('equipo')).length,
      fiscales: users.filter(u => u.tipos.includes('fiscal')).length,
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
                  <div className="flex gap-2">
                    {user.tipos.map(tipo => (
                      <Badge key={tipo} variant={tipo === 'organizador' ? 'default' : tipo === 'equipo' ? 'secondary' : 'outline'}>
                        {tipo}
                      </Badge>
                    ))}
                  </div>
                  <Badge variant={user.activo ? 'default' : 'destructive'}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editUser(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
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
              <Label>Tipos de Usuario (selecciona uno o más)</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="organizador"
                    checked={newUser.tipos.includes('organizador')}
                    onCheckedChange={(checked) => handleTipoChange('organizador', checked as boolean)}
                  />
                  <Label htmlFor="organizador">Organizador</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="equipo"
                    checked={newUser.tipos.includes('equipo')}
                    onCheckedChange={(checked) => handleTipoChange('equipo', checked as boolean)}
                  />
                  <Label htmlFor="equipo">Equipo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fiscal"
                    checked={newUser.tipos.includes('fiscal')}
                    onCheckedChange={(checked) => handleTipoChange('fiscal', checked as boolean)}
                  />
                  <Label htmlFor="fiscal">Fiscal</Label>
                </div>
              </div>
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

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre Completo</Label>
                  <Input
                    value={editingUser.nombre}
                    onChange={(e) => setEditingUser({...editingUser, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Usuario</Label>
                  <Input
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Nueva Contraseña</Label>
                  <Input
                    type="password"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Tipos de Usuario</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-organizador"
                      checked={editingUser.tipos.includes('organizador')}
                      onCheckedChange={(checked) => handleEditTipoChange('organizador', checked as boolean)}
                    />
                    <Label htmlFor="edit-organizador">Organizador</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-equipo"
                      checked={editingUser.tipos.includes('equipo')}
                      onCheckedChange={(checked) => handleEditTipoChange('equipo', checked as boolean)}
                    />
                    <Label htmlFor="edit-equipo">Equipo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-fiscal"
                      checked={editingUser.tipos.includes('fiscal')}
                      onCheckedChange={(checked) => handleEditTipoChange('fiscal', checked as boolean)}
                    />
                    <Label htmlFor="edit-fiscal">Fiscal</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveEditUser} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminUserManager;
