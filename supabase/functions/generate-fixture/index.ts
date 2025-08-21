import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Team {
  id: string;
  name: string;
}

interface Fixture {
  tournament_id: string;
  match_day: number;
  home_team_id: string;
  away_team_id: string;
  status: string;
  kickoff: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { tournament_id } = await req.json();

    if (!tournament_id) {
      return new Response(
        JSON.stringify({ error: 'tournament_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating fixture for tournament: ${tournament_id}`);

    // Verify tournament exists and get organizer info
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name, organizer_id, status')
      .eq('id', tournament_id)
      .single();

    if (tournamentError || !tournament) {
      console.error('Tournament not found:', tournamentError);
      return new Response(
        JSON.stringify({ error: 'Tournament not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get approved teams for this tournament
    const { data: registrations, error: regError } = await supabase
      .from('team_registrations')
      .select(`
        team_id,
        teams(id, name)
      `)
      .eq('tournament_id', tournament_id)
      .eq('status', 'approved');

    if (regError) {
      console.error('Error fetching registrations:', regError);
      return new Response(
        JSON.stringify({ error: 'Error fetching teams' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const teams: Team[] = registrations?.map(reg => reg.teams).filter(Boolean) || [];

    if (teams.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Need at least 2 approved teams to generate fixture' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${teams.length} approved teams`);

    // Check if fixtures already exist
    const { data: existingFixtures } = await supabase
      .from('fixtures')
      .select('id')
      .eq('tournament_id', tournament_id)
      .limit(1);

    if (existingFixtures && existingFixtures.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Fixtures already generated for this tournament' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate round-robin fixtures
    const fixtures: Fixture[] = [];
    let matchDay = 1;

    // Calculate start date (1 week from now)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Add 7 days
    
    // Set to next Sunday if not already a Sunday (assuming matches on weekends)
    const daysUntilSunday = (7 - startDate.getDay()) % 7;
    if (daysUntilSunday > 0) {
      startDate.setDate(startDate.getDate() + daysUntilSunday);
    }

    // Round-robin algorithm
    const numTeams = teams.length;
    const isOdd = numTeams % 2 === 1;
    const totalTeams = isOdd ? numTeams + 1 : numTeams;
    const rounds = totalTeams - 1;
    const matchesPerRound = totalTeams / 2;

    // Create a list of team indices
    const teamIndices = Array.from({ length: totalTeams }, (_, i) => i);
    
    for (let round = 0; round < rounds; round++) {
      // Calculate match date for this round (each round is on consecutive weekends)
      const matchDate = new Date(startDate);
      matchDate.setDate(startDate.getDate() + (round * 7)); // Each round is 1 week apart
      
      let matchTime = 15; // Start at 3 PM (15:00)
      
      for (let match = 0; match < matchesPerRound; match++) {
        const home = teamIndices[match];
        const away = teamIndices[totalTeams - 1 - match];

        // Skip if one of the teams is the "bye" team (only exists if odd number of teams)
        if (isOdd && (home >= numTeams || away >= numTeams)) {
          continue;
        }

        // Create kickoff time for this match
        const kickoffTime = new Date(matchDate);
        kickoffTime.setHours(matchTime, 0, 0, 0); // Set specific hour
        
        fixtures.push({
          tournament_id,
          match_day: matchDay,
          home_team_id: teams[home].id,
          away_team_id: teams[away].id,
          status: 'scheduled',
          kickoff: kickoffTime.toISOString()
        });
        
        // Increment match time by 2 hours for next match
        matchTime += 2;
        if (matchTime > 21) { // Don't schedule matches after 9 PM
          matchTime = 15; // Reset to 3 PM for next day (though this is basic logic)
        }
      }

      // Rotate teams (keep first team fixed, rotate others)
      const lastTeam = teamIndices.pop()!;
      teamIndices.splice(1, 0, lastTeam);
      
      matchDay++;
    }

    console.log(`Generated ${fixtures.length} fixtures`);

    // Get available referees for auto-assignment
    const { data: referees } = await supabase
      .from('users')
      .select('id')
      .or('role.eq.referee,roles.cs.["referee"]')
      .order('full_name');

    // Auto-assign referees if available
    if (referees && referees.length > 0) {
      console.log(`Found ${referees.length} available referees for auto-assignment`);
      
      const fixturesWithReferees = fixtures.map((fixture, index) => ({
        ...fixture,
        referee_id: referees[index % referees.length].id // Round-robin assignment
      }));
      
      // Insert fixtures with referee assignments
      const { error: fixtureError } = await supabase
        .from('fixtures')
        .insert(fixturesWithReferees);

      if (fixtureError) {
        console.error('Error inserting fixtures:', fixtureError);
        return new Response(
          JSON.stringify({ error: 'Error creating fixtures' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Auto-assigned referees to ${fixtures.length} fixtures`);
    } else {
      // Insert fixtures without referee assignments
      const { error: fixtureError } = await supabase
        .from('fixtures')
        .insert(fixtures);

      if (fixtureError) {
        console.error('Error inserting fixtures:', fixtureError);
        return new Response(
          JSON.stringify({ error: 'Error creating fixtures' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('No referees available for auto-assignment');
    }

    // Update tournament status to scheduled
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ status: 'scheduled' })
      .eq('id', tournament_id);

    if (updateError) {
      console.error('Error updating tournament status:', updateError);
      // Non-critical error, continue
    }

    console.log(`Successfully generated fixture for tournament ${tournament_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        fixtures_created: fixtures.length,
        match_days: matchDay - 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-fixture function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
