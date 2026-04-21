import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/$/, '');
const supabaseKey = (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// 🛡️ CRITICAL SAFETY FIX:
// Supabase createClient crashes if the URL is empty or doesn't start with http.
// We must ensure it's a valid string before calling it.
const isUrlValid = supabaseUrl.startsWith('http');

const supabase = (isUrlValid && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false } 
    })
  : null as any;

if (!supabase && typeof window === 'undefined') {
  console.warn("⚠️ Supabase: Credentials missing or invalid. Check your ENV variables.");
}

export default supabase;
