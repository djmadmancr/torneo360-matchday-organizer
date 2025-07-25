
export type UserRole = 'admin' | 'organizer' | 'referee' | 'team_admin';

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
}

// Legacy types for backward compatibility
export interface User {
  id: string;
  username: string;
  password: string;
  tipos: ('organizador' | 'equipo' | 'fiscal')[];
  nombre: string;
  email: string;
  activo: boolean;
  fechaCreacion: string;
  perfiles: {
    organizador?: OrganizadorPerfil;
    equipo?: EquipoPerfil;
    fiscal?: FiscalPerfil;
  };
}

export interface OrganizadorPerfil {
  nombreOrganizacion: string;
  logo?: string;
  descripcion: string;
  telefono: string;
  direccion: string;
  torneos: string[];
}

export interface EquipoPerfil {
  equipoId: number;
  nombreEquipo: string;
  logo?: string;
  colores: {
    principal: string;
    secundario: string;
  };
  categoria: string;
  entrenador: string;
  jugadores: Jugador[];
  coaches: Coach[];
  torneos: string[];
}

export interface FiscalPerfil {
  nombre: string;
  experiencia: number;
  certificaciones: string[];
  torneos: string[];
}

export interface Jugador {
  id: string;
  nombre: string;
  posicion: string;
  numeroIdentificacion: string;
  edad: number;
}

export interface Coach {
  nombre: string;
  tipo: "entrenador" | "asistente";
  numeroIdentificacion: string;
}

// Legacy interface for backward compatibility
export interface AuthContextType {
  user: User | null;
  currentProfile: 'organizador' | 'equipo' | 'fiscal' | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setCurrentProfile: (tipo: 'organizador' | 'equipo' | 'fiscal') => void;
  updateUserProfile: (tipo: 'organizador' | 'equipo' | 'fiscal', profileData: any) => void;
  isAuthenticated: boolean;
  users: User[];
  updateUsers: (users: User[]) => void;
}
