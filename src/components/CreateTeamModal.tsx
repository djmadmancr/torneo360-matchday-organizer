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
import { useSupabaseTeams } from '@/hooks/useSupabaseTeams';
import { toast } from 'sonner';

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  open,
  onOpenChange,
}) => {
  console.log('🎭 CreateTeamModal render:', { open });
  const [formData, setFormData] = useState({
    name: '',
    colors: {
      principal: '#1e40af',
      secundario: '#3b82f6'
    },
    phone: '',
    address: '',
    country: '',
  });

  const { createTeam, isCreating, teams } = useSupabaseTeams();

  // Check if user already has a team
  const hasTeam = teams.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre del equipo es requerido');
      return;
    }

    try {
      await createTeam({
        name: formData.name.trim(),
        colors: formData.colors,
        country: formData.country,
        team_data: {
          description: `Equipo ${formData.name}`,
          phone: formData.phone,
          address: formData.address,
        }
      });

      // Reset form
      setFormData({
        name: '',
        colors: {
          principal: '#1e40af',
          secundario: '#3b82f6'
        },
        phone: '',
        address: '',
        country: '',
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto z-50">
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


            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Ej: +1 234 567 8900"
                />
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => handleInputChange('country', value)}
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
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Ej: Av. Principal 123, Ciudad"
              />
            </div>
          </div>

          {/* Team Colors */}
          <div className="space-y-4">
            <Label>Colores del Equipo</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Color Principal</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={formData.colors.principal}
                    onChange={(e) => handleColorChange('principal', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.colors.principal}
                    onChange={(e) => handleColorChange('principal', e.target.value)}
                    placeholder="#1e40af"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Color Secundario</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={formData.colors.secundario}
                    onChange={(e) => handleColorChange('secundario', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.colors.secundario}
                    onChange={(e) => handleColorChange('secundario', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
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
              disabled={isCreating || !formData.name.trim() || hasTeam}
            >
              {hasTeam ? 'Ya tienes un equipo' : isCreating ? 'Creando...' : 'Crear Equipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};