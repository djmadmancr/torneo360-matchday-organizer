
import React from 'react';
import { Label } from "@/components/ui/label";

interface ColorSelectorProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  allowDualColor?: boolean;
  secondValue?: string;
  onSecondChange?: (color: string) => void;
}

const coloresPrimarios = [
  '#FF0000', // Rojo
  '#00FF00', // Verde
  '#0000FF', // Azul
  '#FFFF00', // Amarillo
  '#FF00FF', // Magenta
  '#00FFFF', // Cian
];

const coloresSecundarios = [
  '#FFA500', // Naranja
  '#800080', // Púrpura
  '#FFC0CB', // Rosa
  '#A52A2A', // Marrón
  '#808080', // Gris
  '#000000', // Negro
  '#FFFFFF', // Blanco
  '#800000', // Granate
  '#008000', // Verde oscuro
  '#000080'  // Azul marino
];

const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  label, 
  value, 
  onChange, 
  allowDualColor = false,
  secondValue,
  onSecondChange 
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Colores Primarios</p>
          <div className="grid grid-cols-6 gap-2">
            {coloresPrimarios.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded border-2 ${value === color ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'}`}
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Colores Secundarios</p>
          <div className="grid grid-cols-5 gap-2">
            {coloresSecundarios.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded border-2 ${value === color ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'}`}
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
              />
            ))}
          </div>
        </div>

        {allowDualColor && secondValue !== undefined && onSecondChange && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Color Secundario de Camiseta</p>
            <div className="grid grid-cols-6 gap-2">
              {coloresPrimarios.map((color) => (
                <button
                  key={`second-${color}`}
                  type="button"
                  className={`w-8 h-8 rounded border-2 ${secondValue === color ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onSecondChange(color)}
                />
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {coloresSecundarios.map((color) => (
                <button
                  key={`second-${color}`}
                  type="button"
                  className={`w-8 h-8 rounded border-2 ${secondValue === color ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onSecondChange(color)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div 
          className="w-6 h-6 rounded border"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-muted-foreground">Principal: {value}</span>
        {allowDualColor && secondValue && (
          <>
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: secondValue }}
            />
            <span className="text-sm text-muted-foreground">Secundario: {secondValue}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ColorSelector;
