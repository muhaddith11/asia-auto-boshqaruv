import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result: any = {
    timestamp: new Date().toISOString(),
    env: {
      supabase_url: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      supabase_anon_key: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      site_url: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET'
    },
    db_check: 'Pending'
  };

  try {
    const start = Date.now();
    const { data, error } = await supabase.from('workers').select('count');
    const end = Date.now();
    
    if (error) {
      result.db_check = 'FAILED';
      result.error = error;
    } else {
      result.db_check = 'SUCCESS';
      result.query_time_ms = end - start;
    }
  } catch (e: any) {
    result.db_check = 'CRASHED';
    result.error_message = e.message;
  }

  return NextResponse.json(result);
}
