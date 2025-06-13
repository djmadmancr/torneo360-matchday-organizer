
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trophy, Users, Calendar, MapPin, Send } from "lucide-react";

interface Torneo {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  formato: string;
  fechaInicio: string;
  fechaFin: string;
  logo: string;
  maxEquipos: number;
  equiposInscritos: number;
  estado: "inscripciones_abiertas" | "inscripciones_cerradas" | "en_curso" | "finalizado";
  edadMinima?: number;
  edadMaxima?: number;
  esPublico: boolean;
  organizadorId: string;
  organizadorNombre: string;
  descripcion?: string;
  ubicacion?: string;
}

interface TorneosPublicosProps {
  userId: string;
  nombreEquipo: string;
  categoria: string;
  onSolicitudEnviada: (torneoId: string, organizadorId: string) => void;
}

const TorneosPublicos: React.FC<TorneosPublicosProps> = ({ 
  userId, 
  nombreEquipo, 
  categoria, 
  onSolicitudEnviada 
}) => {
  const [torneosPublicos, setTorneosPublicos] = useState<Torneo[]>(() => {
    const saved = localStorage.getItem('torneosPublicos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<Torneo | null>(null);
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const torneosDisponibles = torneosPublicos.filter(torneo => 
    torneo.esPublico && 
    torneo.estado === 'inscripciones_abiertas' &&
    torneo.equiposInscritos < torneo.maxEquipos
  );

  const handleVerDetalles = (torneo: Torneo) => {
    setTorneoSeleccionado(torneo);
  };

  const handleSolicitarInscripcion = (torneo: Torneo) => {
    setTorneoSeleccionado(torneo);
    setMostrarSolicitud(true);
    setMensaje(`Hola, somos ${nombreEquipo} y nos gustaría participar en ${torneo.nombre}. Cumplimos con todos los requisitos del torneo.`);
  };

  const enviarSolicitud = () => {
    if (!torneoSeleccionado) return;

    // Crear notificación para el organizador
    const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    const nuevaNotificacion = {
      id: `NOT-${Date.now()}`,
      tipo: 'inscripcion',
      titulo: 'Nueva solicitud de inscripción',
      mensaje: `El equipo '${nombreEquipo}' ha solicitado inscribirse a ${torneoSeleccionado.nombre}`,
      fecha: new Date().toISOString().split('T')[0],
      equipoSolicitante: nombreEquipo,
      equipoId: userId,
      torneoId: torneoSeleccionado.id,
      organizadorId: torneoSeleccionado.organizadorId,
      accionRequerida: true,
      mensajeEquipo: mensaje
    };

    notificaciones.push(nuevaNotificacion);
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));

    onSolicitudEnviada(torneoSeleccionado.id, torneoSeleccionado.organizadorId);
    toast.success('Solicitud enviada exitosamente');
    setMostrarSolicitud(false);
    setTorneoSeleccionado(null);
    setMensaje('');
  };

  if (torneosDisponibles.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay torneos públicos disponibles</h3>
          <p className="text-muted-foreground">
            Los torneos aparecerán aquí cuando los organizadores abran inscripciones públicas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {torneosDisponibles.map((torneo) => (
          <Card key={torneo.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src={torneo.logo} 
                  alt={torneo.nombre}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg">{torneo.nombre}</CardTitle>
                  <p className="text-sm text-muted-foreground">{torneo.organizadorNombre}</p>
                </div>
              </div>
              <Badge variant="secondary">{torneo.categoria}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{torneo.equiposInscritos}/{torneo.maxEquipos} equipos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{torneo.fechaInicio || 'Fecha por definir'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>{torneo.formato}</span>
                </div>
                {torneo.edadMinima && torneo.edadMaxima && (
                  <div className="text-xs text-muted-foreground">
                    Edad: {torneo.edadMinima}-{torneo.edadMaxima} años
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleVerDetalles(torneo)}
                  className="flex-1"
                >
                  Ver Detalles
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleSolicitarInscripcion(torneo)}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Inscribirse
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de detalles */}
      <Dialog open={!!torneoSeleccionado && !mostrarSolicitud} onOpenChange={() => setTorneoSeleccionado(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Torneo</DialogTitle>
          </DialogHeader>
          {torneoSeleccionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src={torneoSeleccionado.logo} 
                  alt={torneoSeleccionado.nombre}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold">{torneoSeleccionado.nombre}</h3>
                  <p className="text-muted-foreground">Organizado por: {torneoSeleccionado.organizadorNombre}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Categoría</Label>
                  <p>{torneoSeleccionado.categoria}</p>
                </div>
                <div>
                  <Label className="font-semibold">Formato</Label>
                  <p>{torneoSeleccionado.formato}</p>
                </div>
                <div>
                  <Label className="font-semibold">Equipos</Label>
                  <p>{torneoSeleccionado.equiposInscritos}/{torneoSeleccionado.maxEquipos}</p>
                </div>
                <div>
                  <Label className="font-semibold">Tipo</Label>
                  <p>{torneoSeleccionado.tipo}</p>
                </div>
              </div>

              {(torneoSeleccionado.edadMinima || torneoSeleccionado.edadMaxima) && (
                <div>
                  <Label className="font-semibold">Restricciones de Edad</Label>
                  <p>
                    {torneoSeleccionado.edadMinima && torneoSeleccionado.edadMaxima 
                      ? `${torneoSeleccionado.edadMinima} - ${torneoSeleccionado.edadMaxima} años`
                      : torneoSeleccionado.edadMinima 
                      ? `Mínimo ${torneoSeleccionado.edadMinima} años`
                      : `Máximo ${torneoSeleccionado.edadMaxima} años`
                    }
                  </p>
                </div>
              )}

              {torneoSeleccionado.descripcion && (
                <div>
                  <Label className="font-semibold">Descripción</Label>
                  <p>{torneoSeleccionado.descripcion}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setTorneoSeleccionado(null)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
                <Button 
                  onClick={() => handleSolicitarInscripcion(torneoSeleccionado)}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Solicitar Inscripción
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de solicitud */}
      <Dialog open={mostrarSolicitud} onOpenChange={setMostrarSolicitud}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Inscripción</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Torneo</Label>
              <p className="font-semibold">{torneoSeleccionado?.nombre}</p>
            </div>
            <div>
              <Label>Equipo</Label>
              <p className="font-semibold">{nombreEquipo}</p>
            </div>
            <div>
              <Label htmlFor="mensaje">Mensaje para el organizador</Label>
              <Textarea
                id="mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe un mensaje para el organizador..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setMostrarSolicitud(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={enviarSolicitud}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Solicitud
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TorneosPublicos;
