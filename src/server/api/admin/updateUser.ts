
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const updateUserSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  full_name: z.string().min(1, 'Full name is required'),
  roles: z.array(z.enum(['admin', 'organizer', 'referee', 'team_admin'])).min(1, 'At least one role is required'),
});

const supabaseUrl = 'https://aiqexycpxikjmvatrsej.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default async function handler(req: Request) {
  if (req.method !== 'PUT') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check if user is admin
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden - Admin access required' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const requestBody = await req.json();
    
    // Validate request body
    const validation = updateUserSchema.safeParse(requestBody);
    if (!validation.success) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Validation failed', 
        details: validation.error.issues 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id, full_name, roles } = validation.data;

    // Update user in public.users
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        full_name, 
        role: roles[0], // Primary role for backward compatibility
        roles: roles 
      })
      .eq('id', id);

    if (updateError) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: updateError.message 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      data: { id, full_name, roles } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message || 'Internal server error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
