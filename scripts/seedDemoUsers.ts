import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface DemoUser {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'organizer' | 'referee' | 'team_admin';
}

const DEMO_USERS: DemoUser[] = [
  { email: 'admin@demo.com', password: 'admin123', full_name: 'Demo Admin', role: 'admin' },
  { email: 'organizer@demo.com', password: 'organizer123', full_name: 'Demo Organizer', role: 'organizer' },
  { email: 'referee@demo.com', password: 'referee123', full_name: 'Demo Referee', role: 'referee' },
  { email: 'team@demo.com', password: 'team123', full_name: 'Demo Team', role: 'team_admin' }
];

const SUPABASE_URL = "https://aiqexycpxikjmvatrsej.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedDemoUsers() {
  console.log('🌱 Starting demo users seeding...');

  for (const demoUser of DEMO_USERS) {
    try {
      console.log(`\n👤 Processing user: ${demoUser.email}`);

      // Check if user exists in auth
      const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(demoUser.email);

      let authUserId: string;

      if (getUserError || !existingUser.user) {
        // Create user in auth if not exists
        console.log(`  📝 Creating auth user for ${demoUser.email}...`);
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: demoUser.email,
          password: demoUser.password,
          email_confirm: true,
          user_metadata: { full_name: demoUser.full_name }
        });

        if (createError) {
          console.error(`  ❌ Error creating auth user: ${createError.message}`);
          continue;
        }

        authUserId = newUser.user.id;
        console.log(`  ✅ Auth user created with ID: ${authUserId}`);
      } else {
        authUserId = existingUser.user.id;
        console.log(`  ℹ️  Auth user already exists with ID: ${authUserId}`);
      }

      // Upsert user in public.users table
      console.log(`  📝 Upserting user in public.users table...`);
      const { error: upsertError } = await supabaseAdmin
        .from('users')
        .upsert({
          auth_user_id: authUserId,
          email: demoUser.email,
          full_name: demoUser.full_name,
          role: demoUser.role
        }, {
          onConflict: 'auth_user_id'
        });

      if (upsertError) {
        console.error(`  ❌ Error upserting user in public.users: ${upsertError.message}`);
        continue;
      }

      console.log(`  ✅ User ${demoUser.email} (${demoUser.role}) seeded successfully`);

    } catch (error) {
      console.error(`  ❌ Error processing user ${demoUser.email}:`, error);
    }
  }

  console.log('\n🎉 Demo users seeding completed!');
  console.log('\n📋 Demo credentials:');
  DEMO_USERS.forEach(user => {
    console.log(`  ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });
}

// Run the seeding
seedDemoUsers().catch(console.error);