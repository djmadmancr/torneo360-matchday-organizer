
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
        nombreOrganizacion: 'Admin Organization',
        descripcion: '',
        telefono: '',
        direccion: '',
        torneos: []
      },
      equipo: {
        nombreEquipo: 'Admin Team',
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
      fiscal: {
        nombre: 'Admin User',
        experiencia: 0,
        certificaciones: [],
        torneos: []
      }
    }
  }
];

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('globalLinkSoccerUsers');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      // Si hay usuarios guardados, los usamos tal como están para preservar datos existentes
      return parsedUsers;
    }
    // Solo si no hay usuarios guardados, usamos los iniciales
    return initialUsers;
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
    
    // Si el usuario actual fue modificado, actualizar también el estado del usuario actual
    if (user) {
      const updatedCurrentUser = newUsers.find(u => u.id === user.id);
      if (updatedCurrentUser) {
        setUser(updatedCurrentUser);
      }
    }
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
