const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const pub = createClient(supabaseUrl, supabaseAnonKey);

async function findSurvey() {
    // 1. Find park ID for Mana Pools
    const { data: park } = await pub.from('parks').select('id, name').ilike('name', '%Mana Pools%').single();
    if (!park) return console.log('Park not found');
    console.log(`Found Park: ${park.name} (${park.id})`);

    // 2. Find survey ID for 2025
    const { data: survey } = await pub.from('surveys').select('id, year').eq('park_id', park.id).eq('year', 2025).single();
    if (!survey) return console.log('Survey not found for 2025');
    console.log(`Found Survey: ${survey.id} for year ${survey.year}`);
}

findSurvey();
