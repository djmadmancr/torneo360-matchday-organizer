
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Jugador {
  id: string;
  nombre: string;
  posicion: string;
  numeroIdentificacion: string;
  edad: number;
}

interface Coach {
  nombre: string;
  tipo: "entrenador" | "asistente";
  numeroIdentificacion: string;
}

interface TorneoPublico {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  formato: string;
  fechaInicio: string;
  fechaFin: string;
  fechaCierre: string;
  logo: string;
  maxEquipos: number;
  equiposInscritos: number;
  estado: string;
  organizadorNombre: string;
  organizadorId: string;
  esPublico: boolean;
  edadMinima?: number;
  edadMaxima?: number;
  descripcion?: string;
  ubicacion?: string;
}

interface SeleccionJugadoresModalProps {
  open: boolean;
  onClose: () => void;
  torneo: TorneoPublico | null;
  jugadores: Jugador[];
  coaches: Coach[];
  onConfirmarInscripcion: (jugadoresSeleccionados: Jugador[], staffSeleccionado: Coach[]) => void;
}

const SeleccionJugadoresModal: React.FC<SeleccionJugadoresModalProps> = ({
  open,
  onClose,
  torneo,
  jugadores,
  coaches,
  onConfirmarInscripcion
}) => {
  const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState<string[]>([]);
  const [staffSeleccionado, setStaffSeleccionado] = useState<string[]>([]);

  const handleJugadorChange = (jugadorId: string, checked: boolean) => {
    if (checked) {
      setJugadoresSeleccionados([...jugadoresSeleccionados, jugadorId]);
    } else {
      setJugadoresSeleccionados(jugadoresSeleccionados.filter(id => id !== jugadorId));
    }
  };

  const handleStaffChange = (staffIndex: number, checked: boolean) => {
    const staffId = staffIndex.toString();
    if (checked) {
      const coach = coaches[staffIndex];
      const entrenadores = staffSeleccionado.filter(id => coaches[parseInt(id)]?.tipo === 'entrenador');
      const asistentes = staffSeleccionado.filter(id => coaches[parseInt(id)]?.tipo === 'asistente');

      if (coach.tipo === 'entrenador' && entrenadores.length >= 2) {
        toast.error('Máximo 2 entrenadores permitidos');
        return;
      }
      if (coach.tipo === 'asistente' && asistentes.length >= 2) {
        toast.error('Máximo 2 asistentes permitidos');
        return;
      }

      setStaffSeleccionado([...staffSeleccionado, staffId]);
    } else {
      setStaffSeleccionado(staffSeleccionado.filter(id => id !== staffId));
    }
  };

  const handleConfirmar = () => {
    if (jugadoresSeleccionados.length === 0) {
      toast.error('Debes seleccionar al menos un jugador');
      return;
    }

    if (staffSeleccionado.length === 0) {
      toast.error('Debes seleccionar al menos un miembro del staff');
      return;
    }

    const jugadoresParaInscripcion = jugadores.filter(j => jugadoresSeleccionados.includes(j.id));
    const staffParaInscripcion = coaches.filter((_, index) => staffSeleccionado.includes(index.toString()));

    onConfirmarInscripcion(jugadoresParaInscripcion, staffParaInscripcion);
    
    // Limpiar selecciones
    setJugadoresSeleccionados([]);
    setStaffSeleccionado([]);
    onClose();
  };

  const jugadoresElegibles = torneo ? jugadores.filter(jugador => {
    if (torneo.edadMinima && jugador.edad < torneo.edadMinima) return false;
    if (torneo.edadMaxima && jugador.edad > torneo.edadMaxima) return false;
    return true;
  }) : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seleccionar Jugadores y Staff - {torneo?.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Jugadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Jugadores Disponibles</span>
                <Badge variant="outline">
                  {jugadoresSeleccionados.length} seleccionados
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jugadoresElegibles.length === 0 ? (
                <p className="text-muted-foreground">No hay jugadores elegibles para este torneo</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {jugadoresElegibles.map((jugador) => (
                    <div key={jugador.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={jugadoresSeleccionados.includes(jugador.id)}
                        onCheckedChange={(checked) => handleJugadorChange(jugador.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{jugador.nombre}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{jugador.posicion}</Badge>
                          <span>{jugador.edad} años</span>
                          <span>ID: {jugador.numeroIdentificacion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Staff Técnico</span>
                <Badge variant="outline">
                  {staffSeleccionado.length} seleccionados
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {coaches.length === 0 ? (
                <p className="text-muted-foreground">No hay staff técnico disponible</p>
              ) : (
                <div className="space-y-3">
                  {coaches.map((coach, index) => {
                    const entrenadores = staffSeleccionado.filter(id => coaches[parseInt(id)]?.tipo === 'entrenador');
                    const asistentes = staffSeleccionado.filter(id => coaches[parseInt(id)]?.tipo === 'asistente');
                    const maxReached = (coach.tipo === 'entrenador' && entrenadores.length >= 2) || 
                                     (coach.tipo === 'asistente' && asistentes.length >= 2);
                    
                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={staffSeleccionado.includes(index.toString())}
                          onCheckedChange={(checked) => handleStaffChange(index, checked as boolean)}
                          disabled={maxReached && !staffSeleccionado.includes(index.toString())}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{coach.nombre}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={coach.tipo === 'entrenador' ? 'default' : 'secondary'}>
                              {coach.tipo}
                            </Badge>
                            <span>ID: {coach.numeroIdentificacion}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 text-sm text-muted-foreground">
                <p>• Máximo 2 entrenadores y 2 asistentes por equipo</p>
                {torneo?.edadMinima || torneo?.edadMaxima ? (
                  <p>• Rango de edad: {torneo?.edadMinima || 0} - {torneo?.edadMaxima || 99} años</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmar} 
              className="flex-1"
              disabled={jugadoresSeleccionados.length === 0 || staffSeleccionado.length === 0}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Confirmar Inscripción
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeleccionJugadoresModal;
