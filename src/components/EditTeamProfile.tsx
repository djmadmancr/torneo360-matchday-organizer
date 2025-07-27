import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";
import { useTeam, TeamMemberInsert } from "@/hooks/useTeams";
import { ImageUpload } from "@/components/ImageUpload";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Plus, Users } from "lucide-react";

const TeamProfileSchema = z.object({
  name: z.string().min(1, "El nombre del equipo es requerido"),
  logo_url: z.string().optional(),
  colors: z.object({
    principal: z.string(),
    secundario: z.string()
  }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional()
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
  const { team, updateTeam, deleteTeam, addTeamMember, updateTeamMember, removeTeamMember } = useTeam(teamId);
  const [newMember, setNewMember] = useState<{ name: string; position: string; member_type: 'player' | 'staff' }>({ name: '', position: '', member_type: 'player' });

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
      country: initialData.team_data?.country || ""
    },
  });

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
          country: data.country
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

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.position) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      await addTeamMember({
        team_id: teamId,
        name: newMember.name,
        position: newMember.position,
        member_type: newMember.member_type
      });
      setNewMember({ name: '', position: '', member_type: 'player' });
      toast.success("Miembro agregado correctamente");
    } catch (error) {
      toast.error("Error al agregar miembro");
      console.error(error);
    }
  };

  const handleUpdateMember = async (memberId: string, updates: Partial<{ name: string; position: string; member_type: string }>) => {
    try {
      await updateTeamMember({ memberId, ...updates });
      toast.success("Miembro actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar miembro");
      console.error(error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeTeamMember(memberId);
      toast.success("Miembro eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar miembro");
      console.error(error);
    }
  };

  const players = team?.team_members?.filter(member => member.member_type === 'player') || [];
  const technicalStaff = team?.team_members?.filter(member => member.member_type === 'staff') || [];

  return (
    <Tabs defaultValue="info" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="info">Información del Equipo</TabsTrigger>
        <TabsTrigger value="members" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Plantel ({(players.length + technicalStaff.length)})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info">
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
    </TabsContent>

    <TabsContent value="members" className="space-y-6">
      {/* Add New Member */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold">Agregar Nuevo Miembro</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Nombre Completo</Label>
            <Input
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <Label>Posición/Cargo</Label>
            <Input
              value={newMember.position}
              onChange={(e) => setNewMember({...newMember, position: e.target.value})}
              placeholder="Posición o cargo"
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select 
              value={newMember.member_type} 
              onValueChange={(value: 'player' | 'staff') => setNewMember({...newMember, member_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Jugador</SelectItem>
                <SelectItem value="staff">Cuerpo Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddMember} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Jugadores ({players.length})</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <Input
                    value={player.name}
                    onChange={(e) => handleUpdateMember(player.id, { name: e.target.value })}
                    placeholder="Nombre"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={player.position || ''}
                    onChange={(e) => handleUpdateMember(player.id, { position: e.target.value })}
                    placeholder="Posición"
                  />
                </div>
                {player.jersey_number && (
                  <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    #{player.jersey_number}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMember(player.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {players.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay jugadores registrados
            </div>
          )}
        </div>
      </div>

      {/* Technical Staff List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cuerpo Técnico ({technicalStaff.length})</h3>
        <div className="space-y-2">
          {technicalStaff.map((staff) => (
            <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <Input
                    value={staff.name}
                    onChange={(e) => handleUpdateMember(staff.id, { name: e.target.value })}
                    placeholder="Nombre"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={staff.position || ''}
                    onChange={(e) => handleUpdateMember(staff.id, { position: e.target.value })}
                    placeholder="Cargo"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMember(staff.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {technicalStaff.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay cuerpo técnico registrado
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  </Tabs>
  );
};