const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const gc = createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'gamecount' }
});

async function checkParks() {
    const { data, error } = await gc.from('parks').select('*');
    if (error) {
        console.error('Error fetching parks:', error);
        return;
    }
    console.log('Parks count:', data.length);
    data.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
}

checkParks();
