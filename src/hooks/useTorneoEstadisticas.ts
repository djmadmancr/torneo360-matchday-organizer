
import { useState, useEffect } from 'react';

interface EstadisticasReales {
  partidosJugados: number;
  golesTotales: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
}

interface EquipoInscrito {
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

interface Torneo {
  id: string;
  nombre: string;
  categoria: string;
}

export const useTorneoEstadisticas = (torneo: Torneo) => {
  const [equiposInscritos, setEquiposInscritos] = useState<EquipoInscrito[]>([]);
  const [estadisticasReales, setEstadisticasReales] = useState<EstadisticasReales>({
    partidosJugados: 0,
    golesTotales: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0
  });
  const [loading, setLoading] = useState(true);

  const buscarInscripcionesAprobadas = (torneoId: string) => {
    console.log(`🔍 Buscando inscripciones aprobadas para torneo: ${torneoId}`);
    
    const inscripcionesAprobadas = [];
    
    // Recorrer todas las claves del localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      // Buscar claves que contengan el patrón de inscripción
      if (key.includes('inscripcion_') && key.includes(torneoId)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const inscripcion = JSON.parse(data);
            
            // Verificar que sea una inscripción aprobada para este torneo
            if (inscripcion.torneoId === torneoId && 
                (inscripcion.estado === 'aprobado' || inscripcion.estado === 'inscrito')) {
              console.log(`✅ Inscripción aprobada encontrada:`, inscripcion);
              inscripcionesAprobadas.push(inscripcion);
            }
          }
        } catch (error) {
          console.error(`❌ Error parseando inscripción ${key}:`, error);
        }
      }
    }
    
    console.log(`📋 Total inscripciones aprobadas encontradas: ${inscripcionesAprobadas.length}`);
    return inscripcionesAprobadas;
  };

  const obtenerDatosEquipo = (equipoId: string) => {
    console.log(`🔍 Obteniendo datos del equipo: ${equipoId}`);
    
    // Buscar en la lista de equipos
    const equipos = JSON.parse(localStorage.getItem('equipos') || '[]');
    const equipo = equipos.find((e: any) => e.id === equipoId || e.id === equipoId.toString());
    
    if (equipo) {
      console.log(`✅ Equipo encontrado:`, equipo.nombre);
      return equipo;
    }
    
    // Buscar por claves individuales
    const posiblesClaves = [`equipo_${equipoId}`, `team_${equipoId}`, equipoId];
    
    for (const clave of posiblesClaves) {
      const equipoData = localStorage.getItem(clave);
      if (equipoData) {
        try {
          const equipoParsed = JSON.parse(equipoData);
          console.log(`✅ Equipo encontrado en ${clave}:`, equipoParsed.nombre);
          return equipoParsed;
        } catch (error) {
          console.error(`❌ Error parseando equipo ${clave}:`, error);
        }
      }
    }
    
    console.log(`❌ No se encontraron datos para el equipo: ${equipoId}`);
    return null;
  };

  const cargarEquiposInscritos = () => {
    console.log('🔄 Cargando equipos inscritos para torneo:', torneo.id);
    setLoading(true);
    
    try {
      // Buscar inscripciones aprobadas
      const inscripciones = buscarInscripcionesAprobadas(torneo.id);
      
      const equiposConDatos: EquipoInscrito[] = [];
      
      inscripciones.forEach((inscripcion, index) => {
        const equipoData = obtenerDatosEquipo(inscripcion.equipoId);
        
        if (equipoData && equipoData.nombre) {
          const equipoInscrito: EquipoInscrito = {
            id: inscripcion.equipoId,
            nombre: equipoData.nombre,
            logo: equipoData.logo || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=50&h=50&fit=crop&crop=center",
            categoria: torneo.categoria,
            fechaInscripcion: inscripcion.fechaAprobacion || inscripcion.fechaInscripcion || new Date().toISOString(),
            grupo: `Grupo ${String.fromCharCode(65 + (index % 4))}`,
            posicion: index + 1,
            estado: 'inscrito',
            jugadores: equipoData.jugadores || [],
            staff: equipoData.staff || []
          };
          
          equiposConDatos.push(equipoInscrito);
          console.log(`✅ Equipo procesado: ${equipoData.nombre}`);
        } else {
          console.log(`❌ No se pudieron obtener datos del equipo: ${inscripcion.equipoId}`);
        }
      });
      
      setEquiposInscritos(equiposConDatos);
      console.log(`🏆 Total equipos inscritos cargados: ${equiposConDatos.length}`);
      
    } catch (error) {
      console.error('❌ Error cargando equipos inscritos:', error);
      setEquiposInscritos([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticasReales = () => {
    console.log('📊 Calculando estadísticas reales para torneo:', torneo.id);
    
    try {
      const partidosKey = `partidos_${torneo.id}`;
      const resultadosKey = `resultados_${torneo.id}`;
      
      const partidosData = JSON.parse(localStorage.getItem(partidosKey) || '[]');
      const resultadosData = JSON.parse(localStorage.getItem(resultadosKey) || '[]');
      
      let partidosJugados = 0;
      let golesTotales = 0;
      let tarjetasAmarillas = 0;
      let tarjetasRojas = 0;

      partidosJugados = partidosData.filter((partido: any) => 
        partido.estado === 'jugado' || partido.estado === 'finalizado'
      ).length;
      
      resultadosData.forEach((resultado: any) => {
        if (resultado.golesLocal !== undefined && resultado.golesVisitante !== undefined) {
          golesTotales += resultado.golesLocal + resultado.golesVisitante;
        }
        
        if (resultado.tarjetasAmarillas) tarjetasAmarillas += resultado.tarjetasAmarillas;
        if (resultado.tarjetasRojas) tarjetasRojas += resultado.tarjetasRojas;
      });

      const nuevasEstadisticas = {
        partidosJugados,
        golesTotales,
        tarjetasAmarillas,
        tarjetasRojas
      };
      
      setEstadisticasReales(nuevasEstadisticas);
      console.log('📈 Estadísticas calculadas:', nuevasEstadisticas);
      
    } catch (error) {
      console.error('❌ Error calculando estadísticas:', error);
    }
  };

  useEffect(() => {
    if (torneo.id) {
      cargarEquiposInscritos();
      calcularEstadisticasReales();
    }
  }, [torneo.id]);

  return {
    equiposInscritos,
    estadisticasReales,
    loading,
    recargar: () => {
      cargarEquiposInscritos();
      calcularEstadisticasReales();
    }
  };
};
