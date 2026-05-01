const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const gc = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'gamecount' } });

async function check() {
    // 1. Check one observation
    const { data: obs, error: obsErr } = await gc.from('field_observations').select('*').limit(1);
    console.log('Observation Sample:', JSON.stringify(obs, null, 2));

    // 2. Check the view definition (via a query)
    const { data: viewSample, error: viewErr } = await gc.from('v_survey_species_totals').select('*').limit(1);
    console.log('View Sample:', JSON.stringify(viewSample, null, 2));
}

check();
