
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Users } from "lucide-react";

interface EquipoCardProps {
  equipo: {
    id: string;
    equipoId?: number; // Nuevo: ID numérico del equipo
    nombre: string;
    logo?: string;
    colores: {
      camiseta: string;
      pantaloneta: string;
      medias: string;
    };
    jugadores: number;
  };
  onEdit: () => void;
  showIds?: boolean; // Nueva prop para controlar si mostrar IDs
}

const EquipoCard: React.FC<EquipoCardProps> = ({ equipo, onEdit, showIds = true }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {equipo.logo ? (
                <img 
                  src={equipo.logo} 
                  alt={equipo.nombre}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {equipo.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{equipo.nombre}</h3>
              {showIds && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ID Usuario: {equipo.id}</p>
                  {equipo.equipoId && (
                    <p className="text-sm text-blue-600 font-medium">EquipoID: {equipo.equipoId}</p>
                  )}
                </div>
              )}
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
