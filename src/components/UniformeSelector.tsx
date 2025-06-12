
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ColorSelector from "./ColorSelector";

interface UniformeSelectorProps {
  colores: {
    camiseta: string;
    pantaloneta: string;
    medias: string;
  };
  onChange: (colores: { camiseta: string; pantaloneta: string; medias: string }) => void;
}

const UniformeSelector: React.FC<UniformeSelectorProps> = ({ colores, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (tipo: 'camiseta' | 'pantaloneta' | 'medias', color: string) => {
    onChange({
      ...colores,
      [tipo]: color
    });
  };

  return (
    <div className="space-y-4">
      {/* Vista previa del uniforme - siempre visible */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Vista previa del uniforme</h4>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="w-16 h-20 mx-auto mb-2 relative">
              {/* Camiseta */}
              <div 
                className="w-16 h-12 rounded-t-lg border-2 border-gray-300"
                style={{ backgroundColor: colores.camiseta }}
              />
              {/* Pantaloneta */}
              <div 
                className="w-12 h-8 mx-auto border-2 border-gray-300"
                style={{ backgroundColor: colores.pantaloneta }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Camiseta y Pantaloneta</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-16 mx-auto mb-2">
              {/* Medias */}
              <div 
                className="w-8 h-16 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: colores.medias }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Medias</p>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: colores.camiseta }}
              />
              <span>Camiseta</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: colores.pantaloneta }}
              />
              <span>Pantaloneta</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: colores.medias }}
              />
              <span>Medias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de colores colapsable */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full flex items-center justify-between">
            <span>Personalizar colores del uniforme</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <ColorSelector
            label="Color de la camiseta"
            value={colores.camiseta}
            onChange={(color) => handleColorChange('camiseta', color)}
          />
          <ColorSelector
            label="Color de la pantaloneta"
            value={colores.pantaloneta}
            onChange={(color) => handleColorChange('pantaloneta', color)}
          />
          <ColorSelector
            label="Color de las medias"
            value={colores.medias}
            onChange={(color) => handleColorChange('medias', color)}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default UniformeSelector;
