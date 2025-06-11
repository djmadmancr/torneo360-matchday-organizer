import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Torneo {
  id: string;
  nombre: string;
  tipo: string;
  formato: string;
  categoria: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  equiposInscritos: number;
  maxEquipos: number;
  logo: string;
  edadMinima?: string;
  edadMaxima?: string;
  maxJugadores?: string;
  fechaCierre?: string;
  numeroGrupos?: string;
  idaVuelta?: {
    grupos: boolean;
    eliminatoria: boolean;
  };
  puntajeExtra?: string;
  torneoPublico?: boolean;
  reglamento?: string;
  diasSemana?: string[];
  partidosPorSemana?: string;
  mejorPerdedor?: boolean;
}

interface TorneoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  torneoId: string;
  torneoEditando?: Torneo | null;
}

const TorneoFormModal: React.FC<TorneoFormModalProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  torneoId, 
  torneoEditando 
}) => {
  const [formData, setFormData] = useState({
    nombreTorneo: "",
    tipoFutbol: "",
    formato: "",
    categoria: "",
    edadMinima: "",
    edadMaxima: "",
    maxJugadores: "",
    fechaCierre: "",
    numeroGrupos: "1",
    idaVuelta: {
      grupos: false,
      eliminatoria: false
    },
    puntajeExtra: "NA",
    torneoPublico: true,
    reglamento: "",
    reglamentoPDF: null as File | null,
    diasSemana: [] as string[],
    partidosPorSemana: "1",
    mejorPerdedor: false
  });

  // Load existing tournament data when editing
  useEffect(() => {
    if (torneoEditando) {
      setFormData({
        nombreTorneo: torneoEditando.nombre || "",
        tipoFutbol: torneoEditando.tipo || "",
        formato: torneoEditando.formato || "",
        categoria: torneoEditando.categoria || "",
        edadMinima: torneoEditando.edadMinima || "",
        edadMaxima: torneoEditando.edadMaxima || "",
        maxJugadores: torneoEditando.maxJugadores || "",
        fechaCierre: torneoEditando.fechaCierre || "",
        numeroGrupos: torneoEditando.numeroGrupos || "1",
        idaVuelta: torneoEditando.idaVuelta || { grupos: false, eliminatoria: false },
        puntajeExtra: torneoEditando.puntajeExtra || "NA",
        torneoPublico: torneoEditando.torneoPublico !== undefined ? torneoEditando.torneoPublico : true,
        reglamento: torneoEditando.reglamento || "",
        reglamentoPDF: null,
        diasSemana: torneoEditando.diasSemana || [],
        partidosPorSemana: torneoEditando.partidosPorSemana || "1",
        mejorPerdedor: torneoEditando.mejorPerdedor || false
      });
    }
  }, [torneoEditando]);

  const diasSemanaOpciones = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombreTorneo || !formData.tipoFutbol || !formData.formato || !formData.categoria) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    if (formData.diasSemana.length === 0) {
      toast.error("Selecciona al menos un día de la semana para los partidos");
      return;
    }

    onSubmit({ ...formData, torneoId });
    onClose();
  };

  const toggleDiaSemana = (dia: string) => {
    setFormData(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia]
    }));
  };

  const handleReglamentoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, reglamentoPDF: file });
      toast.success("Reglamento PDF cargado");
    } else {
      toast.error("Por favor selecciona un archivo PDF válido");
    }
  };

  const resetForm = () => {
    setFormData({
      nombreTorneo: "",
      tipoFutbol: "",
      formato: "",
      categoria: "",
      edadMinima: "",
      edadMaxima: "",
      maxJugadores: "",
      fechaCierre: "",
      numeroGrupos: "1",
      idaVuelta: { grupos: false, eliminatoria: false },
      puntajeExtra: "NA",
      torneoPublico: true,
      reglamento: "",
      reglamentoPDF: null,
      diasSemana: [],
      partidosPorSemana: "1",
      mejorPerdedor: false
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            🏆 {torneoEditando ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
            <Button variant="ghost" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombreTorneo">Nombre del Torneo *</Label>
              <Input
                id="nombreTorneo"
                value={formData.nombreTorneo}
                onChange={(e) => setFormData({...formData, nombreTorneo: e.target.value})}
                placeholder="Ej: Copa Primavera 2024"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="torneoId">ID del Torneo</Label>
              <Input
                id="torneoId"
                value={torneoId}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Tipo de Fútbol *</Label>
              <Select 
                value={formData.tipoFutbol}
                onValueChange={(value) => setFormData({...formData, tipoFutbol: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="futbol5">Fútbol 5</SelectItem>
                  <SelectItem value="futbol7">Fútbol 7</SelectItem>
                  <SelectItem value="futbol9">Fútbol 9</SelectItem>
                  <SelectItem value="futbol11">Fútbol 11</SelectItem>
                  <SelectItem value="sala">Fútbol Sala</SelectItem>
                  <SelectItem value="playa">Fútbol Playa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Formato *</Label>
              <Select 
                value={formData.formato}
                onValueChange={(value) => setFormData({...formData, formato: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completo">Completo (Grupos + Eliminatoria)</SelectItem>
                  <SelectItem value="eliminatorio">Eliminatorio (Llaves de muerte súbita)</SelectItem>
                  <SelectItem value="relampago">Relámpago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select 
                value={formData.categoria}
                onValueChange={(value) => setFormData({...formData, categoria: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="U17">U17</SelectItem>
                  <SelectItem value="U20">U20</SelectItem>
                  <SelectItem value="U23">U23</SelectItem>
                  <SelectItem value="Libre">Libre</SelectItem>
                  <SelectItem value="Veteranos">Veteranos (+35)</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuraciones específicas por formato */}
          {formData.formato === "completo" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Número de Grupos *</Label>
                <Select 
                  value={formData.numeroGrupos}
                  onValueChange={(value) => setFormData({...formData, numeroGrupos: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Grupo (Tabla General)</SelectItem>
                    <SelectItem value="2">2 Grupos</SelectItem>
                    <SelectItem value="3">3 Grupos</SelectItem>
                    <SelectItem value="4">4 Grupos</SelectItem>
                    <SelectItem value="6">6 Grupos</SelectItem>
                    <SelectItem value="8">8 Grupos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Ida y Vuelta</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="idaVueltaGrupos"
                      checked={formData.idaVuelta.grupos}
                      onCheckedChange={(checked) => setFormData({
                        ...formData, 
                        idaVuelta: {...formData.idaVuelta, grupos: !!checked}
                      })}
                    />
                    <Label htmlFor="idaVueltaGrupos" className="text-sm">
                      Grupos - Cada equipo juega 2 veces contra cada rival
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="idaVueltaEliminatoria"
                      checked={formData.idaVuelta.eliminatoria}
                      onCheckedChange={(checked) => setFormData({
                        ...formData, 
                        idaVuelta: {...formData.idaVuelta, eliminatoria: !!checked}
                      })}
                    />
                    <Label htmlFor="idaVueltaEliminatoria" className="text-sm">
                      Eliminatoria - Partidos de ida y vuelta en playoffs
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mejorPerdedor"
                  checked={formData.mejorPerdedor}
                  onCheckedChange={(checked) => setFormData({...formData, mejorPerdedor: !!checked})}
                />
                <Label htmlFor="mejorPerdedor" className="text-sm">
                  Activar mejor perdedor o mejores perdedores
                </Label>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Puntaje Extra</Label>
            <Select 
              value={formData.puntajeExtra}
              onValueChange={(value) => setFormData({...formData, puntajeExtra: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NA">N/A</SelectItem>
                <SelectItem value="penales">Penales</SelectItem>
                <SelectItem value="shootouts">Rondas de Shoot Outs</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.formato !== "relampago" && (
            <div className="space-y-4">
              <Label>Programación de Partidos</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Días de la semana para partidos *</Label>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                    {diasSemanaOpciones.map((dia) => (
                      <div key={dia} className="flex items-center space-x-2">
                        <Checkbox
                          id={dia}
                          checked={formData.diasSemana.includes(dia)}
                          onCheckedChange={() => toggleDiaSemana(dia)}
                        />
                        <Label htmlFor={dia} className="text-sm">{dia}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Partidos por semana</Label>
                  <Select 
                    value={formData.partidosPorSemana}
                    onValueChange={(value) => setFormData({...formData, partidosPorSemana: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 partido</SelectItem>
                      <SelectItem value="2">2 partidos</SelectItem>
                      <SelectItem value="3">3 partidos</SelectItem>
                      <SelectItem value="4">4 partidos</SelectItem>
                      <SelectItem value="5">5 partidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {formData.formato === "relampago" && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Formato Relámpago:</strong> Todos los partidos se juegan en la misma cancha, sin opción de ida y vuelta. 
                Ideal para torneos de un día.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Fecha límite de inscripciones *</Label>
            <Input
              type="date"
              value={formData.fechaCierre}
              onChange={(e) => setFormData({...formData, fechaCierre: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Edad Mínima</Label>
              <Input
                type="number"
                value={formData.edadMinima}
                onChange={(e) => setFormData({...formData, edadMinima: e.target.value})}
                placeholder="16"
                min="5"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label>Edad Máxima</Label>
              <Input
                type="number"
                value={formData.edadMaxima}
                onChange={(e) => setFormData({...formData, edadMaxima: e.target.value})}
                placeholder="35"
                min="5"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label>Máx. Jugadores por Equipo</Label>
              <Input
                type="number"
                value={formData.maxJugadores}
                onChange={(e) => setFormData({...formData, maxJugadores: e.target.value})}
                placeholder="15"
                min="7"
                max="30"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Torneo público</Label>
              <p className="text-sm text-muted-foreground">Mostrar en la lista pública de torneos</p>
            </div>
            <Switch
              checked={formData.torneoPublico}
              onCheckedChange={(checked) => setFormData({...formData, torneoPublico: checked})}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reglamento General del Torneo</Label>
              <Textarea
                value={formData.reglamento}
                onChange={(e) => setFormData({...formData, reglamento: e.target.value})}
                placeholder="Describe las reglas generales del torneo, horarios, sanciones, etc."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Reglamento PDF (Opcional)</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleReglamentoUpload}
                  className="hidden"
                  id="reglamentoPDF"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('reglamentoPDF')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Subir PDF
                </Button>
                {formData.reglamentoPDF && (
                  <Badge variant="secondary">{formData.reglamentoPDF.name}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              🏆 {torneoEditando ? 'Actualizar Torneo' : 'Crear Torneo'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TorneoFormModal;
