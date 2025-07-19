import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, MapPin } from "lucide-react";
import { useUpsertHomeField, useDeleteHomeField, HomeField } from '@/hooks/useTeamCards';

interface HomeFieldFormProps {
  teamId: string;
  fields: HomeField[];
  onClose: () => void;
}

export const HomeFieldForm: React.FC<HomeFieldFormProps> = ({ teamId, fields, onClose }) => {
  const [newField, setNewField] = useState({ name: '', address: '' });
  const [editingField, setEditingField] = useState<HomeField | null>(null);
  
  const upsertMutation = useUpsertHomeField();
  const deleteMutation = useDeleteHomeField();

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.name.trim()) return;
    
    try {
      await upsertMutation.mutateAsync({
        teamId,
        name: newField.name,
        address: newField.address || undefined,
      });
      setNewField({ name: '', address: '' });
    } catch (error) {
      console.error('Error adding field:', error);
    }
  };

  const handleUpdateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField || !editingField.name.trim()) return;
    
    try {
      await upsertMutation.mutateAsync({
        teamId,
        id: editingField.id,
        name: editingField.name,
        address: editingField.address || undefined,
      });
      setEditingField(null);
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cancha?')) {
      try {
        await deleteMutation.mutateAsync(fieldId);
      } catch (error) {
        console.error('Error deleting field:', error);
      }
    }
  };

  const canAddMoreFields = fields.length < 3;

  return (
    <div className="space-y-6">
      {/* Current Fields */}
      <div className="space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Canchas Actuales ({fields.length}/3)
        </h4>
        
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay canchas configuradas. Añade hasta 3 canchas locales.
          </p>
        ) : (
          <div className="space-y-2">
            {fields.map((field) => (
              <Card key={field.id} className="p-3">
                {editingField?.id === field.id ? (
                  <form onSubmit={handleUpdateField} className="space-y-3">
                    <Input
                      value={editingField.name}
                      onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                      placeholder="Nombre de la cancha"
                      required
                    />
                    <Input
                      value={editingField.address || ''}
                      onChange={(e) => setEditingField({ ...editingField, address: e.target.value })}
                      placeholder="Dirección (opcional)"
                    />
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        size="sm" 
                        disabled={upsertMutation.isPending}
                      >
                        Guardar
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingField(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{field.name}</div>
                      {field.address && (
                        <div className="text-sm text-muted-foreground">{field.address}</div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingField(field)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteField(field.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add New Field */}
      {canAddMoreFields && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Añadir Cancha Local
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddField} className="space-y-3">
              <div>
                <Label htmlFor="field-name">Nombre de la cancha</Label>
                <Input
                  id="field-name"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  placeholder="Ej: Cancha Municipal Norte"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="field-address">Dirección (opcional)</Label>
                <Input
                  id="field-address"
                  value={newField.address}
                  onChange={(e) => setNewField({ ...newField, address: e.target.value })}
                  placeholder="Ej: Av. Principal 123, Sector Norte"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending ? 'Guardando...' : 'Añadir Cancha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};