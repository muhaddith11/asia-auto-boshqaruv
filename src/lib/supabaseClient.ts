import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/$/, '');
const supabaseKey = (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// Create a safe, non-crashing mock if credentials are missing
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false } // Required for server-side environments like bot poller
    })
  : null as any;

if (!supabase) {
  if (typeof window === 'undefined') {
    console.error("CRITICAL: Supabase credentials missing! Check .env.local or Dokploy ENV vars.");
    console.error("URL exists:", !!supabaseUrl);
    console.error("KEY exists:", !!supabaseKey);
  }
}

export default supabase;
