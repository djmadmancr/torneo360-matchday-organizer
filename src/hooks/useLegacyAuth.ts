import { useAuth } from '@/contexts/AuthContext';
import { canAccessOrganizerPanel, canAccessTeamPanel } from '@/utils/roleUtils';

// Legacy compatibility hook for components that haven't been fully migrated
export const useLegacyAuth = () => {
  const { currentUser, signIn, signOut, isLoading, session } = useAuth();

  // Check if user has access to organizer or team features
  const hasOrganizerAccess = currentUser ? canAccessOrganizerPanel(currentUser) : false;
  const hasTeamAccess = currentUser ? canAccessTeamPanel(currentUser) : false;
  
  // Return null if user doesn't have access to this legacy interface
  if (!currentUser || (!hasOrganizerAccess && !hasTeamAccess)) {
    return { 
      user: null, 
      updateUserProfile: () => Promise.resolve(),
      currentProfile: null,
      login: signIn,
      logout: signOut,
      setCurrentProfile: () => {},
      isAuthenticated: false,
      users: [],
      updateUsers: () => {}
    };
  }

  // Determine user types based on roles
  const userRoles = currentUser.roles || [currentUser.role || 'team_admin'];
  const tipos: ('organizador' | 'equipo' | 'fiscal')[] = [];
  
  if (userRoles.includes('admin')) {
    tipos.push('organizador', 'equipo', 'fiscal');
  } else {
    if (userRoles.includes('organizer')) tipos.push('organizador');
    if (userRoles.includes('team_admin')) tipos.push('equipo');
    if (userRoles.includes('referee')) tipos.push('fiscal');
  }

  const legacyUser = {
    id: currentUser.id,
    username: currentUser.email.split('@')[0],
    password: '',
    tipos,
    nombre: currentUser.full_name || currentUser.email,
    email: currentUser.email,
    activo: true,
    fechaCreacion: new Date().toISOString().split('T')[0],
    perfiles: {
      equipo: (userRoles.includes('team_admin') || userRoles.includes('admin')) ? {
        equipoId: parseInt(currentUser.id),
        nombreEquipo: currentUser.full_name || `Equipo ${currentUser.email.split('@')[0]}`,
        logo: '/lovable-uploads/42e8c109-4456-4ead-811c-acae29f37a54.png',
        colores: { principal: '#1e40af', secundario: '#3b82f6' },
        categoria: 'Primera División',
        entrenador: 'Por definir',
        jugadores: [],
        coaches: [],
        torneos: []
      } : undefined,
      organizador: (userRoles.includes('organizer') || userRoles.includes('admin')) ? {
        organizadorId: parseInt(currentUser.id),
        nombreOrganizacion: currentUser.full_name || `Organización ${currentUser.email.split('@')[0]}`,
        descripcion: 'Organización deportiva',
        telefono: '000-000-0000',
        direccion: 'Por definir',
        torneos: [],
        // Campos adicionales para compatibilidad con PerfilEquipo
        nombreEquipo: currentUser.full_name || `Organización ${currentUser.email.split('@')[0]}`,
        logo: '/lovable-uploads/42e8c109-4456-4ead-811c-acae29f37a54.png',
        colores: { principal: '#1e40af', secundario: '#3b82f6' },
        categoria: 'Organizador',
        entrenador: 'Staff Técnico',
        jugadores: [],
        coaches: []
      } : undefined,
      fiscal: (userRoles.includes('referee') || userRoles.includes('admin')) ? {
        nombre: currentUser.full_name || currentUser.email,
        experiencia: 5,
        certificaciones: ['Certificación FIFA'],
        torneos: []
      } : undefined
    }
  };

  // Determine current profile based on primary role or first available role
  const currentProfile = userRoles.includes('admin') ? 'organizador' :
                        userRoles.includes('organizer') ? 'organizador' :
                        userRoles.includes('referee') ? 'fiscal' :
                        userRoles.includes('team_admin') ? 'equipo' : null;

  return {
    user: legacyUser,
    currentProfile,
    login: signIn,
    logout: signOut,
    setCurrentProfile: () => {},
    updateUserProfile: (tipo: string, profileData: any) => {
      console.log('Legacy updateUserProfile called:', tipo, profileData);
      // This is a legacy method - in the new system, profile updates would go through Supabase
      return Promise.resolve();
    },
    isAuthenticated: !!currentUser,
    users: [],
    updateUsers: () => {}
  };
};