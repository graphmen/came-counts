const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const supabase = createClient(supabaseUrl, supabaseAnonKey); // Default schema is public

async function checkPublic() {
    console.log('--- Checking Public Schema ---');
    const { data: parks, error: pErr } = await supabase.from('parks').select('*');
    if (pErr) console.error('Parks error:', pErr);
    else {
        console.log('Parks in public:', parks.length);
        parks.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
    }

    const { data: surveys, error: sErr } = await supabase.from('surveys').select('*');
    if (sErr) console.error('Surveys error:', sErr);
    else console.log('Surveys in public:', surveys.length);
}

checkPublic();
