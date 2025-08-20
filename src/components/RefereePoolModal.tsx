import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, MapPin, CreditCard, Phone, Calendar, Award, Globe, Filter } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RefereePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReferee?: (referee: any) => void;
  showSelectionButton?: boolean;
}

const RefereePoolModal: React.FC<RefereePoolModalProps> = ({
  isOpen,
  onClose,
  onSelectReferee,
  showSelectionButton = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all referees with filtering
  const { data: referees = [], isLoading } = useQuery({
    queryKey: ['referee-pool', searchTerm, countryFilter, cityFilter],
    queryFn: async () => {
      console.log('🔍 Fetching referee pool with filters:', { searchTerm, countryFilter, cityFilter });
      
      let query = supabase
        .from('users')
        .select('id, full_name, email, referee_credential, city, country, profile_data, created_at')
        .eq('role', 'referee')
        .order('full_name');

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,referee_credential.ilike.%${searchTerm}%`);
      }

      // Apply country filter
      if (countryFilter) {
        query = query.eq('country', countryFilter);
      }

      // Apply city filter
      if (cityFilter) {
        query = query.eq('city', cityFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching referee pool:', error);
        throw error;
      }

      console.log('✅ Referee pool loaded:', data?.length || 0, 'referees');
      return data || [];
    },
    enabled: isOpen
  });

  // Get unique countries and cities for filters
  const { data: filterOptions } = useQuery({
    queryKey: ['referee-filter-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('country, city')
        .eq('role', 'referee')
        .not('country', 'is', null)
        .not('city', 'is', null);

      if (error) throw error;

      const countries = [...new Set(data?.map(r => r.country).filter(Boolean))].sort();
      const cities = [...new Set(data?.map(r => r.city).filter(Boolean))].sort();

      return { countries, cities };
    },
    enabled: isOpen
  });

  const clearFilters = () => {
    setSearchTerm('');
    setCountryFilter('');
    setCityFilter('');
  };

  const getAvailabilityText = (availability: string[]) => {
    if (!availability || availability.length === 0) return 'No especificada';
    if (availability.length === 7) return 'Toda la semana';
    return availability.join(', ');
  };

  const formatExperience = (experience: string) => {
    if (!experience) return 'No especificada';
    return experience;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Pool de Árbitros
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">País</label>
                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los países" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los países</SelectItem>
                        {filterOptions?.countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ciudad</label>
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las ciudades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las ciudades</SelectItem>
                        {filterOptions?.cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Cargando...' : `${referees.length} árbitros encontrados`}
            </p>
          </div>

          {/* Referees List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando árbitros...</p>
              </div>
            ) : referees.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron árbitros</h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            ) : (
              referees.map((referee) => (
                <Card key={referee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Header info */}
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{referee.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{referee.email}</p>
                          </div>
                          {referee.referee_credential && (
                            <Badge variant="outline" className="ml-auto">
                              ID: {referee.referee_credential}
                            </Badge>
                          )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {referee.country && (
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <span>{referee.country}</span>
                            </div>
                          )}
                          {referee.city && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{referee.city}</span>
                            </div>
                          )}
                          {referee.profile_data?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{referee.profile_data.phone}</span>
                            </div>
                          )}
                          {referee.profile_data?.experience && (
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-muted-foreground" />
                              <span>{formatExperience(referee.profile_data.experience)}</span>
                            </div>
                          )}
                        </div>

                        {/* Availability */}
                        {referee.profile_data?.availability && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Disponibilidad:</span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              {getAvailabilityText(referee.profile_data.availability)}
                            </p>
                          </div>
                        )}

                        {/* Bio */}
                        {referee.profile_data?.bio && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {referee.profile_data.bio.length > 150 
                                ? `${referee.profile_data.bio.substring(0, 150)}...`
                                : referee.profile_data.bio
                              }
                            </p>
                          </div>
                        )}

                        {/* Certifications */}
                        {referee.profile_data?.certifications && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Certificaciones:</span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              {referee.profile_data.certifications}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Selection Button */}
                      {showSelectionButton && onSelectReferee && (
                        <Button
                          onClick={() => onSelectReferee(referee)}
                          className="ml-4"
                          size="sm"
                        >
                          Seleccionar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefereePoolModal;