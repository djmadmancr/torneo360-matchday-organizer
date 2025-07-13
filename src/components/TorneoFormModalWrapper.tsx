
import React from 'react';
import TorneoFormModal from './TorneoFormModal';

interface TorneoFormModalWrapperProps {
  open: boolean;
  onClose: () => void;
}

const TorneoFormModalWrapper: React.FC<TorneoFormModalWrapperProps> = ({ open, onClose }) => {
  const handleSubmit = (torneoData: any) => {
    console.log('Crear torneo:', torneoData);
    onClose();
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
