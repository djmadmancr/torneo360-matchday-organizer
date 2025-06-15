import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
  const eliminarNotificacion = (id: string) => {
    const nuevasNotificaciones = notificaciones.filter(n => n.id !== id);
    setNotificaciones(nuevasNotificaciones);
    
    // Actualizar localStorage para notificaciones de equipo
    const allNotificaciones = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
    const filteredNotificaciones = allNotificaciones.filter((n: Notificacion) => n.id !== id);
    localStorage.setItem('notificacionesEquipo', JSON.stringify(filteredNotificaciones));
    
    console.log('🗑️ Notificación eliminada:', id);
    console.log('📋 Notificaciones restantes:', filteredNotificaciones);
    
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

    // IMPORTANTE: Si es una notificación de aprobación, crear la inscripción usando equipoId numérico
    const notificacion = allNotificaciones.find((n: any) => n.id === id);
    if (notificacion && notificacion.tipo === 'aprobacion' && notificacion.torneoId) {
      console.log('🎯 Procesando notificación de aprobación:', notificacion);
      
      // Obtener equipoId numérico del usuario actual
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        const equipoIdNumerico = obtenerEquipoIdDeUsuario(user);
        
        if (equipoIdNumerico) {
          // Crear registro de inscripción con equipoId numérico
          const inscripcionKey = `inscripcion_${notificacion.torneoId}_${equipoIdNumerico}`;
          const inscripcionData = {
            equipoId: equipoIdNumerico, // Usar equipoId numérico
            torneoId: notificacion.torneoId,
            fechaInscripcion: new Date().toISOString(),
            estado: 'aprobado',
            fechaAprobacion: new Date().toISOString()
          };
          
          localStorage.setItem(inscripcionKey, JSON.stringify(inscripcionData));
          console.log('✅ Inscripción registrada con equipoId numérico:', inscripcionKey, inscripcionData);
          
          // Forzar actualización de la lista de torneos inscritos
          window.dispatchEvent(new Event('torneosInscritosUpdate'));
        } else {
          console.error('❌ No se pudo obtener equipoId numérico para la inscripción');
        }
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

  // Mostrar información adicional del torneo para notificaciones de aprobación
  const getDetallesNotificacion = (notificacion: Notificacion) => {
    if (notificacion.tipo === 'aprobacion' && notificacion.torneoId) {
      const torneos = JSON.parse(localStorage.getItem('torneosPublicos') || '[]');
      const torneo = torneos.find((t: any) => t.id === notificacion.torneoId);
      
      // Obtener equipoId numérico para mostrar en debug
      const userStr = localStorage.getItem('currentUser');
      let equipoIdNumerico = null;
      if (userStr) {
        const user = JSON.parse(userStr);
        equipoIdNumerico = obtenerEquipoIdDeUsuario(user);
      }
      
      if (torneo) {
        return (
          <div className="mt-2 p-2 bg-green-50 rounded-md">
            <p className="text-sm text-green-700">
              <strong>Torneo:</strong> {torneo.nombre}
            </p>
            <p className="text-xs text-green-600">
              ID: {torneo.id} | Organizador: {torneo.organizadorNombre}
            </p>
            <p className="text-xs text-green-600 mt-1">
              <strong>TorneoId en notificación:</strong> {notificacion.torneoId}
            </p>
            {equipoIdNumerico && (
              <p className="text-xs text-blue-600 mt-1">
                <strong>EquipoId numérico:</strong> {equipoIdNumerico}
              </p>
            )}
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
            {equipoIdNumerico && (
              <p className="text-xs text-blue-600 mt-1">
                <strong>EquipoId numérico:</strong> {equipoIdNumerico}
              </p>
            )}
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
                        <div className="text-xs text-muted-foreground mt-1 bg-gray-100 p-2 rounded">
                          <p><strong>ID Notificación:</strong> {notificacion.id}</p>
                          {notificacion.equipoId && <p><strong>EquipoId (legacy):</strong> {notificacion.equipoId}</p>}
                          {notificacion.torneoId && <p><strong>TorneoId:</strong> {notificacion.torneoId}</p>}
                        </div>
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
