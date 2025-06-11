
import React from 'react';
import { Label } from "@/components/ui/label";

interface ColorSelectorProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const coloresDisponibles = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#000000',
  '#FFFFFF', '#800000', '#008000', '#000080'
];

const ColorSelector: React.FC<ColorSelectorProps> = ({ label, value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-8 gap-2">
        {coloresDisponibles.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded border-2 ${value === color ? 'border-gray-800' : 'border-gray-300'}`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div 
          className="w-6 h-6 rounded border"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-muted-foreground">{value}</span>
      </div>
    </div>
  );
};

export default ColorSelector;
