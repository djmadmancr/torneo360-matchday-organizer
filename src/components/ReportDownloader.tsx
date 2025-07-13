
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
  torneo: Torneo;
}

const ReportDownloader: React.FC<ReportDownloaderProps> = ({ torneo }) => {
  const generarReporte = () => {
    const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const contenidoReporte = `REPORTE DE TORNEO - GLOBAL LINK SOCCER
Fecha de generación: ${fechaGeneracion}
==========================================

INFORMACIÓN DEL TORNEO:
- Nombre: ${torneo.nombre}
- ID: ${torneo.id}
- Categoría: ${torneo.categoria}
- Tipo: ${torneo.tipo}
- Estado: ${torneo.estado.replace('_', ' ').toUpperCase()}
- Equipos inscritos: ${torneo.equiposInscritos}/${torneo.maxEquipos}
- Fecha inicio: ${torneo.fechaInicio || 'Por definir'}
- Fecha fin: ${torneo.fechaFin || 'Por definir'}
${torneo.ubicacion ? `- Ubicación: ${torneo.ubicacion}` : ''}
- Progreso: ${((torneo.equiposInscritos / torneo.maxEquipos) * 100).toFixed(1)}% ocupado

==========================================
Reporte generado por Global Link Soccer
`;

    const blob = new Blob([contenidoReporte], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${torneo.nombre.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Reporte descargado exitosamente");
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Generar Reporte</h3>
      <Button 
        onClick={generarReporte}
        className="w-full"
      >
        <Download className="w-4 h-4 mr-2" />
        Descargar Reporte del Torneo
      </Button>
    </div>
  );
};

export default ReportDownloader;
