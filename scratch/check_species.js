const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const gc = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'gamecount' } });
const pub = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data: gcSpec, error: gcErr } = await gc.from('species').select('common_name').limit(1);
    console.log('Species in gamecount:', gcSpec ? 'Found' : 'Missing', gcErr ? gcErr.message : '');

    const { data: pubSpec, error: pubErr } = await pub.from('species').select('common_name').limit(1);
    console.log('Species in public:', pubSpec ? 'Found' : 'Missing', pubErr ? pubErr.message : '');
}

check();
