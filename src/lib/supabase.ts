import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create client targeting public schema by default
// This resolves 406 Not Acceptable issues in environments where gamecount is not exposed
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    db: {
        schema: 'public'
    }
});

// Alias gc to supabase for existing code compatibility
export const gc = supabase;
