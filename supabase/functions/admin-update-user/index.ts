import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { id, full_name, roles } = await req.json();

    if (!id || !full_name || !roles) {
      throw new Error('ID, full_name and roles are required');
    }

    // Update user in public.users table
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({
        full_name,
        roles: roles, // Store as JSON array
        role: roles.includes('admin') ? 'admin' : 
              roles.includes('organizer') ? 'organizer' :
              roles.includes('referee') ? 'referee' : 'team_admin'
      })
      .eq('id', id);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});