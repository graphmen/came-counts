const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'gamecount' }
});

async function checkSchema() {
  console.log('Checking gamecount.field_observations...');
  const { data, error } = await supabase
    .from('field_observations')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error querying field_observations:', error.message);
    return;
  }

  console.log('✅ table gamecount.field_observations FOUND');
  if (data && data.length > 0) {
    console.log('Sample record keys:', Object.keys(data[0]));
  } else {
    console.log('No records found, but table exists.');
    // Try to get column names via a trick if select * works
    const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'field_observations' });
    if (colError) {
        console.log('Could not fetch columns via RPC.');
    } else {
        console.log('Columns:', cols);
    }
  }
}

checkSchema();
