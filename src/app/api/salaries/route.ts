import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from('salaries')
    .select('*')
    .order('date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Whitelist and map fields correctly
    const cleanBody = {
      worker_id: body.worker_id,
      amount: body.amount,
      method: body.method || 'naqd',
      date: body.date || new Date().toISOString().split('T')[0],
      comment: body.comment || ''
    };

    const { data, error } = await supabase
      .from('salaries')
      .insert([cleanBody])
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
