
import { useAuth } from '@/contexts/AuthContext';

// Legacy compatibility hook for components that haven't been fully migrated
export const useLegacyAuth = () => {
  const { currentUser, signIn, signOut, isLoading, session } = useAuth();

  // Create a legacy user object for backward compatibility
  const legacyUser = currentUser ? {
    id: currentUser.id,
    username: currentUser.email.split('@')[0],
    password: '',
    tipos: currentUser.role === 'organizer' ? ['organizador'] as ('organizador' | 'equipo' | 'fiscal')[] :
           currentUser.role === 'referee' ? ['fiscal'] as ('organizador' | 'equipo' | 'fiscal')[] :
           currentUser.role === 'team_admin' ? ['equipo'] as ('organizador' | 'equipo' | 'fiscal')[] :
           ['organizador', 'equipo', 'fiscal'] as ('organizador' | 'equipo' | 'fiscal')[],
    nombre: currentUser.full_name || currentUser.email,
    email: currentUser.email,
    activo: true,
    fechaCreacion: new Date().toISOString().split('T')[0],
    perfiles: {
      equipo: currentUser.role === 'team_admin' ? {
        equipoId: parseInt(currentUser.id),
        nombreEquipo: currentUser.full_name || `Equipo ${currentUser.email.split('@')[0]}`,
        colores: { principal: '#1e40af', secundario: '#3b82f6' },
        categoria: 'Primera División',
        entrenador: 'Por definir',
        jugadores: [],
        coaches: [],
        torneos: []
      } : undefined,
      organizador: currentUser.role === 'organizer' ? {
        nombreOrganizacion: currentUser.full_name || `Organización ${currentUser.email.split('@')[0]}`,
        descripcion: 'Organización deportiva',
        telefono: '000-000-0000',
        direccion: 'Por definir',
        torneos: []
      } : undefined,
      fiscal: currentUser.role === 'referee' ? {
        nombre: currentUser.full_name || currentUser.email,
        experiencia: 5,
        certificaciones: ['Certificación FIFA'],
        torneos: []
      } : undefined
    }
  } : null;

  return {
    user: legacyUser,
    currentProfile: currentUser?.role === 'organizer' ? 'organizador' :
                   currentUser?.role === 'referee' ? 'fiscal' :
                   currentUser?.role === 'team_admin' ? 'equipo' : null,
    login: signIn,
    logout: signOut,
    setCurrentProfile: () => {},
    updateUserProfile: (tipo: string, profileData: any) => {
      console.log('Legacy updateUserProfile called:', tipo, profileData);
      // This is a legacy method - in the new system, profile updates would go through Supabase
    },
    isAuthenticated: !!currentUser,
    users: [],
    updateUsers: () => {}
  };
};
