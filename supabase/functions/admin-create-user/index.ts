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
  password: z.string().min(6), // Cambiado de 8 a 6 para coincidir con los logs
  full_name: z.string().min(1),
  roles: z.array(z.enum(['admin', 'organizer', 'referee', 'team_admin'])).min(1),
  city: z.string().optional(),
  country: z.string().optional()
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
    console.log('Request body received:', { ...body, password: body.password ? '[REDACTED]' : 'MISSING' });
    
    // Validate that required fields exist
    if (!body.email) {
      throw new Error('Email is required');
    }
    if (!body.password) {
      throw new Error('Password is required');
    }
    if (!body.full_name) {
      throw new Error('Full name is required');
    }
    if (!body.roles || !Array.isArray(body.roles) || body.roles.length === 0) {
      console.error('Invalid roles:', body.roles);
      throw new Error('At least one role must be specified');
    }
    
    const { email, password, full_name, roles, city, country } = CreateUserSchema.parse(body);
    console.log('Validation successful for:', { email, full_name, roles, city, country });

    // Check if email already exists in auth.users
    console.log('Checking if email exists in auth.users:', email);
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingAuthUser.users.some(user => user.email === email);
    
    if (emailExists) {
      console.error('Email already exists in auth.users:', email);
      throw new Error(`Este correo electrónico ya está registrado en el sistema de autenticación`);
    }

    // Check if email already exists in users table BEFORE creating auth user
    console.log('Checking if email exists in users table:', email);
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, auth_user_id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      console.error('Email already exists in users table:', email);
      throw new Error(`Este correo electrónico ya está registrado`);
    }

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
                    
    const userData: any = {
      auth_user_id: authUser.user.id,
      email,
      full_name,
      roles: roles, // Store as JSON array
      role: userRole
    };

    // Add city and country for referee profiles
    if (city) userData.city = city;
    if (country) userData.country = country;

    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert(userData);

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    console.log('User created successfully in database');

    return new Response(
      JSON.stringify({ ok: true, id: authUser.user.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );
  } catch (err) {
    console.error('admin-create-user error', err);
    
    const msg = err instanceof Error ? err.message : 'unknown error';
    
    // User-friendly error messages
    let userMessage = msg;
    if (msg.includes('duplicate key value violates unique constraint')) {
      if (msg.includes('users_email_key')) {
        userMessage = 'Este correo electrónico ya está registrado';
      } else {
        userMessage = 'Ya existe un registro con estos datos';
      }
    } else if (msg.includes('violates not-null constraint')) {
      userMessage = 'Faltan datos requeridos';
    } else if (err instanceof z.ZodError) {
      userMessage = `Validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
    }
    
    // Return error in the format expected by supabase.functions.invoke
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        details: msg 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Always use 400 for function errors to ensure proper handling
      }
    );
  }
});