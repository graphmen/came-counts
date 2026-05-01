const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMetadata() {
  const { data: parks } = await supabase.from('parks').select('id, name');
  console.log('Parks:', parks);
  
  const { data: species } = await supabase.from('species').select('id, common_name').limit(5);
  console.log('Species:', species);
}

findMetadata();
