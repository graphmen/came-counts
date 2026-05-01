const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const pub = createClient(supabaseUrl, supabaseAnonKey);
const gc = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'gamecount' } });

async function globalFix() {
    // 1. Get all parks
    const { data: parks } = await pub.from('parks').select('id, name');
    
    // 2. Map slugs to UUIDs
    const slugMap = {};
    parks.forEach(p => {
        const slug = p.name.toLowerCase().replace(/\s+/g, '-');
        // Handle special cases
        if (p.name === 'Mana Pools National Park') slugMap['mana-pools'] = p.id;
        else if (p.name === 'Hwange National Park') slugMap['hwange'] = p.id;
        else slugMap[slug] = p.id;
    });

    console.log('Slug Map:', slugMap);

    // 3. For each park, find its 2025 survey and link orphans
    for (const [slug, parkId] of Object.entries(slugMap)) {
        const { data: survey } = await pub.from('surveys').select('id').eq('park_id', parkId).eq('year', 2025).single();
        if (survey) {
            console.log(`Linking orphans for ${slug} to Survey ${survey.id}`);
            await gc.from('field_observations').update({ survey_id: survey.id }).eq('park_id', slug).is('survey_id', null);
        }
    }
    console.log('Global fix complete.');
}

globalFix();
