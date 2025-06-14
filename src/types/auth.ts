
export interface User {
  id: string;
  username: string; // Ahora siempre será igual al email
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

export interface AuthContextType {
  user: User | null;
  currentProfile: 'organizador' | 'equipo' | 'fiscal' | null;
  login: (email: string, password: string) => Promise<boolean>; // Cambiado de username a email
  logout: () => void;
  setCurrentProfile: (tipo: 'organizador' | 'equipo' | 'fiscal') => void;
  updateUserProfile: (tipo: 'organizador' | 'equipo' | 'fiscal', profileData: any) => void;
  isAuthenticated: boolean;
  users: User[];
  updateUsers: (users: User[]) => void;
}
