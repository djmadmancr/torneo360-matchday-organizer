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
import { ImageUpload } from '@/components/ImageUpload';
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
    logo_url: '',
    colors: {
      principal: '#1e40af',
      secundario: '#3b82f6'
    },
    phone: '',
    address: '',
    country: '',
    players: [] as Array<{id: string, name: string, lastName: string, idNumber: string}>,
    technicalStaff: [] as Array<{id: string, name: string, lastName: string, position: string}>,
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
        logo_url: formData.logo_url,
        colors: formData.colors,
        team_data: {
          description: `Equipo ${formData.name}`,
          phone: formData.phone,
          address: formData.address,
          country: formData.country,
          players: formData.players,
          technicalStaff: formData.technicalStaff,
        }
      });

      // Reset form
      setFormData({
        name: '',
        logo_url: '',
        colors: {
          principal: '#1e40af',
          secundario: '#3b82f6'
        },
        phone: '',
        address: '',
        country: '',
        players: [],
        technicalStaff: [],
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

  const addPlayer = () => {
    const newPlayer = {
      id: Date.now().toString(),
      name: '',
      lastName: '',
      idNumber: ''
    };
    setFormData(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
  };

  const updatePlayer = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players.map(player =>
        player.id === id ? { ...player, [field]: value } : player
      )
    }));
  };

  const removePlayer = (id: string) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players.filter(player => player.id !== id)
    }));
  };

  const addStaff = () => {
    const newStaff = {
      id: Date.now().toString(),
      name: '',
      lastName: '',
      position: ''
    };
    setFormData(prev => ({
      ...prev,
      technicalStaff: [...prev.technicalStaff, newStaff]
    }));
  };

  const updateStaff = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      technicalStaff: prev.technicalStaff.map(staff =>
        staff.id === id ? { ...staff, [field]: value } : staff
      )
    }));
  };

  const removeStaff = (id: string) => {
    setFormData(prev => ({
      ...prev,
      technicalStaff: prev.technicalStaff.filter(staff => staff.id !== id)
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

            {/* Logo Upload */}
            <div>
              <Label>Logo del Equipo</Label>
              <ImageUpload
                value={formData.logo_url}
                onChange={(url) => handleInputChange('logo_url', url)}
                maxSize={5 * 1024 * 1024}
                accept="image/jpeg,image/png"
                placeholder="Sube el logo de tu equipo (JPG o PNG)"
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
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Ej: España"
                />
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

          {/* Players Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Jugadores</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPlayer}>
                + Agregar Jugador
              </Button>
            </div>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {formData.players.map((player) => (
                <div key={player.id} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                  <Input
                    placeholder="Nombre"
                    value={player.name}
                    onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Apellido"
                    value={player.lastName}
                    onChange={(e) => updatePlayer(player.id, 'lastName', e.target.value)}
                  />
                  <Input
                    placeholder="ID/Cédula"
                    value={player.idNumber}
                    onChange={(e) => updatePlayer(player.id, 'idNumber', e.target.value)}
                  />
                  <Button type="button" variant="destructive" size="sm" onClick={() => removePlayer(player.id)}>
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Staff Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Cuerpo Técnico</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStaff}>
                + Agregar Personal
              </Button>
            </div>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {formData.technicalStaff.map((staff) => (
                <div key={staff.id} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                  <Input
                    placeholder="Nombre"
                    value={staff.name}
                    onChange={(e) => updateStaff(staff.id, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Apellido"
                    value={staff.lastName}
                    onChange={(e) => updateStaff(staff.id, 'lastName', e.target.value)}
                  />
                  <Input
                    placeholder="Cargo"
                    value={staff.position}
                    onChange={(e) => updateStaff(staff.id, 'position', e.target.value)}
                  />
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeStaff(staff.id)}>
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Información importante</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• El equipo será creado y aprobado inmediatamente</li>
                <li>• Podrás agregar jugadores y staff después de la creación</li>
                <li>• El logo por defecto puede cambiarse desde el perfil del equipo</li>
                <li>• Por ahora solo puedes crear un equipo (primer equipo gratuito)</li>
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