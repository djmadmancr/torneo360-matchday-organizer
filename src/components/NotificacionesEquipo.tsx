
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
    
    // Actualizar localStorage
    const allNotificaciones = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
    const filteredNotificaciones = allNotificaciones.filter((n: Notificacion) => n.id !== id);
    localStorage.setItem('notificacionesEquipo', JSON.stringify(filteredNotificaciones));
    
    toast.success('Notificación eliminada');
  };

  const marcarComoLeida = (id: string) => {
    const updatedNotificaciones = notificaciones.map(n => 
      n.id === id ? { ...n, accionRequerida: false } : n
    );
    setNotificaciones(updatedNotificaciones);

    // Actualizar localStorage
    const allNotificaciones = JSON.parse(localStorage.getItem('notificacionesEquipo') || '[]');
    const updatedAllNotificaciones = allNotificaciones.map((n: Notificacion) => 
      n.id === id ? { ...n, accionRequerida: false } : n
    );
    localStorage.setItem('notificacionesEquipo', JSON.stringify(updatedAllNotificaciones));
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
