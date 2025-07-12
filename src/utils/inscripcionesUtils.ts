
export interface EquipoInscrito {
  id: string;
  nombre: string;
  logo: string;
  categoria: string;
  fechaInscripcion: string;
  grupo?: string;
  posicion?: number;
  estado: string;
  jugadores?: any[];
  staff?: any[];
}

export interface InscripcionData {
  equipoId: string | number;
  torneoId: string;
  fechaInscripcion?: string;
  fechaAprobacion?: string;
  estado: string;
  equipo?: any;
}

export const buscarInscripcionesPorTorneo = (torneoId: string): InscripcionData[] => {
  console.log(`🔍 Buscando inscripciones para torneo: ${torneoId}`);
  
  const inscripciones: InscripcionData[] = [];
  
  // Recorrer todas las claves del localStorage de manera exhaustiva
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Verificar si la clave contiene patrones de inscripción para este torneo
    const esInscripcionDelTorneo = (
      key.includes('inscripcion_') && key.includes(torneoId)
    ) || (
      key.startsWith(`inscripcion_${torneoId}_`) ||
      key.startsWith(`${torneoId}_inscripcion_`) ||
      key.startsWith(`torneo_${torneoId}_equipo_`)
    );
    
    if (esInscripcionDelTorneo) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          
          // Verificar que sea una inscripción válida para este torneo
          if (parsed.torneoId === torneoId && parsed.equipoId) {
            console.log(`✅ Inscripción encontrada en ${key}:`, parsed);
            inscripciones.push(parsed);
          }
        }
      } catch (error) {
        console.error(`❌ Error parseando ${key}:`, error);
      }
    }
  }
  
  console.log(`📋 Total inscripciones encontradas: ${inscripciones.length}`);
  return inscripciones;
};

export const obtenerDatosEquipo = (equipoId: string | number): any => {
  console.log(`🔍 Buscando datos del equipo: ${equipoId}`);
  
  // Método más eficiente: buscar primero en la lista de equipos
  try {
    const equipos = JSON.parse(localStorage.getItem('equipos') || '[]');
    const equipoEnLista = equipos.find((e: any) => 
      e.id === equipoId.toString() || e.id === equipoId || 
      e.id === parseInt(equipoId.toString()) || 
      equipoId.toString() === e.id.toString()
    );
    
    if (equipoEnLista) {
      console.log(`✅ Equipo encontrado en lista:`, equipoEnLista);
      return equipoEnLista;
    }
  } catch (error) {
    console.error('❌ Error leyendo lista de equipos:', error);
  }
  
  // Buscar por claves individuales si no se encuentra en la lista
  const posiblesClaves = [
    `equipo_${equipoId}`,
    `team_${equipoId}`,
    `equipos_${equipoId}`,
    equipoId.toString(),
    `user_${equipoId}`,
    `profile_${equipoId}`
  ];
  
  for (const clave of posiblesClaves) {
    try {
      const equipoData = localStorage.getItem(clave);
      if (equipoData) {
        const equipo = JSON.parse(equipoData);
        if (equipo && (equipo.nombre || equipo.name)) {
          console.log(`✅ Equipo encontrado en ${clave}:`, equipo);
          return equipo;
        }
      }
    } catch (error) {
      console.error(`❌ Error parseando equipo ${clave}:`, error);
    }
  }
  
  console.log(`❌ No se encontraron datos para el equipo: ${equipoId}`);
  return null;
};

export const procesarEquiposInscritos = (
  inscripciones: InscripcionData[], 
  categoria: string
): EquipoInscrito[] => {
  console.log(`🏗️ Procesando ${inscripciones.length} inscripciones`);
  
  const equiposInscritos: EquipoInscrito[] = [];
  
  inscripciones.forEach((inscripcion, index) => {
    let equipo = inscripcion.equipo;
    
    // Si no tenemos datos del equipo en la inscripción, buscarlos
    if (!equipo || !equipo.nombre) {
      equipo = obtenerDatosEquipo(inscripcion.equipoId);
    }
    
    if (equipo && (equipo.nombre || equipo.name)) {
      const equipoInscrito: EquipoInscrito = {
        id: inscripcion.equipoId.toString(),
        nombre: equipo.nombre || equipo.name,
        logo: equipo.logo || equipo.imagen || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center",
        categoria: categoria,
        fechaInscripcion: inscripcion.fechaAprobacion || inscripcion.fechaInscripcion || new Date().toISOString(),
        grupo: `Grupo ${String.fromCharCode(65 + (index % 4))}`,
        posicion: index + 1,
        estado: inscripcion.estado || 'inscrito',
        jugadores: equipo.jugadores || [],
        staff: equipo.staff || equipo.cuerpoTecnico || []
      };
      
      equiposInscritos.push(equipoInscrito);
      console.log(`✅ Equipo procesado: ${equipo.nombre || equipo.name}`);
    } else {
      console.log(`❌ No se pudo procesar equipo con ID: ${inscripcion.equipoId}`);
    }
  });
  
  console.log(`🏆 Total equipos procesados: ${equiposInscritos.length}`);
  return equiposInscritos;
};

// Función auxiliar para contar inscripciones aprobadas de un torneo
export const contarEquiposInscritos = (torneoId: string): number => {
  const inscripciones = buscarInscripcionesPorTorneo(torneoId);
  const inscripcionesAprobadas = inscripciones.filter(i => 
    i.estado === 'aprobado' || i.estado === 'inscrito'
  );
  
  console.log(`📊 Equipos inscritos en ${torneoId}: ${inscripcionesAprobadas.length}`);
  return inscripcionesAprobadas.length;
};
