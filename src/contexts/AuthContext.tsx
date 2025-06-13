
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, OrganizadorPerfil, EquipoPerfil, FiscalPerfil } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios por defecto para testing
const defaultUsers: User[] = [
  {
    id: 'org-001',
    username: 'organizador1',
    password: 'org2024',
    tipos: ['organizador'],
    nombre: 'Juan Pérez',
    email: 'juan@organizador.com',
    activo: true,
    fechaCreacion: new Date().toISOString(),
    perfiles: {
      organizador: {
        nombreOrganizacion: 'Liga Central',
        descripcion: 'Organizadores de torneos de fútbol',
        telefono: '555-0001',
        direccion: 'Calle Principal 123',
        torneos: []
      }
    }
  },
  {
    id: 'eq-001',
    username: 'equipo1',
    password: 'team2024',
    tipos: ['equipo'],
    nombre: 'Equipo Los Tigres',
    email: 'tigres@equipo.com',
    activo: true,
    fechaCreacion: new Date().toISOString(),
    perfiles: {
      equipo: {
        nombreEquipo: 'Los Tigres FC',
        colores: {
          principal: '#FF6B35',
          secundario: '#004E89'
        },
        categoria: 'Primera División',
        entrenador: 'Carlos Rodriguez',
        jugadores: [],
        coaches: [],
        torneos: []
      }
    }
  },
  {
    id: 'fis-001',
    username: 'fiscal1',
    password: 'ref2024',
    tipos: ['fiscal'],
    nombre: 'María González',
    email: 'maria@fiscal.com',
    activo: true,
    fechaCreacion: new Date().toISOString(),
    perfiles: {
      fiscal: {
        nombre: 'María González',
        experiencia: 5,
        certificaciones: ['FIFA Nivel 1', 'Árbitro Nacional'],
        torneos: []
      }
    }
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<'organizador' | 'equipo' | 'fiscal' | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers);

  useEffect(() => {
    const savedUsers = localStorage.getItem('torneo360-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('torneo360-users', JSON.stringify(defaultUsers));
    }

    const savedUser = localStorage.getItem('torneo360-user');
    const savedProfile = localStorage.getItem('torneo360-current-profile');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedProfile) {
        setCurrentProfile(savedProfile as 'organizador' | 'equipo' | 'fiscal');
      }
    }
  }, []);

  const updateUsers = (newUsers: User[]) => {
    localStorage.setItem('torneo360-users', JSON.stringify(newUsers));
    setUsers(newUsers);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = users.find(u => 
      u.username === username && 
      u.password === password && 
      u.activo
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('torneo360-user', JSON.stringify(foundUser));
      
      // Set default profile if user has only one type
      if (foundUser.tipos.length === 1) {
        setCurrentProfile(foundUser.tipos[0]);
        localStorage.setItem('torneo360-current-profile', foundUser.tipos[0]);
      }
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCurrentProfile(null);
    localStorage.removeItem('torneo360-user');
    localStorage.removeItem('torneo360-current-profile');
  };

  const handleSetCurrentProfile = (tipo: 'organizador' | 'equipo' | 'fiscal') => {
    if (user && user.tipos.includes(tipo)) {
      setCurrentProfile(tipo);
      localStorage.setItem('torneo360-current-profile', tipo);
    }
  };

  const updateUserProfile = (tipo: 'organizador' | 'equipo' | 'fiscal', profileData: any) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      perfiles: {
        ...user.perfiles,
        [tipo]: profileData
      }
    };

    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    
    setUser(updatedUser);
    updateUsers(updatedUsers);
    localStorage.setItem('torneo360-user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      currentProfile,
      login,
      logout,
      setCurrentProfile: handleSetCurrentProfile,
      updateUserProfile,
      isAuthenticated: !!user,
      users,
      updateUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
