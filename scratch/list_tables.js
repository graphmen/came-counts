const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // If a custom RPC exists
  if (error) {
    console.log('RPC get_tables failed, trying direct query...');
    // Try to query a common table and see if it works
    const tables = ['parks', 'species', 'surveys', 'transects', 'transect_observations', 'static_observations', 'observations'];
    for (const t of tables) {
      const { error } = await supabase.from(t).select('id').limit(1);
      console.log(`Table '${t}': ${error ? '❌ ' + error.message : '✅ FOUND'}`);
    }
  } else {
    console.log('Tables:', data);
  }
}

listTables();
