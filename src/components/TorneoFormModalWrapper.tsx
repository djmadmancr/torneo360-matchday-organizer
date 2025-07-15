
import React from 'react';
import TorneoFormModal from './TorneoFormModal';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/contexts/AuthContext';
import { useAddTeamsToTournament } from '@/hooks/useAddTeamsToTournament';
import { toast } from 'sonner';

interface TorneoFormModalWrapperProps {
  open: boolean;
  onClose: () => void;
}

const TorneoFormModalWrapper: React.FC<TorneoFormModalWrapperProps> = ({ open, onClose }) => {
  const { createTournament } = useTournaments();
  const { currentUser } = useAuth();
  const addTeamsToTournament = useAddTeamsToTournament();

  const handleSubmit = async (torneoData: any) => {
    console.log('Enviando formulario:', torneoData);
    
    if (!currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      // Map form data to tournament schema
      const tournamentData = {
        name: torneoData.nombreTorneo,
        description: torneoData.descripcion || '',
        organizer_id: currentUser.id,
        max_teams: torneoData.maxEquipos || 16,
        enrollment_deadline: torneoData.fechaCierre || null,
        visibility: torneoData.esPublico ? 'public' : 'invite',
        status: 'enrolling',
        tournament_data: {
          categoria: torneoData.categoria,
          tipoFutbol: torneoData.tipoFutbol,
          formato: torneoData.formato,
          puntajeGane: torneoData.puntajeGane,
          puntajeEmpate: torneoData.puntajeEmpate,
          puntajeExtraPenales: torneoData.puntajeExtraPenales,
          puntajeExtra: torneoData.puntajeExtra,
          idaVuelta: torneoData.idaVuelta,
          diasSemana: torneoData.diasSemana,
          partidosPorSemana: torneoData.partidosPorSemana,
          logo: torneoData.logo,
          edadMinima: torneoData.edadMinima,
          edadMaxima: torneoData.edadMaxima,
          ubicacion: torneoData.ubicacion
        }
      };

      console.log('Datos del torneo a crear:', tournamentData);
      
      const createdTournament = await createTournament(tournamentData);
      
      // Si hay equipos invitados, agregarlos al torneo
      if (torneoData.equiposInvitados && torneoData.equiposInvitados.length > 0) {
        await addTeamsToTournament.mutateAsync({
          tournamentId: createdTournament.id,
          teamIds: torneoData.equiposInvitados
        });
      }
      
      toast.success('¡Torneo creado exitosamente!');
      onClose();
    } catch (error) {
      console.error('Error al crear torneo:', error);
      toast.error('Error al crear el torneo');
    }
  };

  return (
    <TorneoFormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      torneoId=""
    />
  );
};

export default TorneoFormModalWrapper;
