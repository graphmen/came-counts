const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const gc = createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'gamecount' }
});

async function verify() {
    console.log('--- WEZ Platform Data Verification ---');

    const { data: parks } = await gc.from('parks').select('name');
    console.log('Parks:', parks.map(p => p.name).join(', '));

    const { data: species } = await gc.from('species').select('common_name').limit(5);
    console.log('Sample Species:', species.map(s => s.common_name).join(', '));

    const { data: totals } = await gc.from('v_survey_species_totals').select('species, total_count').limit(5);
    console.log('2025 Census Top 5 Totals:');
    totals.forEach(t => console.log(` - ${t.species}: ${t.total_count}`));

    const { data: trends } = await gc.from('historical_counts').select('year, total_count').eq('species_id', (await gc.from('species').select('id').eq('common_name', 'Impala').single()).data.id).order('year', { ascending: false }).limit(5);
    console.log('Impala Last 5 Years Trends:');
    trends.forEach(tr => console.log(` - ${tr.year}: ${tr.total_count}`));

    console.log('--- Verification Complete ---');
}

verify();
