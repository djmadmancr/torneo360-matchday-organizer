import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrganizerRequests as OrganizerRequestsComponent } from '@/components/tournaments/OrganizerRequests';

const OrganizerRequests = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      if (!id) throw new Error('Tournament ID required');
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, description, status, organizer_id')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando torneo...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Torneo no encontrado</h2>
          <p className="text-muted-foreground mb-4">El torneo que buscas no existe o no tienes permisos para verlo</p>
          <Button onClick={() => navigate('/organizador')}>
            Volver al Panel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/organizador')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Panel
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">Gestión de Solicitudes</h1>
              <p className="text-sm text-muted-foreground">Administra las inscripciones del torneo</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="container mx-auto max-w-7xl">
          <OrganizerRequestsComponent 
            tournamentId={tournament.id} 
            tournamentName={tournament.name}
            tournamentStatus={tournament.status}
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizerRequests;