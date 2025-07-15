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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { userId, active } = await req.json();

    if (!userId || typeof active !== 'boolean') {
      throw new Error('userId and active status are required');
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check if the requesting user is an admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role, roles')
      .eq('auth_user_id', user.id)
      .single();

    if (adminError || !adminUser) {
      throw new Error('User not found');
    }

    const isAdmin = adminUser.role === 'admin' || 
                    (Array.isArray(adminUser.roles) && adminUser.roles.includes('admin'));

    if (!isAdmin) {
      throw new Error('Forbidden - Admin access required');
    }

    // Toggle user active status in auth
    const { error: toggleError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { ban_duration: active ? 'none' : '876000h' } // Ban for 100 years if inactive
    );

    if (toggleError) {
      throw new Error(`Failed to toggle user status: ${toggleError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `User ${active ? 'activated' : 'deactivated'} successfully` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error toggling user status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});