
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Crown } from "lucide-react";

interface EquipoInscrito {
  id: string;
  nombre: string;
  logo: string;
  categoria: string;
  fechaInscripcion: string;
  grupo?: string;
  jugadores?: any[];
  staff?: any[];
}

interface DetalleEquipoModalProps {
  equipo: EquipoInscrito | null;
  open: boolean;
  onClose: () => void;
}

const DetalleEquipoModal: React.FC<DetalleEquipoModalProps> = ({ 
  equipo, 
  open, 
  onClose 
}) => {
  if (!equipo) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img 
              src={equipo.logo} 
              alt={equipo.nombre}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-xl font-bold">{equipo.nombre}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{equipo.categoria}</Badge>
                {equipo.grupo && <Badge variant="secondary">{equipo.grupo}</Badge>}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Inscripción</p>
                  <p className="font-medium">
                    {new Date(equipo.fechaInscripcion).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Jugadores</p>
                  <p className="font-medium">{equipo.jugadores?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jugadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Jugadores ({equipo.jugadores?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!equipo.jugadores || equipo.jugadores.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No hay jugadores registrados
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {equipo.jugadores.map((jugador, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {jugador.numero || index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {jugador.nombre || `Jugador ${index + 1}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {jugador.posicion || 'Jugador'}
                        </p>
                      </div>
                      {jugador.capitan && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff */}
          {equipo.staff && equipo.staff.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Cuerpo Técnico ({equipo.staff.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {equipo.staff.map((miembro, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {miembro.nombre || `Staff ${index + 1}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {miembro.rol || 'Cuerpo Técnico'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetalleEquipoModal;
