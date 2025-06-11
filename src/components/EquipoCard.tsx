
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Users } from "lucide-react";

interface EquipoCardProps {
  equipo: {
    id: string;
    nombre: string;
    logo?: File | null;
    colores: {
      camiseta: string;
      pantaloneta: string;
      medias: string;
    };
    jugadores: number;
  };
  onEdit: () => void;
}

const EquipoCard: React.FC<EquipoCardProps> = ({ equipo, onEdit }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {equipo.logo ? (
                <img 
                  src={URL.createObjectURL(equipo.logo)} 
                  alt={equipo.nombre}
                  className="w-10 h-10 object-contain rounded"
                />
              ) : (
                <span className="text-xl">⚽</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{equipo.nombre}</h3>
              <p className="text-sm text-muted-foreground">ID: {equipo.id}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{equipo.jugadores} jugadores</span>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Colores del equipo:</p>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: equipo.colores.camiseta }}
                />
                <span className="text-xs">Camiseta</span>
              </div>
              <div className="flex items-center gap-1">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: equipo.colores.pantaloneta }}
                />
                <span className="text-xs">Pantaloneta</span>
              </div>
              <div className="flex items-center gap-1">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: equipo.colores.medias }}
                />
                <span className="text-xs">Medias</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipoCard;
