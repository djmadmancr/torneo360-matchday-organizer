import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserCheck, UserPlus, MapPin, Flag, CreditCard } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RefereeSearchModalProps {
  tournamentId: string;
  tournamentName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Referee {
  id: string;
  full_name: string;
  email: string;
  referee_credential: string | null;
  city: string | null;
  country: string | null;
  profile_data: any;
  isAssigned: boolean;
}

const RefereeSearchModal: React.FC<RefereeSearchModalProps> = ({
  tournamentId,
  tournamentName,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const queryClient = useQueryClient();

  // Fetch all referees
  const { data: referees = [], isLoading } = useQuery<Referee[]>({
    queryKey: ['referees-search', searchTerm, countryFilter, cityFilter],
    queryFn: async (): Promise<Referee[]> => {
      let query = supabase
        .from('users')
        .select('id, full_name, email, referee_credential, city, country, profile_data')
        .eq('role', 'referee');

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,referee_credential.ilike.%${searchTerm}%`);
      }

      if (countryFilter) {
        query = query.eq('country', countryFilter);
      }

      if (cityFilter) {
        query = query.eq('city', cityFilter);
      }

      const { data, error } = await query.order('full_name');
      
      if (error) throw error;

      // Check which referees are already assigned to this tournament
      const { data: assignedReferees, error: assignedError } = await supabase
        .from('tournament_referees')
        .select('referee_id')
        .eq('tournament_id', tournamentId);

      if (assignedError) throw assignedError;

      const assignedIds = new Set(assignedReferees?.map((ar: any) => ar.referee_id) || []);

      return (data || []).map((referee: any) => ({
        ...referee,
        isAssigned: assignedIds.has(referee.id)
      }));
    },
    enabled: isOpen,
  });

  // Fetch assigned referees count
  const { data: assignedCount = 0 } = useQuery<number>({
    queryKey: ['tournament-referees-count', tournamentId],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from('tournament_referees')
        .select('id')
        .eq('tournament_id', tournamentId);
      
      if (error) throw error;
      return (data || []).length;
    },
    enabled: isOpen,
  });

  // Add referee to tournament
  const addRefereeMutation = useMutation({
    mutationFn: async (refereeId: string) => {
      const { error } = await supabase
        .from('tournament_referees')
        .insert({
          tournament_id: tournamentId,
          referee_id: refereeId
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referees-search'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-referees-count'] });
      toast.success('Árbitro agregado al torneo');
    },
    onError: (error: any) => {
      toast.error('Error al agregar árbitro: ' + error.message);
    }
  });

  // Remove referee from tournament
  const removeRefereeMutation = useMutation({
    mutationFn: async (refereeId: string) => {
      const { error } = await supabase
        .from('tournament_referees')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('referee_id', refereeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referees-search'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-referees-count'] });
      toast.success('Árbitro removido del torneo');
    },
    onError: (error: any) => {
      toast.error('Error al remover árbitro: ' + error.message);
    }
  });

  const handleAddReferee = (referee: Referee) => {
    addRefereeMutation.mutate(referee.id);
  };

  const handleRemoveReferee = (referee: Referee) => {
    removeRefereeMutation.mutate(referee.id);
  };

  const filteredReferees = referees.filter((referee: Referee) => {
    if (!searchTerm && !countryFilter && !cityFilter) return true;
    return true; // Filtering is done in the query
  });

  const availableCountries = [...new Set((referees || []).map((r: Referee) => r.country).filter(Boolean))];
  const availableCities = [...new Set((referees || []).map((r: Referee) => r.city).filter(Boolean))];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Gestionar Árbitros - {tournamentName}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Árbitros asignados: <Badge variant="secondary">{assignedCount}</Badge>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o credencial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Todos los países</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Todas las ciudades</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredReferees.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron árbitros</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredReferees.map((referee: Referee) => (
                  <Card key={referee.id} className={`transition-colors ${referee.isAssigned ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{referee.full_name}</h3>
                              <p className="text-sm text-muted-foreground truncate">{referee.email}</p>
                            </div>
                            
                            {referee.isAssigned && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Asignado
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-xs">
                            {referee.referee_credential && (
                              <div className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                <span>Cred: {referee.referee_credential}</span>
                              </div>
                            )}
                            {referee.country && (
                              <div className="flex items-center gap-1">
                                <Flag className="w-3 h-3" />
                                <span>{referee.country}</span>
                              </div>
                            )}
                            {referee.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{referee.city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4 flex-shrink-0">
                          {referee.isAssigned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveReferee(referee)}
                              disabled={removeRefereeMutation.isPending}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Remover
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAddReferee(referee)}
                              disabled={addRefereeMutation.isPending}
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Agregar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefereeSearchModal;