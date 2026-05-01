const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function performDigitalHandshake() {
  console.log('🛰️  Initiating Digital Handshake: Mobile Node -> Operational Hub');
  
  // 1. Get valid IDs
  const { data: pList } = await supabase.from('parks').select('id, name').eq('name', 'Mana Pools National Park');
  const park = pList ? pList[0] : null;
  
  const { data: sList } = await supabase.from('species').select('id, common_name, class').eq('common_name', 'Impala');
  const species = sList ? sList[0] : null;

  if (!park || !species) {
    console.error('❌ Metadata Handshake Failed. Ensure Mana Pools and Impala exist.');
    return;
  }

  const { data: surveys } = await supabase.from('surveys').select('id').eq('park_id', park.id).limit(1);
  if (!surveys || surveys.length === 0) {
     console.error('❌ No active survey found for Mana Pools.');
     return;
  }

  // 2. Prepare the mobile payload
  const mobileObservation = {
    id: `mob-${Date.now()}`,
    classification: species.class,
    species_id: species.id,
    species_name: species.common_name,
    count: 15,
    adult_m: 3, adult_f: 7, adult_u: 0,
    sub_adult_m: 2, sub_adult_f: 1, sub_adult_u: 0,
    juv_m: 1, juv_f: 1, juv_u: 0,
    activity: 'Drinking at River',
    habitat: 'Riverine Forest',
    lat: -15.728,
    long: 29.362,
    accuracy: 3.5,
    distance: 45,
    bearing: 110,
    team_leader_name: 'RANGER_COMMAND_ALPHA',
    survey_type: 'Transect',
    transect_id: 'T-MAIN-01',
    session_date: new Date().toISOString().split('T')[0],
    session_time: new Date().toLocaleTimeString(),
    synced_at: new Date().toISOString(),
    platform: 'mobile'
  };

  console.log(`📡 Transmitting Intelligence: ${mobileObservation.count}x ${species.common_name} sighting from Mobile Node...`);

  // 3. Insert into the new Reception Table
  const { data, error } = await supabase
    .from('field_observations')
    .insert({
      id: undefined, // Let Supabase generate UUID if needed
      survey_id: surveys[0].id,
      park_id: park.id,
      species_id: species.id,
      classification: species.class,
      lat: mobileObservation.lat,
      long: mobileObservation.long,
      accuracy: mobileObservation.accuracy,
      payload: mobileObservation
    })
    .select();

  if (error) {
    console.error('❌ Handshake Rejected by Cloud:', error.message);
    if (error.message.includes('schema cache')) {
        console.log('💡 TIP: PostgREST schema cache is stale. Please wait 30 seconds or run "NOTIFY pgrst, \'reload schema\';" in SQL Editor.');
    }
  } else {
    console.log('✅ Handshake Successful! Intelligence Packet Received.');
    console.log(`✨ Record is now live in the Operational Hub for ${park.name}.`);
    console.log(`🔗 Registry ID: ${data[0].id}`);
  }
}

performDigitalHandshake();
