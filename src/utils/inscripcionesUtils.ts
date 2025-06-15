
export interface EquipoInscrito {
  id: string;
  nombre: string;
  logo: string;
  categoria: string;
  fechaInscripcion: string;
  grupo?: string;
  posicion?: number;
  estado: string;
}

export interface InscripcionData {
  equipoId: string | number;
  torneoId: string;
  fechaInscripcion: string;
  estado: string;
  equipo?: any;
}

export const buscarInscripcionesPorTorneo = (torneoId: string): InscripcionData[] => {
  console.log(`🔍 Buscando inscripciones para torneo: ${torneoId}`);
  
  const inscripciones: InscripcionData[] = [];
  
  // Método 1: Búsqueda por patrones específicos
  const patronesInscripcion = [
    `inscripcion_${torneoId}_`,
    `${torneoId}_inscripcion_`,
    `torneo_${torneoId}_equipo_`
  ];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Verificar si la clave coincide con algún patrón
    const esInscripcion = patronesInscripcion.some(patron => key.startsWith(patron)) ||
                         (key.includes('inscripcion') && key.includes(torneoId));
    
    if (esInscripcion) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          
          // Verificar que sea una inscripción válida
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
  
  const posiblesClaves = [
    `equipo_${equipoId}`,
    `team_${equipoId}`,
    `equipos_${equipoId}`,
    equipoId.toString()
  ];
  
  // También buscar en la lista de equipos
  const equipos = JSON.parse(localStorage.getItem('equipos') || '[]');
  const equipoEnLista = equipos.find((e: any) => 
    e.id === equipoId.toString() || e.id === equipoId
  );
  
  if (equipoEnLista) {
    console.log(`✅ Equipo encontrado en lista:`, equipoEnLista);
    return equipoEnLista;
  }
  
  // Buscar por claves individuales
  for (const clave of posiblesClaves) {
    const equipoData = localStorage.getItem(clave);
    if (equipoData) {
      try {
        const equipo = JSON.parse(equipoData);
        console.log(`✅ Equipo encontrado en ${clave}:`, equipo);
        return equipo;
      } catch (error) {
        console.error(`❌ Error parseando equipo ${clave}:`, error);
      }
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
    
    if (equipo && equipo.nombre) {
      const equipoInscrito: EquipoInscrito = {
        id: inscripcion.equipoId.toString(),
        nombre: equipo.nombre,
        logo: equipo.logo || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center",
        categoria: categoria,
        fechaInscripcion: inscripcion.fechaInscripcion,
        grupo: `Grupo ${String.fromCharCode(65 + (index % 4))}`,
        posicion: index + 1,
        estado: inscripcion.estado || 'inscrito'
      };
      
      equiposInscritos.push(equipoInscrito);
      console.log(`✅ Equipo procesado: ${equipo.nombre}`);
    } else {
      console.log(`❌ No se pudo procesar equipo con ID: ${inscripcion.equipoId}`);
    }
  });
  
  return equiposInscritos;
};
