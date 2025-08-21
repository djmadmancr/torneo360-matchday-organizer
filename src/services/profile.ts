import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const ProfileSchema = z.object({
  full_name: z.string().min(1, "El nombre es requerido"),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: ProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("users")
        .update(payload)
        .eq("auth_user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// Change user password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      });

      if (signInError) {
        throw new Error("La contraseña actual es incorrecta");
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw new Error(error.message || "Error al cambiar la contraseña");
      
      return { success: true };
    }
  });
};