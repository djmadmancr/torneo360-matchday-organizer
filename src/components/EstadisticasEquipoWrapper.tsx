
import React from 'react';
import EstadisticasEquipo from './EstadisticasEquipo';
import { useLegacyAuth } from '@/hooks/useLegacyAuth';

const EstadisticasEquipoWrapper = () => {
  const { user } = useLegacyAuth();
  
  if (!user) return null;
  
  return (
    <EstadisticasEquipo 
      equipoId={user.id} 
      equipoNombre={user.perfiles?.equipo?.nombreEquipo || user.nombre}
    />
  );
};

export default EstadisticasEquipoWrapper;
