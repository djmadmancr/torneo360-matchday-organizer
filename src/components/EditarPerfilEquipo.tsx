import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Upload } from "lucide-react";
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

interface PerfilEquipo {
  nombreEquipo: string;
  logo: string;
  colores: {
    principal: string;
    secundario: string;
  };
  categoria: string;
  entrenador: string;
  jugadores: Jugador[];
  coaches: Coach[];
  torneos: string[];
  pais?: string;
}

interface EditarPerfilEquipoProps {
  open: boolean;
  onClose: () => void;
  perfil: PerfilEquipo;
  setPerfil: (perfil: PerfilEquipo) => void;
  guardarPerfil: () => void;
}

const EditarPerfilEquipo: React.FC<EditarPerfilEquipoProps> = ({
  open,
  onClose,
  perfil,
  setPerfil,
  guardarPerfil
}) => {
  const [nuevoJugador, setNuevoJugador] = useState({
    nombre: '',
    posicion: '',
    numeroIdentificacion: '',
    edad: 18
  });

  const [nuevoCoach, setNuevoCoach] = useState({
    nombre: '',
    tipo: 'entrenador' as "entrenador" | "asistente",
    numeroIdentificacion: ''
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPerfil({ ...perfil, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const agregarJugador = () => {
    if (!nuevoJugador.nombre || !nuevoJugador.posicion || !nuevoJugador.numeroIdentificacion) {
      toast.error('Todos los campos del jugador son requeridos');
      return;
    }

    const jugador: Jugador = {
      id: `J${Date.now()}`,
      ...nuevoJugador
    };

    setPerfil({
      ...perfil,
      jugadores: [...perfil.jugadores, jugador]
    });

    setNuevoJugador({
      nombre: '',
      posicion: '',
      numeroIdentificacion: '',
      edad: 18
    });

    toast.success('Jugador agregado exitosamente');
  };

  const eliminarJugador = (id: string) => {
    setPerfil({
      ...perfil,
      jugadores: perfil.jugadores.filter(j => j.id !== id)
    });
    toast.success('Jugador eliminado');
  };

  const agregarCoach = () => {
    if (!nuevoCoach.nombre || !nuevoCoach.numeroIdentificacion) {
      toast.error('Todos los campos del staff técnico son requeridos');
      return;
    }

    setPerfil({
      ...perfil,
      coaches: [...perfil.coaches, nuevoCoach]
    });

    setNuevoCoach({
      nombre: '',
      tipo: 'entrenador' as "entrenador" | "asistente",
      numeroIdentificacion: ''
    });

    toast.success('Staff técnico agregado exitosamente');
  };

  const eliminarCoach = (index: number) => {
    const newCoaches = [...perfil.coaches];
    newCoaches.splice(index, 1);
    setPerfil({
      ...perfil,
      coaches: newCoaches
    });
    toast.success('Staff técnico eliminado');
  };

  const handleGuardar = () => {
    guardarPerfil();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil del Equipo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombreEquipo">Nombre del Equipo</Label>
              <Input
                id="nombreEquipo"
                value={perfil.nombreEquipo}
                onChange={(e) => setPerfil({ ...perfil, nombreEquipo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select 
                value={perfil.categoria} 
                onValueChange={(value) => setPerfil({ ...perfil, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sub-13">Sub-13</SelectItem>
                  <SelectItem value="Sub-15">Sub-15</SelectItem>
                  <SelectItem value="Sub-17">Sub-17</SelectItem>
                  <SelectItem value="Sub-20">Sub-20</SelectItem>
                  <SelectItem value="Libre">Libre</SelectItem>
                  <SelectItem value="Profesional">Profesional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* País del Equipo */}
          <div className="space-y-2">
            <Label htmlFor="pais">País del Equipo</Label>
            <Select 
              value={perfil.pais || ''} 
              onValueChange={(value) => setPerfil({ ...perfil, pais: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el país" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="Argentina">Argentina</SelectItem>
                <SelectItem value="Bolivia">Bolivia</SelectItem>
                <SelectItem value="Brasil">Brasil</SelectItem>
                <SelectItem value="Chile">Chile</SelectItem>
                <SelectItem value="Colombia">Colombia</SelectItem>
                <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                <SelectItem value="Ecuador">Ecuador</SelectItem>
                <SelectItem value="El Salvador">El Salvador</SelectItem>
                <SelectItem value="España">España</SelectItem>
                <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                <SelectItem value="Guatemala">Guatemala</SelectItem>
                <SelectItem value="Honduras">Honduras</SelectItem>
                <SelectItem value="México">México</SelectItem>
                <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                <SelectItem value="Panamá">Panamá</SelectItem>
                <SelectItem value="Paraguay">Paraguay</SelectItem>
                <SelectItem value="Perú">Perú</SelectItem>
                <SelectItem value="República Dominicana">República Dominicana</SelectItem>
                <SelectItem value="Uruguay">Uruguay</SelectItem>
                <SelectItem value="Venezuela">Venezuela</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo del Equipo</Label>
            <div className="flex items-center gap-4">
              <img 
                src={perfil.logo} 
                alt="Logo"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Cambiar Logo
                </Button>
              </div>
            </div>
          </div>

          {/* Colores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="colorPrincipal">Color Principal</Label>
              <Input
                id="colorPrincipal"
                type="color"
                value={perfil.colores.principal}
                onChange={(e) => setPerfil({
                  ...perfil,
                  colores: { ...perfil.colores, principal: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="colorSecundario">Color Secundario</Label>
              <Input
                id="colorSecundario"
                type="color"
                value={perfil.colores.secundario}
                onChange={(e) => setPerfil({
                  ...perfil,
                  colores: { ...perfil.colores, secundario: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Staff Técnico */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Staff Técnico</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="Nombre"
                value={nuevoCoach.nombre}
                onChange={(e) => setNuevoCoach({ ...nuevoCoach, nombre: e.target.value })}
              />
              <Select 
                value={nuevoCoach.tipo} 
                onValueChange={(value: "entrenador" | "asistente") => 
                  setNuevoCoach({ ...nuevoCoach, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrenador">Entrenador</SelectItem>
                  <SelectItem value="asistente">Asistente</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Identificación"
                value={nuevoCoach.numeroIdentificacion}
                onChange={(e) => setNuevoCoach({ ...nuevoCoach, numeroIdentificacion: e.target.value })}
              />
              <Button onClick={agregarCoach}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>

            <div className="space-y-2">
              {perfil.coaches.map((coach, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{coach.nombre}</span>
                    <Badge variant="outline" className="ml-2">{coach.tipo}</Badge>
                    <span className="text-sm text-muted-foreground ml-2">ID: {coach.numeroIdentificacion}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => eliminarCoach(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Jugadores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Jugadores</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <Input
                placeholder="Nombre"
                value={nuevoJugador.nombre}
                onChange={(e) => setNuevoJugador({ ...nuevoJugador, nombre: e.target.value })}
              />
              <Input
                placeholder="Posición"
                value={nuevoJugador.posicion}
                onChange={(e) => setNuevoJugador({ ...nuevoJugador, posicion: e.target.value })}
              />
              <Input
                placeholder="Identificación"
                value={nuevoJugador.numeroIdentificacion}
                onChange={(e) => setNuevoJugador({ ...nuevoJugador, numeroIdentificacion: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Edad"
                value={nuevoJugador.edad}
                onChange={(e) => setNuevoJugador({ ...nuevoJugador, edad: parseInt(e.target.value) || 18 })}
              />
              <Button onClick={agregarJugador}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {perfil.jugadores.map((jugador) => (
                <div key={jugador.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{jugador.nombre}</span>
                    <Badge variant="outline">{jugador.posicion}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {jugador.edad} años - ID: {jugador.numeroIdentificacion}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => eliminarJugador(jugador.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="button" onClick={handleGuardar} className="flex-1">
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditarPerfilEquipo;
