
// Utilitario para migrar equipos a la nueva estructura con equipoId numérico

export const generarEquipoId = (): number => {
  const equipoIds = JSON.parse(localStorage.getItem('equipoIds') || '[]');
  const ultimoId = equipoIds.length > 0 ? Math.max(...equipoIds) : 0;
  const nuevoId = ultimoId + 1;
  
  equipoIds.push(nuevoId);
  localStorage.setItem('equipoIds', JSON.stringify(equipoIds));
  
  console.log('🆔 Nuevo equipoId generado:', nuevoId);
  return nuevoId;
};

export const migrarEquipoSiNoTieneId = (user: any): any => {
  if (!user.perfiles?.equipo) return user;
  
  // Si ya tiene equipoId, no hacer nada
  if (user.perfiles.equipo.equipoId) {
    console.log('✅ Equipo ya tiene ID:', user.perfiles.equipo.equipoId);
    return user;
  }
  
  // Generar nuevo equipoId
  const nuevoEquipoId = generarEquipoId();
  
  const userActualizado = {
    ...user,
    perfiles: {
      ...user.perfiles,
      equipo: {
        ...user.perfiles.equipo,
        equipoId: nuevoEquipoId
      }
    }
  };
  
  console.log('🔄 Equipo migrado con nuevo ID:', nuevoEquipoId);
  
  // Migrar datos existentes usando el nuevo equipoId
  migrarDatosExistentes(user.id, nuevoEquipoId);
  
  return userActualizado;
};

const migrarDatosExistentes = (userId: string, nuevoEquipoId: number) => {
  console.log('🔄 Migrando datos existentes para equipoId:', nuevoEquipoId);
  
  // Migrar inscripciones
  const todasLasClaves = Object.keys(localStorage);
  const clavesInscripcionViejas = todasLasClaves.filter(clave => 
    clave.startsWith('inscripcion_') && clave.endsWith(`_${userId}`)
  );
  
  clavesInscripcionViejas.forEach(claveVieja => {
    const datos = localStorage.getItem(claveVieja);
    if (datos) {
      // Crear nueva clave con equipoId numérico
      const [, torneoId] = claveVieja.split('_');
      const claveNueva = `inscripcion_${torneoId}_${nuevoEquipoId}`;
      
      const datosActualizados = {
        ...JSON.parse(datos),
        equipoId: nuevoEquipoId
      };
      
      localStorage.setItem(claveNueva, JSON.stringify(datosActualizados));
      console.log('✅ Inscripción migrada:', claveVieja, '->', claveNueva);
    }
  });
  
  // Migrar notificaciones
  const notificaciones = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
  const notificacionesActualizadas = notificaciones.map((n: any) => {
    if (n.equipoId === userId) {
      return { ...n, equipoId: nuevoEquipoId };
    }
    return n;
  });
  
  if (notificacionesActualizadas.some((n: any, i: number) => n !== notificaciones[i])) {
    localStorage.setItem('notificacionesEquipo', JSON.stringify(notificacionesActualizadas));
    console.log('✅ Notificaciones migradas para equipoId:', nuevoEquipoId);
  }
  
  // Migrar estadísticas
  const historialTorneos = localStorage.getItem(`historialTorneos_${userId}`);
  if (historialTorneos) {
    localStorage.setItem(`historialTorneos_${nuevoEquipoId}`, historialTorneos);
    console.log('✅ Historial de torneos migrado');
  }
  
  const historialJugadores = localStorage.getItem(`historialJugadores_${userId}`);
  if (historialJugadores) {
    localStorage.setItem(`historialJugadores_${nuevoEquipoId}`, historialJugadores);
    console.log('✅ Historial de jugadores migrado');
  }
};

export const obtenerEquipoIdDeUsuario = (user: any): number | null => {
  if (!user?.perfiles?.equipo) return null;
  
  // Migrar si no tiene equipoId
  const userMigrado = migrarEquipoSiNoTieneId(user);
  
  return userMigrado.perfiles.equipo.equipoId || null;
};
