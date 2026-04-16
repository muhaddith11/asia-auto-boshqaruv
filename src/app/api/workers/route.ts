import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WORKER_COLUMNS = 'id, ism, tel, mutax, foiz, status, role, telegram, "shareType", "parentId", created_at';

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  // ONLY these columns exist in the DB or are expected.
  // Note: some are dual-named in the DB but we use these:
  const allowed = ['id', 'ism', 'tel', 'mutax', 'foiz', 'status', 'role', 'telegram', 'shareType', 'parentId'];
  const clean: any = {};
  allowed.forEach(key => {
    if (b[key] !== undefined) clean[key] = b[key];
  });
  return clean;
}

export async function GET() {
  try {
    const { data, error } = await supabase.from('workers').select(WORKER_COLUMNS);
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
    const dbBody = mapAppToDB(body);
    
    // Explicitly insert only allowed columns to be double safe
    const { data, error } = await supabase.from('workers').insert([dbBody]).select(WORKER_COLUMNS);
    
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
