const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepSearch() {
  const { data, error } = await supabase.rpc('get_tables'); // Hope this exists
  if (error) {
     console.log('RPC failed. Trying to query pg_catalog via raw SQL if possible...');
     // Can't do raw SQL without service role or special setup.
     
     // Let's try to query field_observations again but with a different client config
     const { data: test, error: err } = await supabase.from('field_observations').select('*').limit(1);
     console.log('Result:', test, 'Error:', err);
  }
}

deepSearch();
