import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // en bytes
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = "Imagen",
  placeholder = "Seleccionar imagen",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño
    if (file.size > maxSize) {
      toast.error(`La imagen debe ser menor a ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    setUploading(true);
    
    try {
      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from('team-logos')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success('Logo subido correctamente');
    } catch (error) {
      toast.error('Error al subir la imagen');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
  };

  const clearImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* Vista previa de imagen */}
      {value && (
        <div className="relative inline-block">
          <img 
            src={value} 
            alt="Vista previa" 
            className="w-24 h-24 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {/* Upload desde archivo */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
          <div className="text-center">
            <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Subir desde archivo
            </p>
            <Input
              type="file"
              accept={accept}
              onChange={handleFileUpload}
              disabled={uploading}
              className="max-w-xs"
            />
          </div>
        </div>

        {/* O ingresar URL */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">O ingresar URL:</Label>
          <Input
            type="url"
            value={value || ""}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Formatos soportados: JPG, PNG, GIF. Máximo {Math.round(maxSize / (1024 * 1024))}MB.
      </p>
    </div>
  );
};