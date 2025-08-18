import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

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

interface DemoUser {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'organizer' | 'referee' | 'team_admin';
  city?: string;
}

const DEMO_USERS: DemoUser[] = [
  { email: 'admin@demo.com', password: 'admin123', full_name: 'Admin Demo', role: 'admin' },
  { email: 'organizador1@demo.com', password: 'org123', full_name: 'Carlos Organizador', role: 'organizer', city: 'Madrid' },
  { email: 'organizador2@demo.com', password: 'org123', full_name: 'Ana Organizadora', role: 'organizer', city: 'Barcelona' },
  { email: 'arbitro1@demo.com', password: 'ref123', full_name: 'Pedro Árbitro', role: 'referee', city: 'Madrid' },
  { email: 'arbitro2@demo.com', password: 'ref123', full_name: 'Laura Árbitro', role: 'referee', city: 'Barcelona' },
  { email: 'equipo1@demo.com', password: 'team123', full_name: 'Capitán Águilas', role: 'team_admin', city: 'Madrid' },
  { email: 'equipo2@demo.com', password: 'team123', full_name: 'Capitán Leones', role: 'team_admin', city: 'Madrid' },
  { email: 'equipo3@demo.com', password: 'team123', full_name: 'Capitán Tigres', role: 'team_admin', city: 'Barcelona' },
  { email: 'equipo4@demo.com', password: 'team123', full_name: 'Capitán Lobos', role: 'team_admin', city: 'Barcelona' },
  { email: 'equipo5@demo.com', password: 'team123', full_name: 'Capitán Cóndores', role: 'team_admin', city: 'Valencia' },
];

const DEMO_TEAMS = [
  { name: 'FC Águilas', city: 'Madrid', colors: { primary: '#1e40af', secondary: '#ffffff' } },
  { name: 'CD Leones', city: 'Madrid', colors: { primary: '#dc2626', secondary: '#fbbf24' } },
  { name: 'UD Tigres', city: 'Barcelona', colors: { primary: '#f97316', secondary: '#000000' } },
  { name: 'CF Lobos', city: 'Barcelona', colors: { primary: '#6b7280', secondary: '#ffffff' } },
  { name: 'AD Cóndores', city: 'Valencia', colors: { primary: '#7c3aed', secondary: '#fbbf24' } },
];

const DEMO_TOURNAMENTS = [
  {
    name: 'Liga Regional de Madrid',
    description: 'Torneo regional de equipos de la Comunidad de Madrid',
    coverage: 'regional' as const,
    max_teams: 8,
    status: 'enrolling' as const,
    visibility: 'public' as const,
    start_date: '2024-03-01',
    end_date: '2024-05-15'
  },
  {
    name: 'Copa Nacional de Fútbol',
    description: 'Competición nacional de equipos de toda España',
    coverage: 'national' as const,
    max_teams: 16,
    status: 'enrolling' as const,
    visibility: 'public' as const,
    start_date: '2024-04-01',
    end_date: '2024-06-30'
  },
  {
    name: 'Torneo Privado Élite',
    description: 'Torneo exclusivo para equipos invitados',
    coverage: 'local' as const,
    max_teams: 4,
    status: 'enrolling' as const,
    visibility: 'private' as const,
    invite_codes: ['AGUIL01', 'LEONE02', 'TIGRE03'],
    start_date: '2024-02-15',
    end_date: '2024-03-30'
  }
];

