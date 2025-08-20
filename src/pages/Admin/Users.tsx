
import React, { useState } from 'react';
import { useUsers } from '@/services/adminUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Filter, ArrowLeft } from 'lucide-react';
import { UsersTable } from '@/components/Admin/UsersTable';
import { CreateEditUserModal } from '@/components/Admin/CreateEditUserModal';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { canAccessAdminPanel } from '@/utils/roleUtils';

const AdminUsers = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Redirect if not admin or organizer
  if (!currentUser || !canAccessAdminPanel(currentUser)) {
    return <Navigate to="/no-access" replace />;
  }

  const { data: users, isLoading, error } = useUsers();

  const filteredUsers = users?.filter(user => {
    const userRoles = user.roles || [user.role || 'team_admin'];
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || userRoles.includes(roleFilter);
    return matchesSearch && matchesRole;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen relative p-6" style={{ 
        backgroundImage: `var(--admin-overlay), var(--admin-gradient)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-white">Cargando usuarios...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative p-6" style={{ 
        backgroundImage: `var(--admin-overlay), var(--admin-gradient)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-200">Error al cargar usuarios: {error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-6" style={{ 
      backgroundImage: `var(--admin-overlay), var(--admin-gradient)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1">Administra usuarios del sistema</p>
            </div>
          </div>
          <div className="flex items-center justify-end mb-6">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="create-user-button"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="organizer">Organizador</SelectItem>
                  <SelectItem value="referee">Árbitro</SelectItem>
                  <SelectItem value="team_admin">Equipo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <UsersTable users={filteredUsers} />
        </div>

        {/* Create/Edit Modal */}
        <CreateEditUserModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    </div>
  );
};

export default AdminUsers;
