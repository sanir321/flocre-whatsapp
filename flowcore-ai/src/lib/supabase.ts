import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kbzilehbqybxiwldwgii.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
    console.warn('SUPABASE_ANON_KEY not set - media upload will not work');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
