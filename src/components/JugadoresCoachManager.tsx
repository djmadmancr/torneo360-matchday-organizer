
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Jugador {
  id: string;
  nombre: string;
  posicion: string;
  numero: number;
  edad: number;
}

interface Coach {
  nombre: string;
  tipo: "entrenador" | "asistente";
  experiencia: string;
}

interface JugadoresCoachManagerProps {
  jugadores: Jugador[];
  coaches: Coach[];
  onJugadoresChange: (jugadores: Jugador[]) => void;
  onCoachesChange: (coaches: Coach[]) => void;
}

const JugadoresCoachManager = ({ jugadores, coaches, onJugadoresChange, onCoachesChange }: JugadoresCoachManagerProps) => {
  const [nuevoJugador, setNuevoJugador] = useState<Omit<Jugador, 'id'>>({
    nombre: '',
    posicion: '',
    numero: 0,
    edad: 0
  });

  const [nuevoCoach, setNuevoCoach] = useState<Coach>({
    nombre: '',
    tipo: 'entrenador',
    experiencia: ''
  });

  const agregarJugador = () => {
    if (!nuevoJugador.nombre || !nuevoJugador.posicion || nuevoJugador.numero <= 0) {
      toast.error("Por favor completa todos los campos del jugador");
      return;
    }

    const jugadorConId: Jugador = {
      ...nuevoJugador,
      id: `JUG-${Date.now()}`
    };

    onJugadoresChange([...jugadores, jugadorConId]);
    setNuevoJugador({ nombre: '', posicion: '', numero: 0, edad: 0 });
    toast.success("Jugador agregado exitosamente");
  };

  const eliminarJugador = (id: string) => {
    onJugadoresChange(jugadores.filter(j => j.id !== id));
    toast.success("Jugador eliminado");
  };

  const agregarCoach = () => {
    if (!nuevoCoach.nombre || !nuevoCoach.experiencia) {
      toast.error("Por favor completa todos los campos del coach");
      return;
    }

    onCoachesChange([...coaches, nuevoCoach]);
    setNuevoCoach({ nombre: '', tipo: 'entrenador', experiencia: '' });
    toast.success("Coach agregado exitosamente");
  };

  const eliminarCoach = (index: number) => {
    const nuevosCoaches = coaches.filter((_, i) => i !== index);
    onCoachesChange(nuevosCoaches);
    toast.success("Coach eliminado");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Gestión de Jugadores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={nuevoJugador.nombre}
                onChange={(e) => setNuevoJugador({...nuevoJugador, nombre: e.target.value})}
                placeholder="Nombre del jugador"
              />
            </div>
            <div>
              <Label>Posición</Label>
              <Input
                value={nuevoJugador.posicion}
                onChange={(e) => setNuevoJugador({...nuevoJugador, posicion: e.target.value})}
                placeholder="Posición"
              />
            </div>
            <div>
              <Label>Número</Label>
              <Input
                type="number"
                value={nuevoJugador.numero || ''}
                onChange={(e) => setNuevoJugador({...nuevoJugador, numero: parseInt(e.target.value) || 0})}
                placeholder="Número"
              />
            </div>
            <div>
              <Label>Edad</Label>
              <Input
                type="number"
                value={nuevoJugador.edad || ''}
                onChange={(e) => setNuevoJugador({...nuevoJugador, edad: parseInt(e.target.value) || 0})}
                placeholder="Edad"
              />
            </div>
          </div>
          <Button onClick={agregarJugador} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Jugador
          </Button>

          <div className="space-y-2">
            <h4 className="font-medium">Jugadores ({jugadores.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {jugadores.map((jugador) => (
                <div key={jugador.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{jugador.numero}</Badge>
                    <span className="font-medium">{jugador.nombre}</span>
                    <span className="text-sm text-muted-foreground">{jugador.posicion}</span>
                    <span className="text-xs text-muted-foreground">{jugador.edad} años</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarJugador(jugador.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Gestión de Cuerpo Técnico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={nuevoCoach.nombre}
                onChange={(e) => setNuevoCoach({...nuevoCoach, nombre: e.target.value})}
                placeholder="Nombre del coach"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <select
                className="w-full p-2 border rounded"
                value={nuevoCoach.tipo}
                onChange={(e) => setNuevoCoach({...nuevoCoach, tipo: e.target.value as 'entrenador' | 'asistente'})}
              >
                <option value="entrenador">Entrenador</option>
                <option value="asistente">Asistente</option>
              </select>
            </div>
            <div>
              <Label>Experiencia</Label>
              <Input
                value={nuevoCoach.experiencia}
                onChange={(e) => setNuevoCoach({...nuevoCoach, experiencia: e.target.value})}
                placeholder="Años de experiencia"
              />
            </div>
          </div>
          <Button onClick={agregarCoach} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Coach
          </Button>

          <div className="space-y-2">
            <h4 className="font-medium">Cuerpo Técnico ({coaches.length})</h4>
            <div className="space-y-2">
              {coaches.map((coach, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant={coach.tipo === 'entrenador' ? 'default' : 'secondary'}>
                      {coach.tipo}
                    </Badge>
                    <span className="font-medium">{coach.nombre}</span>
                    <span className="text-sm text-muted-foreground">{coach.experiencia}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarCoach(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JugadoresCoachManager;
