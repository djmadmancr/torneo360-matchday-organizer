
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocalStorageUser {
  id: string;
  email: string;
  username: string;
  password: string;
  tipos: string[];
  nombre: string;
  activo: boolean;
  fechaCreacion: string;
  perfiles: any;
}

interface LocalStorageTournament {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  formato: string;
  fechaInicio: string;
  fechaFin: string;
  logo: string;
  maxEquipos: number;
  equiposInscritos: number;
  estado: string;
  organizadorId?: string;
}

export const migrateLocalStorageToSupabase = async () => {
  try {
    console.log('🔄 Starting data migration from localStorage to Supabase...');
    
    // Check if migration has already been done
    const migrationFlag = localStorage.getItem('supabaseMigrationCompleted');
    if (migrationFlag === 'true') {
      console.log('✅ Migration already completed');
      return;
    }

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log('❌ No authenticated user found for migration');
      return;
    }

    let migratedCount = 0;

    // Migrate tournaments
    const tournamentsData = localStorage.getItem('torneos');
    if (tournamentsData) {
      try {
        const tournaments: LocalStorageTournament[] = JSON.parse(tournamentsData);
        console.log(`📦 Found ${tournaments.length} tournaments to migrate`);

        for (const tournament of tournaments) {
          // Get the current user as organizer
          const { data: currentUser } = await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', session.user.id)
            .single();

          if (currentUser) {
            const { error } = await supabase
              .from('tournaments')
              .insert({
                name: tournament.nombre,
                description: `Migrated tournament - ${tournament.categoria}`,
                start_date: tournament.fechaInicio || null,
                end_date: tournament.fechaFin || null,
                status: tournament.estado === 'activo' ? 'enrolling' : 'finished',
                max_teams: tournament.maxEquipos || 16,
                organizer_id: currentUser.id,
                tournament_data: {
                  legacy_id: tournament.id,
                  categoria: tournament.categoria,
                  tipo: tournament.tipo,
                  formato: tournament.formato,
                  logo: tournament.logo
                }
              });

            if (!error) {
              migratedCount++;
              console.log(`✅ Migrated tournament: ${tournament.nombre}`);
            } else {
              console.error(`❌ Failed to migrate tournament ${tournament.nombre}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error migrating tournaments:', error);
      }
    }

    // Migrate teams data
    const equiposData = localStorage.getItem('equipos');
    if (equiposData) {
      try {
        const teams = JSON.parse(equiposData);
        console.log(`📦 Found ${teams.length} teams to migrate`);

        for (const team of teams) {
          // Find a tournament to associate with (use first available)
          const { data: tournaments } = await supabase
            .from('tournaments')
            .select('id')
            .limit(1);

          if (tournaments && tournaments.length > 0) {
            const { data: currentUser } = await supabase
              .from('users')
              .select('id')
              .eq('auth_user_id', session.user.id)
              .single();

            if (currentUser) {
              const { data: insertedTeam, error } = await supabase
                .from('teams')
                .insert({
                  tournament_id: tournaments[0].id,
                  admin_user_id: currentUser.id,
                  name: team.nombre || team.name || 'Migrated Team',
                  logo_url: team.logo,
                  colors: team.colores || team.colors || {},
                  enrollment_status: 'approved',
                  team_data: {
                    legacy_id: team.id,
                    categoria: team.categoria,
                    entrenador: team.entrenador
                  }
                })
                .select()
                .single();

              if (!error && insertedTeam) {
                migratedCount++;
                console.log(`✅ Migrated team: ${team.nombre || team.name}`);

                // Migrate team members
                const jugadores = team.jugadores || [];
                const coaches = team.coaches || [];
                const allMembers = [
                  ...jugadores.map((j: any) => ({ ...j, member_type: 'player' })),
                  ...coaches.map((c: any) => ({ ...c, member_type: 'coach' }))
                ];

                for (const member of allMembers) {
                  const { error: memberError } = await supabase
                    .from('team_members')
                    .insert({
                      team_id: insertedTeam.id,
                      name: member.nombre || member.name || 'Unknown',
                      position: member.posicion || member.position,
                      jersey_number: member.numero || member.jerseyNumber,
                      member_type: member.member_type,
                      member_data: {
                        legacy_data: member
                      }
                    });

                  if (!memberError) {
                    console.log(`✅ Migrated member: ${member.nombre || member.name}`);
                  }
                }
              } else {
                console.error(`❌ Failed to migrate team ${team.nombre}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error migrating teams:', error);
      }
    }

    // Clean up localStorage keys after successful migration
    const keysToRemove = [
      'globalLinkSoccerUsers',
      'globalLinkSoccerUser',
      'globalLinkSoccerCurrentProfile',
      'torneos',
      'equipos',
      'userLogs'
    ];

    // Also remove any keys that match patterns for inscriptions, partidos, etc.
    const allKeys = Object.keys(localStorage);
    const patternKeys = allKeys.filter(key => 
      key.includes('inscripcion_') || 
      key.includes('partidos_') || 
      key.includes('resultados_') ||
      key.startsWith('equipo_') ||
      key.startsWith('team_')
    );

    [...keysToRemove, ...patternKeys].forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed localStorage key: ${key}`);
    });

    // Mark migration as completed
    localStorage.setItem('supabaseMigrationCompleted', 'true');
    
    console.log(`✅ Migration completed! Migrated ${migratedCount} items`);
    toast.success(`Migration completed! Migrated ${migratedCount} items to Supabase`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    toast.error('Migration failed. Please try again.');
  }
};

export const checkAndRunMigration = async () => {
  const migrationFlag = localStorage.getItem('supabaseMigrationCompleted');
  if (migrationFlag !== 'true') {
    // Check if there's any legacy data to migrate
    const hasLegacyData = 
      localStorage.getItem('globalLinkSoccerUsers') ||
      localStorage.getItem('torneos') ||
      localStorage.getItem('equipos');

    if (hasLegacyData) {
      console.log('🔍 Legacy data detected, starting migration...');
      await migrateLocalStorageToSupabase();
    } else {
      // No legacy data, mark as completed
      localStorage.setItem('supabaseMigrationCompleted', 'true');
    }
  }
};
