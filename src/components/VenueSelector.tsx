import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useUpdateVenue } from '@/hooks/useTeamCards';
import { HomeField } from '@/hooks/useTeamCards';

interface VenueSelectorProps {
  matchId: string;
  currentVenue?: string | null;
  homeFields: HomeField[];
  disabled?: boolean;
}

export const VenueSelector: React.FC<VenueSelectorProps> = ({
  matchId,
  currentVenue,
  homeFields,
  disabled = false,
}) => {
  const updateVenueMutation = useUpdateVenue();

  const handleVenueChange = async (venue: string) => {
    try {
      await updateVenueMutation.mutateAsync({ matchId, venue });
    } catch (error) {
      console.error('Error updating venue:', error);
    }
  };

  if (disabled || homeFields.length === 0) {
    return currentVenue ? (
      <Badge variant="secondary" className="gap-1">
        <MapPin className="w-3 h-3" />
        {currentVenue}
      </Badge>
    ) : (
      <Badge variant="outline">Por definir</Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentVenue || ''}
        onValueChange={handleVenueChange}
        disabled={updateVenueMutation.isPending}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar cancha">
            {currentVenue ? (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {currentVenue}
              </span>
            ) : (
              <span className="text-muted-foreground">Seleccionar cancha</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {homeFields.map((field) => (
            <SelectItem key={field.id} value={field.name}>
              <div className="flex flex-col">
                <span className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {field.name}
                </span>
                {field.address && (
                  <span className="text-xs text-muted-foreground">{field.address}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {updateVenueMutation.isPending && (
        <div className="text-xs text-muted-foreground">Guardando...</div>
      )}
    </div>
  );
};