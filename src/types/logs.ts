
export interface LogEntry {
  id: string;
  fecha: string;
  hora: string;
  accion: string;
  detalles: string;
  tipo: 'creacion' | 'edicion' | 'eliminacion' | 'inscripcion' | 'aprobacion' | 'rechazo' | 'inicio' | 'cierre';
  entidad?: string; // torneo, equipo, etc.
  entidadId?: string;
}

export interface UserLogs {
  userId: string;
  logs: LogEntry[];
}
