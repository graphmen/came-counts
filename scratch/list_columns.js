const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const gc = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'gamecount' } });

async function check() {
    // Select all columns from one row
    const { data, error } = await gc.from('field_observations').select('*').limit(1);
    if (data && data.length > 0) {
        console.log('Columns available:', Object.keys(data[0]));
    } else {
        console.log('No data found in field_observations');
    }
}

check();
