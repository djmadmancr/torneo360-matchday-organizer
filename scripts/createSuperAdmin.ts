
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
  console.error('❌ Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  console.error('- SUPER_ADMIN_EMAIL')
  console.error('- SUPER_ADMIN_PASSWORD')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createSuperAdmin() {
  try {
    console.log('🔧 Creating super admin user...')
    
    // Check if user already exists in auth.users
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`)
    }

    const existingUser = existingUsers.users.find(user => user.email === SUPER_ADMIN_EMAIL)
    
    let authUserId: string

    if (existingUser) {
      console.log('👤 Super admin user already exists in auth.users')
      authUserId = existingUser.id
    } else {
      // Create user in auth.users using Admin API
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          full_name: 'Super Admin',
          role: 'admin'
        }
      })

      if (createError) {
        throw new Error(`Failed to create auth user: ${createError.message}`)
      }

      authUserId = authUser.user.id
      console.log('✅ Super admin user created in auth.users')
    }

    // Check if user already exists in public.users
    const { data: existingPublicUser, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(`Failed to check public.users: ${selectError.message}`)
    }

    if (existingPublicUser) {
      console.log('👤 Super admin user already exists in public.users')
    } else {
      // Insert user into public.users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUserId,
          email: SUPER_ADMIN_EMAIL,
          full_name: 'Super Admin',
          role: 'admin'
        })

      if (insertError) {
        throw new Error(`Failed to insert into public.users: ${insertError.message}`)
      }

      console.log('✅ Super admin user created in public.users')
    }

    console.log('🎉 Super admin setup completed successfully!')
    console.log(`📧 Email: ${SUPER_ADMIN_EMAIL}`)
    console.log('🔐 You can now login with the provided credentials')
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error)
    process.exit(1)
  }
}

// Run the script
createSuperAdmin()
