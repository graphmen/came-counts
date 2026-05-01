const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // Querying a known table in public schema
  const { data: p, error: pe } = await supabase.from('parks').select('id').limit(1);
  console.log('Public Parks:', p ? '✅ FOUND' : '❌ ' + pe.message);

  // Trying to find field_observations again
  const { data: fo, error: foe } = await supabase.from('field_observations').select('id').limit(1);
  if (foe) {
    console.log('❌ field_observations:', foe.message);
    if (foe.hint) console.log('Hint:', foe.hint);
  } else {
    console.log('✅ field_observations: FOUND');
  }
}

checkSchema();
