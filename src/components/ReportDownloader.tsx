
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
}

interface ReportDownloaderProps {
  torneos: Torneo[];
}

const ReportDownloader: React.FC<ReportDownloaderProps> = ({ torneos }) => {
  const generarReporte = () => {
    const torneosActivos = torneos.filter(t => t.estado === "en_curso" || t.estado === "inscripciones_abiertas");
    
    if (torneosActivos.length === 0) {
      toast.error("No hay torneos activos para generar reporte");
      return;
    }

    const contenidoReporte = `REPORTE DE TORNEOS ACTIVOS - GLOBAL LINK SOCCER
Fecha de generación: ${new Date().toLocaleDateString()}
==========================================

${torneosActivos.map(torneo => `
TORNEO: ${torneo.nombre}
- Categoría: ${torneo.categoria}
- Tipo: ${torneo.tipo}
- Formato: ${torneo.formato}
- Estado: ${torneo.estado.replace('_', ' ')}
- Equipos inscritos: ${torneo.equiposInscritos}/${torneo.maxEquipos}
- Fecha inicio: ${torneo.fechaInicio || 'Por definir'}
- Fecha fin: ${torneo.fechaFin || 'Por definir'}
------------------------------------------
`).join('')}

Total de torneos activos: ${torneosActivos.length}
`;

    const blob = new Blob([contenidoReporte], { type: 'text/plain' });
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
