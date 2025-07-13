
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const toggleActiveSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  active: z.boolean('Active status must be a boolean'),
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
  if (req.method !== 'POST') {
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
    const validation = toggleActiveSchema.safeParse(requestBody);
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

    const { userId, active } = validation.data;

    // Get the auth_user_id for the user to toggle
    const { data: targetUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('auth_user_id')
      .eq('id', userId)
      .single();

    if (fetchError || !targetUser) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'User not found' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update user status in auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.auth_user_id,
      { ban_duration: active ? 'none' : '876000h' } // ~100 years for disable
    );

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
      data: { userId, active } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Toggle user active error:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message || 'Internal server error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
