
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

interface TorneoFormData {
  torneoId: string;
  nombreTorneo: string;
  categoria: string;
  tipoFutbol: string;
  formato: string;
  fechaCierre: string;
  maxEquipos: number;
  puntajeGane: number;
  puntajeEmpate: number;
  puntajeExtraPenales: boolean;
  puntajeExtra: number;
  idaVuelta: {
    grupos: boolean;
    eliminatoria: boolean;
  };
  diasSemana: string[];
  partidosPorSemana: string;
  logo?: string;
  esPublico: boolean;
  edadMinima?: number;
  edadMaxima?: number;
  descripcion?: string;
  ubicacion?: string;
}

interface TorneoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TorneoFormData) => void;
  torneoId: string;
  torneoEditando?: any;
}

const TorneoFormModal: React.FC<TorneoFormModalProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  torneoId,
  torneoEditando 
}) => {
  const [formData, setFormData] = useState<TorneoFormData>({
    torneoId,
    nombreTorneo: '',
    categoria: '',
    tipoFutbol: '',
    formato: '',
    fechaCierre: '',
    maxEquipos: 16,
    puntajeGane: 3,
    puntajeEmpate: 1,
    puntajeExtraPenales: false,
    puntajeExtra: 1,
    idaVuelta: {
      grupos: false,
      eliminatoria: false
    },
    diasSemana: [],
    partidosPorSemana: '',
    logo: '',
    esPublico: false,
    edadMinima: undefined,
    edadMaxima: undefined,
    descripcion: '',
    ubicacion: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Solo inicializar cuando se abre el modal por primera vez
  useEffect(() => {
    if (open && !isInitialized) {
      console.log('Inicializando formulario:', { torneoEditando, torneoId });
      
      if (torneoEditando) {
        const editData = {
          torneoId: torneoEditando.id || torneoId,
          nombreTorneo: torneoEditando.nombre || '',
          categoria: torneoEditando.categoria || '',
          tipoFutbol: torneoEditando.tipo || '',
          formato: torneoEditando.formato || '',
          fechaCierre: torneoEditando.fechaCierre || '',
          maxEquipos: torneoEditando.maxEquipos || 16,
          puntajeGane: torneoEditando.puntajeGane || 3,
          puntajeEmpate: torneoEditando.puntajeEmpate || 1,
          puntajeExtraPenales: torneoEditando.puntajeExtraPenales || false,
          puntajeExtra: torneoEditando.puntajeExtra || 1,
          idaVuelta: torneoEditando.idaVuelta || {
            grupos: false,
            eliminatoria: false
          },
          diasSemana: torneoEditando.diasSemana || [],
          partidosPorSemana: torneoEditando.partidosPorSemana || '',
          logo: torneoEditando.logo || '',
          esPublico: torneoEditando.esPublico || false,
          edadMinima: torneoEditando.edadMinima,
          edadMaxima: torneoEditando.edadMaxima,
          descripcion: torneoEditando.descripcion || '',
          ubicacion: torneoEditando.ubicacion || ''
        };
        setFormData(editData);
        if (torneoEditando.logo) {
          setLogoPreview(torneoEditando.logo);
        }
      } else {
        // Resetear formulario para nuevo torneo
        setFormData({
          torneoId,
          nombreTorneo: '',
          categoria: '',
          tipoFutbol: '',
          formato: '',
          fechaCierre: '',
          maxEquipos: 16,
          puntajeGane: 3,
          puntajeEmpate: 1,
          puntajeExtraPenales: false,
          puntajeExtra: 1,
          idaVuelta: {
            grupos: false,
            eliminatoria: false
          },
          diasSemana: [],
          partidosPorSemana: '',
          logo: '',
          esPublico: false,
          edadMinima: undefined,
          edadMaxima: undefined,
          descripcion: '',
          ubicacion: ''
        });
        setLogoFile(null);
        setLogoPreview('');
      }
      setIsInitialized(true);
    }
  }, [open, torneoEditando?.id, torneoId, isInitialized]);

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
    }
  }, [open]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiasSemanaChange = (dia: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      diasSemana: checked 
        ? [...prev.diasSemana, dia]
        : prev.diasSemana.filter(d => d !== dia)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enviando formulario:', formData);
    onSubmit(formData);
    onClose();
  };

  const handleClose = () => {
    setIsInitialized(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {torneoEditando ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombreTorneo">Nombre del Torneo *</Label>
              <Input
                id="nombreTorneo"
                value={formData.nombreTorneo}
                onChange={(e) => setFormData(prev => ({ ...prev, nombreTorneo: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoFutbol">Tipo de Fútbol *</Label>
              <Select value={formData.tipoFutbol} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoFutbol: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fútbol 5">Fútbol 5</SelectItem>
                  <SelectItem value="Fútbol 7">Fútbol 7</SelectItem>
                  <SelectItem value="Fútbol 9">Fútbol 9</SelectItem>
                  <SelectItem value="Fútbol 11">Fútbol 11</SelectItem>
                  <SelectItem value="Futsal">Futsal</SelectItem>
                  <SelectItem value="Fútbol Playa">Fútbol Playa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formato">Formato *</Label>
              <Select value={formData.formato} onValueChange={(value) => setFormData(prev => ({ ...prev, formato: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos contra Todos">Todos contra Todos</SelectItem>
                  <SelectItem value="Eliminatorio Directo">Eliminatorio Directo</SelectItem>
                  <SelectItem value="Grupos + Eliminatorio">Grupos + Eliminatorio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edadMinima">Edad Mínima</Label>
              <Input
                id="edadMinima"
                type="number"
                value={formData.edadMinima || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, edadMinima: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Ej: 16"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edadMaxima">Edad Máxima</Label>
              <Input
                id="edadMaxima"
                type="number"
                value={formData.edadMaxima || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, edadMaxima: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Ej: 35"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Sistema de Puntajes</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="puntajeGane">Puntos por Victoria</Label>
                <Input
                  id="puntajeGane"
                  type="number"
                  value={formData.puntajeGane}
                  onChange={(e) => setFormData(prev => ({ ...prev, puntajeGane: parseInt(e.target.value) || 3 }))}
                  min="0"
                  max="10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="puntajeEmpate">Puntos por Empate</Label>
                <Input
                  id="puntajeEmpate"
                  type="number"
                  value={formData.puntajeEmpate}
                  onChange={(e) => setFormData(prev => ({ ...prev, puntajeEmpate: parseInt(e.target.value) || 1 }))}
                  min="0"
                  max="10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="puntajeExtraPenales"
                checked={formData.puntajeExtraPenales}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, puntajeExtraPenales: !!checked }))}
              />
              <Label htmlFor="puntajeExtraPenales">Puntaje extra por rondas de penales</Label>
            </div>

            {formData.puntajeExtraPenales && (
              <div className="space-y-2">
                <Label htmlFor="puntajeExtra">Puntos Extra por Penales</Label>
                <Input
                  id="puntajeExtra"
                  type="number"
                  value={formData.puntajeExtra}
                  onChange={(e) => setFormData(prev => ({ ...prev, puntajeExtra: parseInt(e.target.value) || 1 }))}
                  min="0"
                  max="5"
                />
                <p className="text-xs text-muted-foreground">
                  Puntos adicionales para el ganador de penales (independiente del resultado del partido)
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe el torneo..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
              placeholder="Ej: Estadio Municipal, Ciudad"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="esPublico"
              checked={formData.esPublico}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, esPublico: !!checked }))}
            />
            <Label htmlFor="esPublico">Torneo Público (visible para todos los equipos)</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaCierre">Fecha Cierre Inscripciones *</Label>
            <Input
              id="fechaCierre"
              type="date"
              value={formData.fechaCierre}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaCierre: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Logo del Torneo</Label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <img 
                  src={logoPreview} 
                  alt="Vista previa"
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <Button type="button" variant="outline" asChild>
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Logo
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxEquipos">Máximo de Equipos</Label>
            <Input
              id="maxEquipos"
              type="number"
              value={formData.maxEquipos}
              onChange={(e) => setFormData(prev => ({ ...prev, maxEquipos: parseInt(e.target.value) || 16 }))}
              min="4"
              max="64"
            />
          </div>

          <div className="space-y-2">
            <Label>Días de la Semana</Label>
            <div className="grid grid-cols-4 gap-2">
              {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map(dia => (
                <div key={dia} className="flex items-center space-x-2">
                  <Checkbox
                    id={dia}
                    checked={formData.diasSemana.includes(dia)}
                    onCheckedChange={(checked) => handleDiasSemanaChange(dia, !!checked)}
                  />
                  <Label htmlFor={dia} className="text-sm capitalize">{dia}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {torneoEditando ? 'Actualizar' : 'Crear'} Torneo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TorneoFormModal;
