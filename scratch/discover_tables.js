const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function discoverTables() {
  // Querying a table that we know exists to verify connection
  const { data: parks } = await supabase.from('parks').select('name').limit(1);
  console.log('Parks:', parks);

  // Try to find all tables via a hacky way (PostgREST doesn't expose this easily without RPC)
  // But we can check for common names
  const candidates = [
    'field_observations', 
    'observations', 
    'transect_observations', 
    'static_observations', 
    'survey_results',
    'surveys',
    'transects',
    'static_sites',
    'species'
  ];

  for (const table of candidates) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: FOUND`);
    }
  }
}

discoverTables();
