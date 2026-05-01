const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const gc = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'gamecount' } });

async function check() {
    const { data, error } = await gc
        .from('field_observations')
        .select('id, park_id, species_name, synced_at')
        .order('synced_at', { ascending: false })
        .limit(10);
    
    console.log('Top level columns for last 10 syncs:');
    if (data) {
        data.forEach(row => {
            console.log(`ID: ${row.id.substring(0,8)}... | Park: ${row.park_id} | Species: ${row.species_name} | Synced: ${row.synced_at}`);
        });
    } else {
        console.log('No data or error:', error);
    }
}

check();
