import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { useTeam } from "@/hooks/useTeams";
import { Upload, X } from "lucide-react";

const TeamProfileSchema = z.object({
  name: z.string().min(1, "El nombre del equipo es requerido"),
  logo_url: z.string().optional(),
  colors: z.object({
    principal: z.string(),
    secundario: z.string()
  }).optional()
});

type TeamProfileInput = z.infer<typeof TeamProfileSchema>;

interface EditTeamProfileProps {
  teamId: string;
  initialData: {
    name?: string;
    logo_url?: string;
    colors?: {
      principal: string;
      secundario: string;
    };
  };
  onSuccess?: () => void;
}

export const EditTeamProfile: React.FC<EditTeamProfileProps> = ({
  teamId,
  initialData,
  onSuccess,
}) => {
  const { updateTeam } = useTeam(teamId);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TeamProfileInput>({
    resolver: zodResolver(TeamProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      logo_url: initialData.logo_url || "",
      colors: initialData.colors || {
        principal: "#1e40af",
        secundario: "#3b82f6"
      }
    },
  });

  const logoUrl = watch("logo_url");

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setUploadingImage(true);
    
    try {
      // Por ahora, crear una URL temporal para la vista previa
      // TODO: Implementar upload a Supabase Storage cuando esté configurado
      const objectUrl = URL.createObjectURL(file);
      setValue("logo_url", objectUrl);
      toast.success('Imagen cargada correctamente');
    } catch (error) {
      toast.error('Error al cargar la imagen');
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: TeamProfileInput) => {
    try {
      await updateTeam({
        id: teamId,
        name: data.name,
        logo_url: data.logo_url,
        colors: data.colors
      });
      toast.success("Equipo actualizado correctamente");
      onSuccess?.();
    } catch (error) {
      toast.error("Error al actualizar el equipo");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Equipo</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Ingresa el nombre del equipo"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Logo del Equipo</Label>
        <div className="flex items-start gap-4">
          {logoUrl && (
            <div className="relative">
              <img 
                src={logoUrl} 
                alt="Logo del equipo" 
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0"
                onClick={() => setValue("logo_url", "")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <div className="flex-1">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="max-w-xs"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos soportados: JPG, PNG, GIF. Máximo 5MB.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Colores del Equipo</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="color_principal" className="text-sm">Color Principal</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color_principal"
                type="color"
                {...register("colors.principal")}
                className="w-12 h-10 p-1"
              />
              <Input
                {...register("colors.principal")}
                placeholder="#1e40af"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="color_secundario" className="text-sm">Color Secundario</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color_secundario"
                type="color"
                {...register("colors.secundario")}
                className="w-12 h-10 p-1"
              />
              <Input
                {...register("colors.secundario")}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={uploadingImage}
        className="w-full"
      >
        {uploadingImage ? "Subiendo imagen..." : "Guardar Cambios"}
      </Button>
    </form>
  );
};