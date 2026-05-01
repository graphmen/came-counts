const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const gc = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'gamecount' } });

async function check() {
    const { data, error } = await gc
        .from('field_observations')
        .select('id, survey_id, park_id')
        .limit(10);
    
    console.log('Survey links:');
    if (data) {
        data.forEach(row => {
            console.log(`ID: ${row.id.substring(0,8)}... | Survey: ${row.survey_id} | Park: ${row.park_id}`);
        });
    }
}

check();
