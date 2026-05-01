import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Standard Supabase client targeting the 'public' schema.
 * Used for core metadata: parks, surveys, species, users, etc.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Specialized client targeting the 'gamecount' schema.
 * Used for real-time field observations and mobile sync data.
 */
export const gc = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'gamecount',
  },
});
