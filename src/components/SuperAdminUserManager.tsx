
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { User, OrganizadorPerfil, EquipoPerfil, FiscalPerfil } from "@/types/auth";
import { toast } from "sonner";
import { Users, Plus, Edit, Trash2, UserCheck, Shield, Eye, EyeOff } from "lucide-react";

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
          descripcion: '',
          telefono: '',
          direccion: '',
          torneos: []
        } as OrganizadorPerfil;
      case 'equipo':
        return {
          nombreEquipo: nombre,
          colores: {
            principal: '#1e40af',
            secundario: '#ffffff'
          },
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

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password || !newUser.nombre || !newUser.email || newUser.tipos.length === 0) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (users.some(user => user.username === newUser.username)) {
      toast.error('El nombre de usuario ya existe');
      return;
    }

    const perfiles: Partial<{
      organizador: OrganizadorPerfil;
      equipo: EquipoPerfil;
      fiscal: FiscalPerfil;
    }> = {};

    newUser.tipos.forEach(tipo => {
      if (tipo === 'organizador') {
        perfiles.organizador = createDefaultProfile(tipo, newUser.nombre) as OrganizadorPerfil;
      } else if (tipo === 'equipo') {
        perfiles.equipo = createDefaultProfile(tipo, newUser.nombre) as EquipoPerfil;
      } else if (tipo === 'fiscal') {
        perfiles.fiscal = createDefaultProfile(tipo, newUser.nombre) as FiscalPerfil;
      }
    });

    const user: User = {
      id: `USR-${Date.now()}`,
      username: newUser.username,
      password: newUser.password,
      tipos: newUser.tipos,
      nombre: newUser.nombre,
      email: newUser.email,
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0],
      perfiles
    };

    updateUsers([...users, user]);
    setNewUser({ username: '', password: '', tipos: [], nombre: '', email: '' });
    setShowCreateModal(false);
    toast.success('Usuario creado exitosamente');
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? editingUser : user
    );
    
    updateUsers(updatedUsers);
    setShowEditModal(false);
    setEditingUser(null);
    toast.success('Usuario actualizado exitosamente');
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    updateUsers(updatedUsers);
    toast.success('Usuario eliminado exitosamente');
  };

  const toggleUserActive = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, activo: !user.activo } : user
    );
    updateUsers(updatedUsers);
    toast.success('Estado del usuario actualizado');
  };

  const getUserStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.activo).length;
    const organizadores = users.filter(user => user.tipos?.includes('organizador')).length;
    const equipos = users.filter(user => user.tipos?.includes('equipo')).length;
    const fiscales = users.filter(user => user.tipos?.includes('fiscal')).length;

    return { totalUsers, activeUsers, organizadores, equipos, fiscales };
  };

  const stats = getUserStats();

  const handleTipoChange = (tipo: 'organizador' | 'equipo' | 'fiscal', checked: boolean) => {
    if (checked) {
      setNewUser(prev => ({
        ...prev,
        tipos: [...prev.tipos, tipo]
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        tipos: prev.tipos.filter(t => t !== tipo)
      }));
    }
  };

  const handleEditTipoChange = (tipo: 'organizador' | 'equipo' | 'fiscal', checked: boolean) => {
    if (!editingUser) return;

    let newTipos = [...editingUser.tipos];
    let newPerfiles = { ...editingUser.perfiles };

    if (checked) {
      if (!newTipos.includes(tipo)) {
        newTipos.push(tipo);
        if (tipo === 'organizador') {
          newPerfiles.organizador = createDefaultProfile(tipo, editingUser.nombre) as OrganizadorPerfil;
        } else if (tipo === 'equipo') {
          newPerfiles.equipo = createDefaultProfile(tipo, editingUser.nombre) as EquipoPerfil;
        } else if (tipo === 'fiscal') {
          newPerfiles.fiscal = createDefaultProfile(tipo, editingUser.nombre) as FiscalPerfil;
        }
      }
    } else {
      newTipos = newTipos.filter(t => t !== tipo);
      if (tipo === 'organizador' && newPerfiles.organizador) {
        delete newPerfiles.organizador;
      } else if (tipo === 'equipo' && newPerfiles.equipo) {
        delete newPerfiles.equipo;
      } else if (tipo === 'fiscal' && newPerfiles.fiscal) {
        delete newPerfiles.fiscal;
      }
    }

    setEditingUser({
      ...editingUser,
      tipos: newTipos,
      perfiles: newPerfiles
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Usuarios</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <div className="text-sm text-muted-foreground">Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.organizadores}</div>
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
            <div className="text-2xl font-bold text-purple-600">{stats.fiscales}</div>
            <div className="text-sm text-muted-foreground">Fiscales</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestión de Usuarios
            </CardTitle>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${user.activo ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <h4 className="font-medium">{user.nombre}</h4>
                    <p className="text-sm text-muted-foreground">@{user.username} • {user.email}</p>
                    <div className="flex gap-1 mt-1">
                      {user.tipos?.map((tipo) => (
                        <Badge key={tipo} variant="secondary" className="text-xs">
                          {tipo === 'organizador' && '🔵 Org'}
                          {tipo === 'equipo' && '🟢 Equipo'}
                          {tipo === 'fiscal' && '🟠 Fiscal'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserActive(user.id)}
                  >
                    {user.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={newUser.nombre}
                onChange={(e) => setNewUser(prev => ({ ...prev, nombre: e.target.value }))}
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
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                placeholder="nombre_usuario"
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
              <Label>Tipos de Usuario</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="organizador"
                    checked={newUser.tipos.includes('organizador')}
                    onCheckedChange={(checked) => handleTipoChange('organizador', checked as boolean)}
                  />
                  <Label htmlFor="organizador" className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Organizador
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="equipo"
                    checked={newUser.tipos.includes('equipo')}
                    onCheckedChange={(checked) => handleTipoChange('equipo', checked as boolean)}
                  />
                  <Label htmlFor="equipo" className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    Equipo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fiscal"
                    checked={newUser.tipos.includes('fiscal')}
                    onCheckedChange={(checked) => handleTipoChange('fiscal', checked as boolean)}
                  />
                  <Label htmlFor="fiscal" className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-orange-600" />
                    Fiscal
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateUser} className="flex-1">
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre Completo</Label>
                <Input
                  id="edit-nombre"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Dejar vacío para mantener la actual"
                  onChange={(e) => {
                    if (e.target.value) {
                      setEditingUser(prev => prev ? { ...prev, password: e.target.value } : null);
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipos de Usuario</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-organizador"
                      checked={editingUser.tipos?.includes('organizador')}
                      onCheckedChange={(checked) => handleEditTipoChange('organizador', checked as boolean)}
                    />
                    <Label htmlFor="edit-organizador" className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Organizador
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-equipo"
                      checked={editingUser.tipos?.includes('equipo')}
                      onCheckedChange={(checked) => handleEditTipoChange('equipo', checked as boolean)}
                    />
                    <Label htmlFor="edit-equipo" className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      Equipo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-fiscal"
                      checked={editingUser.tipos?.includes('fiscal')}
                      onCheckedChange={(checked) => handleEditTipoChange('fiscal', checked as boolean)}
                    />
                    <Label htmlFor="edit-fiscal" className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-orange-600" />
                      Fiscal
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateUser} className="flex-1">
                  Actualizar Usuario
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
