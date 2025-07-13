import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { obtenerEquipoIdDeUsuario } from '../utils/equipoMigration';

interface Notificacion {
  id: string;
  tipo: "inscripcion" | "reprogramacion" | "otra" | "aprobacion" | "rechazo";
  titulo: string;
  mensaje: string;
  fecha: string;
  equipoSolicitante?: string;
  torneoId?: string;
  partidoId?: string;
  accionRequerida: boolean;
  equipoId?: string;
  mensajeEquipo?: string;
}

interface NotificacionesEquipoProps {
  open: boolean;
  onClose: () => void;
  notificaciones: Notificacion[];
  setNotificaciones: (notificaciones: Notificacion[]) => void;
}

const NotificacionesEquipo: React.FC<NotificacionesEquipoProps> = ({
  open,
  onClose,
  notificaciones,
  setNotificaciones
}) => {
  const { currentUser } = useAuth();

  const eliminarNotificacion = (id: string) => {
    const nuevasNotificaciones = notificaciones.filter(n => n.id !== id);
    setNotificaciones(nuevasNotificaciones);
    
    // Actualizar localStorage para notificaciones de equipo
    const allNotificaciones = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
    const filteredNotificaciones = allNotificaciones.filter((n: Notificacion) => n.id !== id);
    localStorage.setItem('notificacionesEquipo', JSON.stringify(filteredNotificaciones));
    
    console.log('🗑️ Notificación eliminada:', id);
    toast.success('Notificación eliminada');
  };

  const marcarComoLeida = (id: string) => {
    const updatedNotificaciones = notificaciones.map(n => 
      n.id === id ? { ...n, accionRequerida: false } : n
    );
    setNotificaciones(updatedNotificaciones);

    // Actualizar localStorage para notificaciones de equipo
    const allNotificaciones = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
    const updatedAllNotificaciones = allNotificaciones.map((n: Notificacion) => 
      n.id === id ? { ...n, accionRequerida: false } : n
    );
    localStorage.setItem('notificacionesEquipo', JSON.stringify(updatedAllNotificaciones));
    
    console.log('✅ Notificación marcada como leída:', id);

    // CRUCIAL: Si es una notificación de aprobación, crear MÚLTIPLES registros de inscripción
    const notificacion = allNotificaciones.find((n: any) => n.id === id);
    if (notificacion && notificacion.tipo === 'aprobacion' && notificacion.torneoId && currentUser) {
      console.log('🎯 Procesando notificación de aprobación:', notificacion);
      
      // Obtener equipoId numérico del usuario actual
      const equipoIdNumerico = obtenerEquipoIdDeUsuario(currentUser);
      
      if (equipoIdNumerico) {
        const timestamp = new Date().toISOString();
        
        // Método 1: Clave con equipoId numérico (PRINCIPAL)
        const inscripcionKey1 = `inscripcion_${notificacion.torneoId}_${equipoIdNumerico}`;
        const inscripcionData1 = {
          equipoId: equipoIdNumerico,
          torneoId: notificacion.torneoId,
          fechaInscripcion: timestamp,
          estado: 'aprobado',
          fechaAprobacion: timestamp
        };
        
        // Método 2: Clave con userId (RESPALDO)
        const inscripcionKey2 = `inscripcion_${notificacion.torneoId}_${currentUser.id}`;
        const inscripcionData2 = {
          equipoId: currentUser.id,
          torneoId: notificacion.torneoId,
          fechaInscripcion: timestamp,
          estado: 'aprobado',
          fechaAprobacion: timestamp
        };
        
        // Método 3: Clave inversa (RESPALDO ADICIONAL)
        const inscripcionKey3 = `torneo_${notificacion.torneoId}_equipo_${equipoIdNumerico}`;
        const inscripcionData3 = {
          equipoId: equipoIdNumerico,
          torneoId: notificacion.torneoId,
          fechaInscripcion: timestamp,
          estado: 'aprobado',
          fechaAprobacion: timestamp
        };
        
        // Guardar TODAS las variantes para máxima compatibilidad
        localStorage.setItem(inscripcionKey1, JSON.stringify(inscripcionData1));
        localStorage.setItem(inscripcionKey2, JSON.stringify(inscripcionData2));
        localStorage.setItem(inscripcionKey3, JSON.stringify(inscripcionData3));
        
        console.log('✅ Inscripciones registradas MÚLTIPLES:', {
          key1: inscripcionKey1,
          key2: inscripcionKey2,
          key3: inscripcionKey3,
          data: inscripcionData1
        });
        
        // También agregar a la lista general de equipos inscritos si existe
        const equiposInscritosKey = `equipos_inscritos_${notificacion.torneoId}`;
        const equiposInscritos = JSON.parse(localStorage.getItem(equiposInscritosKey) || '[]');
        
        // Verificar si ya está en la lista
        const yaInscrito = equiposInscritos.some((e: any) => 
          e.equipoId === equipoIdNumerico || e.equipoId === currentUser.id
        );
        
        if (!yaInscrito) {
          equiposInscritos.push({
            equipoId: equipoIdNumerico,
            userId: currentUser.id,
            fechaInscripcion: timestamp,
            estado: 'aprobado'
          });
          localStorage.setItem(equiposInscritosKey, JSON.stringify(equiposInscritos));
          console.log('✅ Agregado a lista general de equipos inscritos');
        }
        
        // Forzar actualización INMEDIATA de todos los componentes
        window.dispatchEvent(new CustomEvent('torneosInscritosUpdate'));
        window.dispatchEvent(new CustomEvent('equiposInscritosUpdate'));
        window.dispatchEvent(new CustomEvent('inscripcionesUpdate'));
        
        // Forzar recarga después de un breve delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('torneosInscritosUpdate'));
          window.location.reload();
        }, 1000);
        
        toast.success('¡Inscripción confirmada! El torneo aparecerá en "Mis Torneos" y se marcará como inscrito');
      } else {
        console.error('❌ No se pudo obtener equipoId numérico para la inscripción');
        toast.error('Error al procesar la inscripción');
      }
    }
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'aprobacion':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rechazo':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'inscripcion':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'aprobacion':
        return 'default';
      case 'rechazo':
        return 'destructive';
      case 'inscripcion':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getDetallesNotificacion = (notificacion: Notificacion) => {
    if (notificacion.tipo === 'aprobacion' && notificacion.torneoId && currentUser) {
      const torneos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
      const torneo = torneos.find((t: any) => t.id === notificacion.torneoId);
      
      if (torneo) {
        return (
          <div className="mt-2 p-2 bg-green-50 rounded-md">
            <p className="text-sm text-green-700">
              <strong>Torneo:</strong> {torneo.nombre}
            </p>
            <p className="text-xs text-green-600">
              ID: {torneo.id} | Organizador: {torneo.organizadorNombre}
            </p>
          </div>
        );
      } else {
        return (
          <div className="mt-2 p-2 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-700">
              <strong>TorneoId:</strong> {notificacion.torneoId}
            </p>
            <p className="text-xs text-yellow-600">
              (Torneo no encontrado en la lista pública)
            </p>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Notificaciones del Equipo</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh] space-y-4">
          {notificaciones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tienes notificaciones</p>
            </div>
          ) : (
            notificaciones.map((notificacion) => (
              <Card key={notificacion.id} className={notificacion.accionRequerida ? 'border-blue-200 bg-blue-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getIconoTipo(notificacion.tipo)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{notificacion.titulo}</h4>
                          <Badge variant={getBadgeVariant(notificacion.tipo)}>
                            {notificacion.tipo}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notificacion.mensaje}
                        </p>
                        {getDetallesNotificacion(notificacion)}
                        <p className="text-xs text-muted-foreground">
                          Fecha: {notificacion.fecha}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {notificacion.accionRequerida && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => marcarComoLeida(notificacion.id)}
                        >
                          Marcar como leída
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => eliminarNotificacion(notificacion.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificacionesEquipo;
