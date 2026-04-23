import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from('operations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Bazada borligi aniq bo'lgan ustunlarni saralab olamiz
    const cleanBody: any = {
      date: body.date,
      type: body.type,
      amount: body.amount,
      category: body.category,
      comment: body.comment || '',
      method: body.method || 'naqd',
      source: body.source || 'manual',
      tomethod: body.toMethod || body.tomethod || null
    };
    
    const { data, error, status } = await supabase
      .from('operations')
      .insert([cleanBody])
      .select()
      .single();

    if (error) {
       console.error("❌ Supabase Operations Error:", error);
       return NextResponse.json({ 
         error: error.message, 
         details: error.details, 
         hint: error.hint,
         status: status 
       }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ Operations Handler Error:", err);
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 });
  }
}
