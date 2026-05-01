const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const gc = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'gamecount' } });

async function check() {
    const { data, error } = await gc
        .from('field_observations')
        .select('id, species_id, species_name, payload')
        .limit(5);
    
    console.log('Species info:');
    if (data) {
        data.forEach(row => {
            console.log(`ID: ${row.id.substring(0,8)} | Col ID: ${row.species_id} | Col Name: ${row.species_name} | Payload ID: ${row.payload.species_id}`);
        });
    }
}

check();
