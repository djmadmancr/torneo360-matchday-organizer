import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReferees = () => {
  return useQuery({
    queryKey: ['referees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('role', 'referee')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });
};