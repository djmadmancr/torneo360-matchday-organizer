
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface Torneo {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  formato: string;
  fechaInicio: string;
  fechaFin: string;
  maxEquipos: number;
  equiposInscritos: number;
  estado: "inscripciones_abiertas" | "inscripciones_cerradas" | "en_curso" | "finalizado";
  organizadorNombre?: string;
  ubicacion?: string;
}

interface ReportDownloaderProps {
  torneos: Torneo[];
  organizadorNombre: string;
}

const ReportDownloader: React.FC<ReportDownloaderProps> = ({ torneos, organizadorNombre }) => {
  const generarReporte = () => {
    const torneosActivos = torneos.filter(t => 
      t.estado === "en_curso" || t.estado === "inscripciones_abiertas"
    );
    
    if (torneosActivos.length === 0) {
      toast.error("No hay torneos activos para generar reporte");
      return;
    }

    const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const contenidoReporte = `REPORTE DE TORNEOS ACTIVOS - GLOBAL LINK SOCCER
Organizador: ${organizadorNombre}
Fecha de generación: ${fechaGeneracion}
==========================================

${torneosActivos.map((torneo, index) => `
${index + 1}. TORNEO: ${torneo.nombre}
   - ID: ${torneo.id}
   - Categoría: ${torneo.categoria}
   - Tipo: ${torneo.tipo}
   - Formato: ${torneo.formato}
   - Estado: ${torneo.estado.replace('_', ' ').toUpperCase()}
   - Equipos inscritos: ${torneo.equiposInscritos}/${torneo.maxEquipos}
   - Fecha inicio: ${torneo.fechaInicio || 'Por definir'}
   - Fecha fin: ${torneo.fechaFin || 'Por definir'}
   ${torneo.ubicacion ? `- Ubicación: ${torneo.ubicacion}` : ''}
   - Progreso: ${((torneo.equiposInscritos / torneo.maxEquipos) * 100).toFixed(1)}% ocupado
------------------------------------------
`).join('')}

RESUMEN GENERAL:
- Total de torneos activos: ${torneosActivos.length}
- Total de equipos participantes: ${torneosActivos.reduce((acc, t) => acc + t.equiposInscritos, 0)}
- Capacidad total disponible: ${torneosActivos.reduce((acc, t) => acc + t.maxEquipos, 0)}
- Torneos con inscripciones abiertas: ${torneosActivos.filter(t => t.estado === "inscripciones_abiertas").length}
- Torneos en curso: ${torneosActivos.filter(t => t.estado === "en_curso").length}

ESTADÍSTICAS POR TIPO:
${Object.entries(
  torneosActivos.reduce((acc, t) => {
    acc[t.tipo] = (acc[t.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([tipo, cantidad]) => `- ${tipo}: ${cantidad} torneo(s)`).join('\n')}

ESTADÍSTICAS POR CATEGORÍA:
${Object.entries(
  torneosActivos.reduce((acc, t) => {
    acc[t.categoria] = (acc[t.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([categoria, cantidad]) => `- ${categoria}: ${cantidad} torneo(s)`).join('\n')}

==========================================
Reporte generado por Global Link Soccer
`;

    const blob = new Blob([contenidoReporte], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-torneos-activos-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Reporte descargado exitosamente");
  };

  return (
    <Button 
      variant="outline" 
      className="w-full"
      onClick={generarReporte}
    >
      <Download className="w-4 h-4 mr-2" />
      Descargar Reportes
    </Button>
  );
};

export default ReportDownloader;
