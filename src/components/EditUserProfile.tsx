import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useUpdateMyProfile, ProfileSchema, ProfileInput } from "@/services/profile";

interface EditUserProfileProps {
  initialData: {
    full_name?: string;
  };
  onSuccess?: () => void;
}

export const EditUserProfile: React.FC<EditUserProfileProps> = ({
  initialData,
  onSuccess,
}) => {
  const updateProfile = useUpdateMyProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: initialData.full_name || "",
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success("Perfil actualizado correctamente");
      onSuccess?.();
    } catch (error) {
      toast.error("Error al actualizar el perfil");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nombre Completo</Label>
        <Input
          id="full_name"
          {...register("full_name")}
          placeholder="Ingresa tu nombre completo"
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={updateProfile.isPending}
        className="w-full"
      >
        {updateProfile.isPending ? "Actualizando..." : "Guardar Cambios"}
      </Button>
    </form>
  );
};