
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  roles?: string[]; // New field for multiple roles
  created_at?: string;
  auth_user_id?: string;
}

// Fetch all users
export const useUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure roles is an array
      return (data || []).map(user => ({
        ...user,
        roles: Array.isArray(user.roles) ? user.roles : 
               typeof user.roles === 'string' ? JSON.parse(user.roles) : 
               [user.role || 'team_admin']
      }));
    },
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password, full_name, roles }: { 
      email: string; 
      password: string; 
      full_name: string; 
      roles: string[]; 
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      console.log('Calling admin-create-user with:', { email, full_name, roles });
      
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { email, password, full_name, roles }
      });

      if (error) {
        console.error('Supabase function error:', error);
        // Try to extract more meaningful error from the response
        const errorMessage = error.message || error.details || 'Failed to create user';
        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error('No response from server');
      }

      if (!data.success) {
        console.error('Function returned error:', data);
        const errorMessage = data.error || 'Failed to create user';
        throw new Error(errorMessage);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, full_name, roles }: { 
      id: string; 
      full_name: string; 
      roles: string[]; 
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-update-user', {
        body: { id, full_name, roles }
      });

      if (error) {
        throw new Error(error.message || 'Failed to update user');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
};

// Toggle user active status
export const useToggleUserActive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-toggle-active', {
        body: { userId, active }
      });

      if (error) {
        throw new Error(error.message || 'Failed to toggle user status');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
};

// Reset user password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { email }
      });

      if (error) {
        throw new Error(error.message || 'Failed to reset password');
      }

      return data;
    }
  });
};