async function createDemoData() {
  console.log('🌱 Starting demo data creation...');

  try {
    // 1. Create demo users
    console.log('\n👥 Creating demo users...');
    const userMap: Record<string, string> = {};

    for (const user of DEMO_USERS) {
      try {
        // Create auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { full_name: user.full_name }
        });

        if (authError && !authError.message.includes('already registered')) {
          throw authError;
        }

        const authUserId = authUser?.user?.id;
        if (authUserId) {
          userMap[user.email] = authUserId;

          // Create public user record
          await supabaseAdmin
            .from('users')
            .upsert({
              auth_user_id: authUserId,
              email: user.email,
              full_name: user.full_name,
              role: user.role,
              profile_data: user.city ? { city: user.city } : {}
            }, { onConflict: 'auth_user_id' });

          console.log(`  ✅ Created user: ${user.full_name} (${user.role})`);
        }
      } catch (error: any) {
        if (error.message?.includes('already registered')) {
          console.log(`  ⚠️  User ${user.email} already exists`);
        } else {
          console.error(`  ❌ Error creating user ${user.email}:`, error.message);
        }
      }
    }

    // 2. Get user IDs for organizers and team admins
    const { data: organizerUsers } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('role', 'organizer');

    const { data: teamUsers } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('role', 'team_admin');

    if (!organizerUsers || !teamUsers) {
      throw new Error('Could not fetch users');
    }

    // 3. Create demo teams
    console.log('\n⚽ Creating demo teams...');
    const teamMap: Record<string, string> = {};

    for (let i = 0; i < DEMO_TEAMS.length; i++) {
      const team = DEMO_TEAMS[i];
      const teamUser = teamUsers[i];
      
      if (teamUser) {
        const { data: newTeam, error: teamError } = await supabaseAdmin
          .from('teams')
          .insert({
            name: team.name,
            city: team.city,
            colors: team.colors,
            admin_user_id: teamUser.id,
            enrollment_status: 'approved'
          })
          .select()
          .single();

        if (teamError) {
          console.error(`  ❌ Error creating team ${team.name}:`, teamError.message);
        } else {
          teamMap[team.name] = newTeam.id;
          console.log(`  ✅ Created team: ${team.name}`);

          // Add some players to each team
          const players = [
            { name: `Portero ${team.name}`, position: 'Portero', jersey_number: 1, member_type: 'player' },
            { name: `Defensa ${team.name}`, position: 'Defensa', jersey_number: 2, member_type: 'player' },
            { name: `Centrocampista ${team.name}`, position: 'Centrocampista', jersey_number: 10, member_type: 'player' },
            { name: `Delantero ${team.name}`, position: 'Delantero', jersey_number: 9, member_type: 'player' },
            { name: `Entrenador ${team.name}`, position: null, jersey_number: null, member_type: 'coach' },
          ];

          await supabaseAdmin
            .from('team_members')
            .insert(
              players.map(player => ({
                team_id: newTeam.id,
                name: player.name,
                position: player.position,
                jersey_number: player.jersey_number,
                member_type: player.member_type
              }))
            );
        }
      }
    }

    // 4. Create demo tournaments
    console.log('\n🏆 Creating demo tournaments...');
    
    for (let i = 0; i < DEMO_TOURNAMENTS.length; i++) {
      const tournament = DEMO_TOURNAMENTS[i];
      const organizer = organizerUsers[i % organizerUsers.length];
      
      if (organizer) {
        const { data: newTournament, error: tournamentError } = await supabaseAdmin
          .from('tournaments')
          .insert({
            name: tournament.name,
            description: tournament.description,
            coverage: tournament.coverage,
            max_teams: tournament.max_teams,
            status: tournament.status,
            visibility: tournament.visibility,
            invite_codes: tournament.invite_codes || [],
            start_date: tournament.start_date,
            end_date: tournament.end_date,
            organizer_id: organizer.id
          })
          .select()
          .single();

        if (tournamentError) {
          console.error(`  ❌ Error creating tournament ${tournament.name}:`, tournamentError.message);
        } else {
          console.log(`  ✅ Created tournament: ${tournament.name}`);

          // 5. Create team registrations for the tournaments
          const teamsToRegister = Object.values(teamMap).slice(0, Math.min(4, tournament.max_teams));
          
          for (const teamId of teamsToRegister) {
            await supabaseAdmin
              .from('team_registrations')
              .insert({
                tournament_id: newTournament.id,
                team_id: teamId,
                status: Math.random() > 0.3 ? 'approved' : 'pending' // 70% approved, 30% pending
              });
          }

          console.log(`    → Registered ${teamsToRegister.length} teams`);
        }
      }
    }

    console.log('\n🎉 Demo data creation completed!');
    console.log('\n📋 Demo credentials:');
    DEMO_USERS.forEach(user => {
      console.log(`  ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  }
}

// Run the demo data creation
createDemoData().catch(console.error);