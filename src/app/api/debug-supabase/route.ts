import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || '';

  const diagnostics = {
    env: {
      url_configured: !!url,
      url_preview: url ? `${url.substring(0, 10)}...` : 'not configured',
      key_configured: !!key,
      key_preview: key ? `${key.substring(0, 5)}...${key.substring(key.length - 5)}` : 'not configured',
    },
    database: {
      client_initialized: !!supabase,
      connection_test: 'pending',
      workers_count: 'pending',
      error: null as any
    }
  };

  if (!supabase) {
    return NextResponse.json({ 
      ok: false, 
      error: "Supabase client failed to initialize (Missing ENV vars)", 
      diagnostics 
    }, { status: 500 });
  }

  try {
    // 1. Simple Connection Test
    const { data: testData, error: testError } = await supabase.from('workers').select('count').limit(1);
    
    if (testError) {
      diagnostics.database.connection_test = 'failed';
      diagnostics.database.error = testError;
    } else {
      diagnostics.database.connection_test = 'success';
      
      // 2. Count Workers
      const { count, error: countError } = await supabase.from('workers').select('*', { count: 'exact', head: true });
      diagnostics.database.workers_count = countError ? 'error reading count' : count;
    }

    return NextResponse.json({ 
       ok: diagnostics.database.connection_test === 'success',
       diagnostics 
    });

  } catch (err: any) {
    return NextResponse.json({ 
      ok: false, 
      error: "Unexpected crash during diagnostics", 
      message: err.message,
      diagnostics 
    }, { status: 500 });
  }
}
