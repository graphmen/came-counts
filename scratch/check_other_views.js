const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmJjdnhpc3JtdG1obXV4YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODYyMzcsImV4cCI6MjA4ODk2MjIzN30.aRiny3OpOqmGgYuddwqnqiCvGzGa78PUQo6po-B55nI';

const pub = createClient(supabaseUrl, supabaseAnonKey);

async function checkViews() {
    const views = ['v_survey_trends', 'v_static_site_species', 'v_park_species_summary'];
    for (const v of views) {
        const { data, error } = await pub.from(v).select('*').limit(1);
        console.log(`View ${v} in public:`, data ? 'Found' : 'Missing', error ? error.message : '');
    }
}

checkViews();
