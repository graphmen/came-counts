const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function blindInsert() {
  console.log('🚀 Attempting Blind Insert into field_observations...');
  
  const { error } = await supabase
    .from('field_observations')
    .insert({
      payload: { test: 'handshake_final' }
    });

  if (error) {
    console.error('❌ Insert Failed:', error.message);
  } else {
    console.log('✅ Insert Successful! The table is live.');
  }
}

blindInsert();
