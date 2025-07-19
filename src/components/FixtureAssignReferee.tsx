import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX } from "lucide-react";
import { useReferees } from '@/hooks/useReferees';
import { useAssignReferee } from '@/hooks/useTournamentManagement';

interface FixtureAssignRefereeProps {
  matchId: string;
  currentRefereeId?: string | null;
  disabled?: boolean;
}

export const FixtureAssignReferee: React.FC<FixtureAssignRefereeProps> = ({
  matchId,
  currentRefereeId,
  disabled = false,
}) => {
  const { data: referees, isLoading } = useReferees();
  const assignMutation = useAssignReferee();

  const handleAssignReferee = async (refereeId: string | null) => {
    try {
      await assignMutation.mutateAsync({ matchId, refereeId });
    } catch (error) {
      console.error('Error assigning referee:', error);
    }
  };

  const currentReferee = referees?.find(r => r.id === currentRefereeId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando...</div>;
  }

  if (disabled) {
    return currentReferee ? (
      <Badge variant="secondary" className="gap-1">
        <UserCheck className="w-3 h-3" />
        {currentReferee.full_name}
      </Badge>
    ) : (
      <Badge variant="outline">Sin asignar</Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentRefereeId || ''}
        onValueChange={(value) => handleAssignReferee(value === 'none' ? null : value)}
        disabled={assignMutation.isPending}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar fiscal">
            {currentReferee ? (
              <span className="flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {currentReferee.full_name}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <UserX className="w-3 h-3" />
                Sin asignar
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="flex items-center gap-2">
              <UserX className="w-3 h-3" />
              Sin asignar
            </span>
          </SelectItem>
          {referees?.map((referee) => (
            <SelectItem key={referee.id} value={referee.id}>
              <span className="flex items-center gap-2">
                <UserCheck className="w-3 h-3" />
                {referee.full_name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {assignMutation.isPending && (
        <div className="text-xs text-muted-foreground">Guardando...</div>
      )}
    </div>
  );
};