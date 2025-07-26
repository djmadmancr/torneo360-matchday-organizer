import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Play, Settings, X, Plus } from "lucide-react";
import { useUpdateTournament, useStartTournament, CoverageType } from '@/hooks/useTournamentManagement';
import { Tournament } from '@/hooks/useTournaments';

interface TournamentEditModalProps {
  tournament: Tournament;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TournamentEditModal: React.FC<TournamentEditModalProps> = ({
  tournament,
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    name: tournament.name,
    description: tournament.description || '',
    start_date: tournament.start_date || '',
    end_date: tournament.end_date || '',
    max_teams: tournament.max_teams || 16,
    coverage: tournament.coverage || 'local' as CoverageType,
    invite_codes: tournament.invite_codes || [],
  });
  
  const [newInviteCode, setNewInviteCode] = useState('');
  
  const updateMutation = useUpdateTournament();
  const startMutation = useStartTournament();

  const canEdit = tournament.status === 'draft' || tournament.status === 'enrolling';
  const approvedTeams = (tournament as any).teams?.filter((t: any) => t.enrollment_status === 'approved').length || 0;
  const canStart = approvedTeams >= 2 && tournament.status === 'enrolling';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      // Convert empty date strings to null for Supabase
      const cleanedData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      await updateMutation.mutateAsync({
        id: tournament.id,
        ...cleanedData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating tournament:', error);
    }
  };

  const handleStartTournament = async () => {
    if (!canStart) return;
    
    if (window.confirm('¿Estás seguro de que quieres iniciar el torneo? Esta acción no se puede deshacer.')) {
      try {
        await startMutation.mutateAsync(tournament.id);
        onOpenChange(false);
      } catch (error) {
        console.error('Error starting tournament:', error);
      }
    }
  };

  const addInviteCode = () => {
    if (newInviteCode.trim() && !formData.invite_codes.includes(newInviteCode.trim())) {
      setFormData({
        ...formData,
        invite_codes: [...formData.invite_codes, newInviteCode.trim()]
      });
      setNewInviteCode('');
    }
  };

  const removeInviteCode = (code: string) => {
    setFormData({
      ...formData,
      invite_codes: formData.invite_codes.filter(c => c !== code)
    });
  };

  const coverageOptions = [
    { value: 'local', label: 'Local' },
    { value: 'state', label: 'Estatal' },
    { value: 'national', label: 'Nacional' },
    { value: 'regional', label: 'Regional' },
    { value: 'international', label: 'Internacional' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="tournament-edit-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurar Torneo: {tournament.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tournament Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estado del Torneo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Equipos aprobados:</span>
                  <Badge variant="secondary">{approvedTeams}</Badge>
                </div>
                <Badge variant={tournament.status === 'enrolling' ? 'default' : 'secondary'}>
                  {tournament.status === 'enrolling' ? 'Inscripciones Abiertas' : 
                   tournament.status === 'scheduled' ? 'Programado' : 'Borrador'}
                </Badge>
              </div>
              
              {canStart && (
                <Button 
                  onClick={handleStartTournament} 
                  className="w-full"
                  disabled={startMutation.isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {startMutation.isPending ? 'Iniciando...' : 'Iniciar Torneo'}
                </Button>
              )}
              
              {!canStart && tournament.status === 'enrolling' && (
                <p className="text-sm text-muted-foreground">
                  Se necesitan al menos 2 equipos aprobados para iniciar el torneo.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Edit Form */}
          {canEdit && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Torneo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="coverage">Cobertura</Label>
                  <Select
                    value={formData.coverage}
                    onValueChange={(value: CoverageType) => setFormData({ ...formData, coverage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {coverageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  data-testid="description-input"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start_date">Fecha Inicio</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date">Fecha Fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_teams">Máximo Equipos</Label>
                  <Input
                    id="max_teams"
                    type="number"
                    min="2"
                    max="64"
                    value={formData.max_teams}
                    onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) })}
                    data-testid="max-teams-input"
                  />
                </div>
              </div>

              {/* Invite Codes */}
              <div>
                <Label>Códigos de Invitación</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newInviteCode}
                      onChange={(e) => setNewInviteCode(e.target.value)}
                      placeholder="Nuevo código"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInviteCode())}
                    />
                    <Button type="button" variant="outline" onClick={addInviteCode}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.invite_codes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.invite_codes.map((code) => (
                        <Badge key={code} variant="secondary" className="gap-1">
                          {code}
                          <button
                            type="button"
                            onClick={() => removeInviteCode(code)}
                            className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="save-tournament-button">
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          )}

          {!canEdit && (
            <p className="text-center text-muted-foreground">
              El torneo no puede ser editado en su estado actual.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};