import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { useTeam } from "@/hooks/useTeams";
import { ImageUpload } from "@/components/ImageUpload";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const TeamProfileSchema = z.object({
  name: z.string().min(1, "El nombre del equipo es requerido"),
  logo_url: z.string().optional(),
  colors: z.object({
    principal: z.string(),
    secundario: z.string()
  }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  players: z.array(z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
    idNumber: z.string()
  })).optional(),
  technicalStaff: z.array(z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
    position: z.string()
  })).optional()
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
    team_data?: {
      phone?: string;
      address?: string;
      country?: string;
      players?: Array<{id: string, name: string, lastName: string, idNumber: string}>;
      technicalStaff?: Array<{id: string, name: string, lastName: string, position: string}>;
    };
  };
  onSuccess?: () => void;
  onDelete?: () => void;
}

export const EditTeamProfile: React.FC<EditTeamProfileProps> = ({
  teamId,
  initialData,
  onSuccess,
  onDelete,
}) => {
  const { updateTeam, deleteTeam } = useTeam(teamId);

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
      },
      phone: initialData.team_data?.phone || "",
      address: initialData.team_data?.address || "",
      country: initialData.team_data?.country || "",
      players: initialData.team_data?.players || [],
      technicalStaff: initialData.team_data?.technicalStaff || []
    },
  });

  const players = watch("players") || [];
  const technicalStaff = watch("technicalStaff") || [];

  const logoUrl = watch("logo_url");

  const onSubmit = async (data: TeamProfileInput) => {
    try {
      await updateTeam({
        id: teamId,
        name: data.name,
        logo_url: data.logo_url,
        colors: data.colors,
        team_data: {
          phone: data.phone,
          address: data.address,
          country: data.country,
          players: data.players,
          technicalStaff: data.technicalStaff
        }
      });
      toast.success("Equipo actualizado correctamente");
      onSuccess?.();
    } catch (error) {
      toast.error("Error al actualizar el equipo");
      console.error(error);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(teamId);
      toast.success("Equipo eliminado correctamente");
      onDelete?.();
    } catch (error) {
      toast.error("Error al eliminar el equipo");
      console.error(error);
    }
  };

  const addPlayer = () => {
    const newPlayer = {
      id: Date.now().toString(),
      name: '',
      lastName: '',
      idNumber: ''
    };
    setValue("players", [...players, newPlayer]);
  };

  const updatePlayer = (id: string, field: string, value: string) => {
    const updatedPlayers = players.map(player =>
      player.id === id ? { ...player, [field]: value } : player
    );
    setValue("players", updatedPlayers);
  };

  const removePlayer = (id: string) => {
    const updatedPlayers = players.filter(player => player.id !== id);
    setValue("players", updatedPlayers);
  };

  const addStaff = () => {
    const newStaff = {
      id: Date.now().toString(),
      name: '',
      lastName: '',
      position: ''
    };
    setValue("technicalStaff", [...technicalStaff, newStaff]);
  };

  const updateStaff = (id: string, field: string, value: string) => {
    const updatedStaff = technicalStaff.map(staff =>
      staff.id === id ? { ...staff, [field]: value } : staff
    );
    setValue("technicalStaff", updatedStaff);
  };

  const removeStaff = (id: string) => {
    const updatedStaff = technicalStaff.filter(staff => staff.id !== id);
    setValue("technicalStaff", updatedStaff);
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
        <ImageUpload
          value={logoUrl}
          onChange={(url) => setValue("logo_url", url)}
          maxSize={5 * 1024 * 1024}
          accept="image/jpeg,image/png"
          placeholder="Sube el logo de tu equipo (JPG o PNG)"
        />
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="Ej: +1 234 567 8900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            {...register("country")}
            placeholder="Ej: España"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="Ej: Av. Principal 123, Ciudad"
        />
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

      {/* Players Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Jugadores</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPlayer}>
            + Agregar Jugador
          </Button>
        </div>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {players.map((player) => (
            <div key={player.id} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
              <Input
                placeholder="Nombre"
                value={player.name}
                onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
              />
              <Input
                placeholder="Apellido"
                value={player.lastName}
                onChange={(e) => updatePlayer(player.id, 'lastName', e.target.value)}
              />
              <Input
                placeholder="ID/Cédula"
                value={player.idNumber}
                onChange={(e) => updatePlayer(player.id, 'idNumber', e.target.value)}
              />
              <Button type="button" variant="destructive" size="sm" onClick={() => removePlayer(player.id)}>
                ×
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Staff Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Cuerpo Técnico</Label>
          <Button type="button" variant="outline" size="sm" onClick={addStaff}>
            + Agregar Personal
          </Button>
        </div>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {technicalStaff.map((staff) => (
            <div key={staff.id} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
              <Input
                placeholder="Nombre"
                value={staff.name}
                onChange={(e) => updateStaff(staff.id, 'name', e.target.value)}
              />
              <Input
                placeholder="Apellido"
                value={staff.lastName}
                onChange={(e) => updateStaff(staff.id, 'lastName', e.target.value)}
              />
              <Input
                placeholder="Cargo"
                value={staff.position}
                onChange={(e) => updateStaff(staff.id, 'position', e.target.value)}
              />
              <Button type="button" variant="destructive" size="sm" onClick={() => removeStaff(staff.id)}>
                ×
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1"
        >
          Guardar Cambios
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" type="button">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Equipo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el equipo
                y todos sus datos asociados incluyendo jugadores y cuerpo técnico.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTeam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar Equipo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  );
};