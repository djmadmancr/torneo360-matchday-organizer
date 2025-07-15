import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  roles: z.array(z.enum(['admin', 'organizer', 'referee', 'team_admin']))
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Admin create user function called');
    
    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey });
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

    // Parse and validate request body
    const body = await req.json();
    console.log('Request body received:', { ...body, password: '[REDACTED]' });
    
    // Validate that roles is not empty
    if (!body.roles || !Array.isArray(body.roles) || body.roles.length === 0) {
      console.error('Invalid roles:', body.roles);
      throw new Error('At least one role must be specified');
    }
    
    const { email, password, full_name, roles } = CreateUserSchema.parse(body);
    console.log('Validation successful for:', { email, full_name, roles });

    // Create user in auth
    console.log('Creating user in auth:', email);
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Auth error: ${authError.message}`);
    }
    
    console.log('Auth user created successfully:', authUser.user.id);

    // Create user in public.users table with roles
    console.log('Creating user in public.users table');
    const userRole = roles.includes('admin') ? 'admin' : 
                    roles.includes('organizer') ? 'organizer' :
                    roles.includes('referee') ? 'referee' : 'team_admin';
                    
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authUser.user.id,
        email,
        full_name,
        roles: roles, // Store as JSON array
        role: userRole
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    console.log('User created successfully in database');

    return new Response(
      JSON.stringify({ success: true, user: authUser.user }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Return different status codes based on error type
    const isValidationError = error instanceof z.ZodError;
    const statusCode = isValidationError ? 400 : 500;
    
    const errorMessage = isValidationError 
      ? `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      : error.message || 'Internal server error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});