import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReferees = () => {
  return useQuery({
    queryKey: ['referees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, referee_credential, city, country, profile_data')
        .or('role.eq.referee,roles.cs.["referee"]')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });
};