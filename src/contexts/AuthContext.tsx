
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios por defecto para testing
const defaultUsers: User[] = [
  {
    id: 'org-001',
    username: 'organizador1',
    password: 'org2024',
    tipo: 'organizador',
    nombre: 'Juan Pérez',
    email: 'juan@organizador.com',
    activo: true,
    fechaCreacion: new Date().toISOString(),
    perfil: {
      nombreOrganizacion: 'Liga Central',
      descripcion: 'Organizadores de torneos de fútbol',
      telefono: '555-0001',
      direccion: 'Calle Principal 123',
      torneos: []
    }
  },
  {
    id: 'eq-001',
    username: 'equipo1',
    password: 'team2024',
    tipo: 'equipo',
    nombre: 'Equipo Los Tigres',
    email: 'tigres@equipo.com',
    activo: true,
    fechaCreacion: new Date().toISOString(),
    perfil: {
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
  },
  {
    id: 'fis-001',
    username: 'fiscal1',
    password: 'ref2024',
    tipo: 'fiscal',
    nombre: 'María González',
    email: 'maria@fiscal.com',
    activo: true,
    fechaCreacion: new Date().toISOString(),
    perfil: {
      nombre: 'María González',
      experiencia: 5,
      certificaciones: ['FIFA Nivel 1', 'Árbitro Nacional'],
      torneos: []
    }
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers);

  useEffect(() => {
    // Cargar usuarios desde localStorage
    const savedUsers = localStorage.getItem('torneo360-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('torneo360-users', JSON.stringify(defaultUsers));
    }

    // Verificar si hay una sesión activa
    const savedUser = localStorage.getItem('torneo360-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = users.find(u => 
      u.username === username && 
      u.password === password && 
      u.activo
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('torneo360-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('torneo360-user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
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
