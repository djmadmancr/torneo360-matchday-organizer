
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
    perfiles: {}
  } : null;

  return {
    user: legacyUser,
    currentProfile: currentUser?.role === 'organizer' ? 'organizador' :
                   currentUser?.role === 'referee' ? 'fiscal' :
                   currentUser?.role === 'team_admin' ? 'equipo' : null,
    login: signIn,
    logout: signOut,
    setCurrentProfile: () => {},
    updateUserProfile: () => {},
    isAuthenticated: !!currentUser,
    users: [],
    updateUsers: () => {}
  };
};
