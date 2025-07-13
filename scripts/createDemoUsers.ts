
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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

async function createDemoUsers() {
  console.log('🔧 Creating demo users...')
  
  for (const userData of demoUsers) {
    try {
      console.log(`\n👤 Creating user: ${userData.email}`)
      
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers.users.find(user => user.email === userData.email)
      
      let authUserId: string
      
      if (existingUser) {
        console.log(`  ✅ Auth user already exists: ${userData.email}`)
        authUserId = existingUser.id
      } else {
        // Create user in auth.users
        const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name,
            role: userData.role
          }
        })

        if (createError) {
          console.error(`  ❌ Failed to create auth user: ${createError.message}`)
          continue
        }

        authUserId = authUser.user.id
        console.log(`  ✅ Auth user created: ${userData.email}`)
      }

      // Check if user exists in public.users
      const { data: existingPublicUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        console.error(`  ❌ Error checking public.users: ${selectError.message}`)
        continue
      }

      if (existingPublicUser) {
        console.log(`  ✅ Public user already exists: ${userData.email}`)
      } else {
        // Insert into public.users
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            auth_user_id: authUserId,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role
          })

        if (insertError) {
          console.error(`  ❌ Failed to insert public user: ${insertError.message}`)
          continue
        }

        console.log(`  ✅ Public user created: ${userData.email}`)
      }
      
    } catch (error) {
      console.error(`  ❌ Error processing ${userData.email}:`, error)
    }
  }

  console.log('\n🎉 Demo users setup completed!')
  console.log('\n📋 Demo Credentials:')
  console.log('==========================================')
  demoUsers.forEach(user => {
    console.log(`${user.role.toUpperCase()}:`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Password: ${user.password}`)
    console.log(`  Role: ${user.role}`)
    console.log('')
  })
  console.log('==========================================')
  console.log('🔐 You can now login with any of these credentials')
}

createDemoUsers()
