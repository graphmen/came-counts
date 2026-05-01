const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const gc = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'gamecount' } });

const MANA_SURVEY_ID = '2dc37ada-a5e3-4cc3-a732-54b22546ae20';

async function fixData() {
    console.log('Fixing orphaned Mana Pools records...');
    
    const { data, error } = await gc
        .from('field_observations')
        .update({ survey_id: MANA_SURVEY_ID })
        .eq('park_id', 'mana-pools')
        .is('survey_id', null);
    
    if (error) console.error('Fix error:', error);
    else console.log('Successfully linked orphaned Mana Pools records to Survey 2025.');
}

fixData();
