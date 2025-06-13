
export interface User {
  id: string;
  username: string;
  password: string;
  tipo: 'organizador' | 'equipo' | 'fiscal';
  nombre: string;
  email: string;
  activo: boolean;
  fechaCreacion: string;
  perfil?: OrganizadorPerfil | EquipoPerfil | FiscalPerfil;
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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
