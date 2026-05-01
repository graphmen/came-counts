const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const gc = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'gamecount' } });

const MANA_SURVEY_ID = '2dc37ada-a5e3-4cc3-a732-54b22546ae20';

async function checkView() {
    const { data, error } = await gc
        .from('v_survey_species_totals')
        .select('*')
        .eq('survey_id', MANA_SURVEY_ID);
    
    if (error) console.error('View error:', error);
    else {
        console.log(`View results for Mana Pools 2025 (${data.length} species):`);
        console.log(JSON.stringify(data.slice(0, 5), null, 2));
    }
}

checkView();
