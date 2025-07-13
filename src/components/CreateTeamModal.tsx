import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ColorSelector from '@/components/ColorSelector';
import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import { useTournaments } from '@/hooks/useTournaments';
import { toast } from 'sonner';

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '/lovable-uploads/42e8c109-4456-4ead-811c-acae29f37a54.png',
    colors: {
      principal: '#1e40af',
      secundario: '#3b82f6'
    },
    tournament_id: '',
  });

  const { createTeam, isCreating } = useSupabaseTeams();
  const { tournaments } = useTournaments();

  // Filter tournaments that are open for enrollment
  const availableTournaments = tournaments.filter(
    t => t.status === 'enrolling' || t.status === 'upcoming'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre del equipo es requerido');
      return;
    }

    try {
      await createTeam({
        name: formData.name.trim(),
        logo_url: formData.logo_url,
        colors: formData.colors,
        tournament_id: formData.tournament_id || undefined,
        team_data: {
          description: `Equipo ${formData.name}`,
          category: 'Primera División',
        }
      });

      // Reset form
      setFormData({
        name: '',
        logo_url: '/lovable-uploads/42e8c109-4456-4ead-811c-acae29f37a54.png',
        colors: {
          principal: '#1e40af',
          secundario: '#3b82f6'
        },
        tournament_id: '',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (type: 'principal' | 'secundario', color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [type]: color
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🏆 Crear Nuevo Equipo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Equipo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: FC Barcelona"
                required
              />
            </div>

            <div>
              <Label htmlFor="tournament">Torneo (Opcional)</Label>
              <Select 
                value={formData.tournament_id} 
                onValueChange={(value) => handleInputChange('tournament_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar torneo para inscribirse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin torneo específico</SelectItem>
                  {availableTournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      <div className="flex items-center gap-2">
                        <span>{tournament.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {tournament.status === 'enrolling' ? 'Inscripciones abiertas' : 'Próximamente'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Puedes inscribirte a torneos después de crear el equipo
              </p>
            </div>
          </div>

          {/* Team Colors */}
          <div className="space-y-4">
            <Label>Colores del Equipo</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Color Principal</Label>
                <ColorSelector
                  label="Principal"
                  value={formData.colors.principal}
                  onChange={(color) => handleColorChange('principal', color)}
                />
              </div>
              <div>
                <Label className="text-sm">Color Secundario</Label>
                <ColorSelector
                  label="Secundario"
                  value={formData.colors.secundario}
                  onChange={(color) => handleColorChange('secundario', color)}
                />
              </div>
            </div>
            
            {/* Color Preview */}
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div 
                className="w-8 h-8 rounded-full border-2"
                style={{ backgroundColor: formData.colors.principal }}
              />
              <div 
                className="w-8 h-8 rounded-full border-2"
                style={{ backgroundColor: formData.colors.secundario }}
              />
              <span className="text-sm text-muted-foreground">Vista previa de colores</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 Información importante</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• El equipo será creado con estado "Pendiente" hasta ser aprobado</li>
              <li>• Podrás agregar jugadores y staff después de la creación</li>
              <li>• El logo por defecto puede cambiarse desde el perfil del equipo</li>
              <li>• Puedes inscribirte a múltiples torneos una vez creado el equipo</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.name.trim()}
            >
              {isCreating ? 'Creando...' : 'Crear Equipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};