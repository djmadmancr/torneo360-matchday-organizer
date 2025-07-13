
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const demoUsers = [
      {
        email: 'admin@demo.com',
        password: 'admin123',
        full_name: 'Demo Admin',
        role: 'admin'
      },
      {
        email: 'organizer@demo.com',
        password: 'organizer123',
        full_name: 'Demo Organizer',
        role: 'organizer'
      },
      {
        email: 'referee@demo.com',
        password: 'referee123',
        full_name: 'Demo Referee',
        role: 'referee'
      },
      {
        email: 'team@demo.com',
        password: 'team123',
        full_name: 'Demo Team Admin',
        role: 'team_admin'
      }
    ]

    const results = []

    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers.users.find(user => user.email === userData.email)
        
        let authUserId: string
        
        if (existingUser) {
          authUserId = existingUser.id
          results.push({ email: userData.email, status: 'already_exists' })
        } else {
          // Create user in auth
          const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
            user_metadata: {
              full_name: userData.full_name,
              role: userData.role
            }
          })

          if (createError) {
            results.push({ email: userData.email, status: 'error', error: createError.message })
            continue
          }

          authUserId = authUser.user.id
          results.push({ email: userData.email, status: 'created_auth' })
        }

        // Check if user exists in public.users
        const { data: existingPublicUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth_user_id', authUserId)
          .single()

        if (!existingPublicUser) {
          // Insert into public.users
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              auth_user_id: authUserId,
              email: userData.email,
              full_name: userData.full_name,
              role: userData.role
            })

          if (insertError) {
            results.push({ email: userData.email, status: 'error', error: insertError.message })
            continue
          }
        }

        results.push({ email: userData.email, status: 'success' })
      } catch (error) {
        results.push({ email: userData.email, status: 'error', error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
