import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase.from('workers').select('*');
    if (error) {
      console.error("Supabase GET Workers Error:", error);
      return NextResponse.json({ error: error.message, detail: error.details }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("API GET Workers Crash:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Adding worker, body:", body);
    
    const { data, error } = await supabase.from('workers').insert([body]).select();
    
    if (error) {
      console.error("Supabase POST Worker Error:", error);
      return NextResponse.json({ error: error.message, detail: error.details }, { status: 500 });
    }
    
    return NextResponse.json((data && data[0]) ?? null, { status: 201 });
  } catch (err: any) {
    console.error("API POST Worker Crash:", err);
    return NextResponse.json({ error: err.message || 'Server error during worker creation' }, { status: 400 });
  }
}
