const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectFieldObs() {
  const { data, error } = await supabase.from('field_observations').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Sample field_observation:', data[0]);
    console.log('Columns:', Object.keys(data[0] || {}));
  }
}

inspectFieldObs();
