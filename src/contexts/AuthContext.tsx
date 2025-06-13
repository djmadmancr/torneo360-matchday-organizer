
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthContextType } from '@/types/auth';

const initialUsers: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    password: 'password',
    tipos: ['organizador', 'equipo', 'fiscal'],
    nombre: 'Admin User',
    email: 'admin@example.com',
    activo: true,
    fechaCreacion: '2024-01-01',
    perfiles: {
      organizador: {
        nombreOrganizacion: 'Liga Municipal',
        logo: 'https://images.unsplash.com/photo-1614632537190-23e4b93dc25e?w=100&h=100&fit=crop&crop=center',
        descripcion: 'Organización de torneos locales',
        telefono: '+57 300 123 4567',
        direccion: 'Calle 123, Ciudad',
        torneos: []
      },
      equipo: {
        nombreEquipo: 'Águilas FC',
        logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100&h=100&fit=crop&crop=center',
        colores: {
          principal: '#1e40af',
          secundario: '#ffffff'
        },
        categoria: 'Primera División',
        entrenador: 'Carlos Rodríguez',
        jugadores: [
          { id: 'J001', nombre: 'Juan Pérez', posicion: 'Delantero', numeroIdentificacion: '12345', edad: 22 },
          { id: 'J002', nombre: 'Luis Gómez', posicion: 'Mediocampista', numeroIdentificacion: '67890', edad: 24 }
        ],
        coaches: [
          { nombre: 'Pedro López', tipo: 'entrenador', numeroIdentificacion: '11223' },
          { nombre: 'Ana Torres', tipo: 'asistente', numeroIdentificacion: '44556' }
        ],
        torneos: []
      },
      fiscal: {
        nombre: 'Laura Pérez',
        experiencia: 5,
        certificaciones: ['FIFA', 'CONMEBOL'],
        torneos: []
      }
    }
  },
  {
    id: 'user-002',
    username: 'organizador1',
    password: 'org2024',
    tipos: ['organizador'],
    nombre: 'Carlos Rodríguez',
    email: 'carlos@organizador.com',
    activo: true,
    fechaCreacion: '2024-02-15',
    perfiles: {
      organizador: {
        nombreOrganizacion: 'Liga Profesional',
        logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop&crop=center',
        descripcion: 'Organizador de torneos profesionales',
        telefono: '+57 311 222 3344',
        direccion: 'Carrera 456, Localidad',
        torneos: []
      }
    }
  },
  {
    id: 'user-003',
    username: 'equipo1',
    password: 'team2024',
    tipos: ['equipo'],
    nombre: 'Leones FC Manager',
    email: 'manager@leonesfc.com',
    activo: true,
    fechaCreacion: '2024-03-01',
    perfiles: {
      equipo: {
        nombreEquipo: 'Leones FC',
        logo: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop&crop=center',
        colores: {
          principal: '#ffc107',
          secundario: '#000000'
        },
        categoria: 'Segunda División',
        entrenador: 'Ricardo Díaz',
        jugadores: [
          { id: 'J003', nombre: 'Sofía Martínez', posicion: 'Defensa', numeroIdentificacion: '24680', edad: 21 },
          { id: 'J004', nombre: 'Diego Castro', posicion: 'Portero', numeroIdentificacion: '13579', edad: 23 }
        ],
        coaches: [
          { nombre: 'Elena Ruiz', tipo: 'entrenador', numeroIdentificacion: '77889' },
          { nombre: 'Javier Vargas', tipo: 'asistente', numeroIdentificacion: '99001' }
        ],
        torneos: []
      }
    }
  },
  {
    id: 'user-004',
    username: 'fiscal1',
    password: 'ref2024',
    tipos: ['fiscal'],
    nombre: 'Ana Gómez',
    email: 'ana@fiscal.com',
    activo: true,
    fechaCreacion: '2024-04-10',
    perfiles: {
      fiscal: {
        nombre: 'Ana Gómez',
        experiencia: 3,
        certificaciones: ['LOCAL'],
        torneos: []
      }
    }
  }
];

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('globalLinkSoccerUsers');
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('globalLinkSoccerUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);
  
  const [currentProfile, setCurrentProfile] = useState<'organizador' | 'equipo' | 'fiscal' | null>(() => {
    const storedProfile = localStorage.getItem('globalLinkSoccerCurrentProfile');
    return storedProfile ? (storedProfile as 'organizador' | 'equipo' | 'fiscal') : null;
  });

  // Guardar usuarios en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('globalLinkSoccerUsers', JSON.stringify(users));
  }, [users]);

  // Guardar usuario actual en localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('globalLinkSoccerUser', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('globalLinkSoccerUser');
      setIsAuthenticated(false);
    }
  }, [user]);

  // Guardar perfil actual en localStorage
  useEffect(() => {
    if (currentProfile) {
      localStorage.setItem('globalLinkSoccerCurrentProfile', currentProfile);
    } else {
      localStorage.removeItem('globalLinkSoccerCurrentProfile');
    }
  }, [currentProfile]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = users.find(u => u.username === username && u.password === password && u.activo);
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      return true;
    } else {
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentProfile(null);
  };

  const setCurrentProfileType = (tipo: 'organizador' | 'equipo' | 'fiscal') => {
    setCurrentProfile(tipo);
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

    setUser(updatedUser);
    
    // Actualizar también en la lista de usuarios
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === user.id ? updatedUser : u)
    );
  };

  const updateUsers = (newUsers: User[]) => {
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
