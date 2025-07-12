
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    session,
    user: supabaseUser,
    isAuthenticated,
    signIn: supabaseSignIn,
    signOut: supabaseSignOut,
    updateProfile: supabaseUpdateProfile,
    isLoading
  } = useSupabaseAuth();

  const [currentProfile, setCurrentProfile] = useState<'organizador' | 'equipo' | 'fiscal' | null>(() => {
    const storedProfile = localStorage.getItem('globalLinkSoccerCurrentProfile');
    return storedProfile ? (storedProfile as 'organizador' | 'equipo' | 'fiscal') : null;
  });

  // Convert Supabase user to legacy User format for compatibility
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (supabaseUser) {
      // Map Supabase role to legacy tipos array with proper type checking
      const mapRoleToTipos = (role: string | null): ('organizador' | 'equipo' | 'fiscal')[] => {
        switch (role) {
          case 'organizer':
            return ['organizador'];
          case 'referee':
            return ['fiscal'];
          case 'team_admin':
          default:
            return ['equipo'];
        }
      };

      const legacyUser: User = {
        id: supabaseUser.id,
        username: supabaseUser.email || '',
        password: '', // Not stored for security
        tipos: mapRoleToTipos(supabaseUser.role),
        nombre: supabaseUser.full_name || supabaseUser.email || '',
        email: supabaseUser.email || '',
        activo: true,
        fechaCreacion: supabaseUser.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        perfiles: {
          organizador: supabaseUser.role === 'organizer' ? {
            nombreOrganizacion: supabaseUser.full_name || '',
            descripcion: '',
            telefono: '',
            direccion: '',
            torneos: []
          } : undefined,
          equipo: {
            equipoId: 1,
            nombreEquipo: supabaseUser.full_name || 'My Team',
            colores: {
              principal: '#1e40af',
              secundario: '#ffffff'
            },
            categoria: 'Primera División',
            entrenador: '',
            jugadores: [],
            coaches: [],
            torneos: []
          },
          fiscal: supabaseUser.role === 'referee' ? {
            nombre: supabaseUser.full_name || supabaseUser.email || '',
            experiencia: 0,
            certificaciones: [],
            torneos: []
          } : undefined
        }
      };
      setUser(legacyUser);
    } else {
      setUser(null);
    }
  }, [supabaseUser]);

  // Save current profile in localStorage
  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem('globalLinkSoccerCurrentProfile', currentProfile);
    } else {
      localStorage.removeItem('globalLinkSoccerCurrentProfile');
    }
  }, [currentProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await supabaseSignIn({ email, password });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    supabaseSignOut();
    setCurrentProfile(null);
  };

  const setCurrentProfileType = (tipo: 'organizador' | 'equipo' | 'fiscal') => {
    setCurrentProfile(tipo);
  };

  const updateUserProfile = async (tipo: 'organizador' | 'equipo' | 'fiscal', profileData: any) => {
    if (!supabaseUser) return;

    try {
      // Safely handle profile_data which might be null or not an object
      const currentProfileData = supabaseUser.profile_data && typeof supabaseUser.profile_data === 'object' 
        ? supabaseUser.profile_data as Record<string, any>
        : {};
      
      const updatedProfileData = {
        ...currentProfileData,
        [tipo]: profileData
      };

      await supabaseUpdateProfile({
        profile_data: updatedProfileData
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const updateUsers = (newUsers: User[]) => {
    // This is kept for compatibility but doesn't do anything in Supabase mode
    setUsers(newUsers);
  };

  const value: AuthContextType = {
    user,
    currentProfile,
    login,
    logout,
    setCurrentProfile: setCurrentProfileType,
    updateUserProfile,
    isAuthenticated,
    users,
    updateUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
