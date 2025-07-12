
import { useState, useEffect } from 'react';
import { buscarInscripcionesPorTorneo, procesarEquiposInscritos, EquipoInscrito } from '../utils/inscripcionesUtils';

interface EstadisticasReales {
  partidosJugados: number;
  golesTotales: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
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

  const cargarEquiposInscritos = () => {
    console.log('🔄 Cargando equipos inscritos para torneo:', torneo.id);
    setLoading(true);
    
    try {
      // Buscar inscripciones
      const inscripciones = buscarInscripcionesPorTorneo(torneo.id);
      
      // Filtrar solo las aprobadas
      const inscripcionesAprobadas = inscripciones.filter(i => 
        i.estado === 'aprobado' || i.estado === 'inscrito'
      );
      
      console.log(`✅ Inscripciones aprobadas: ${inscripcionesAprobadas.length}`);
      
      // Procesar equipos
      const equipos = procesarEquiposInscritos(inscripcionesAprobadas, torneo.categoria);
      
      setEquiposInscritos(equipos);
      console.log(`🏆 Equipos inscritos cargados: ${equipos.length}`);
      
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
      // Buscar partidos y resultados
      const partidosKey = `partidos_${torneo.id}`;
      const resultadosKey = `resultados_${torneo.id}`;
      
      const partidosData = JSON.parse(localStorage.getItem(partidosKey) || '[]');
      const resultadosData = JSON.parse(localStorage.getItem(resultadosKey) || '[]');
      
      let partidosJugados = 0;
      let golesTotales = 0;
      let tarjetasAmarillas = 0;
      let tarjetasRojas = 0;

      // Contar partidos jugados
      partidosJugados = partidosData.filter((partido: any) => 
        partido.estado === 'jugado' || partido.estado === 'finalizado'
      ).length;
      
      // Sumar estadísticas de resultados
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
