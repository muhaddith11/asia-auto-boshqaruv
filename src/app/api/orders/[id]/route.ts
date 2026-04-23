import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mapRowToApp(row: any) {
  if (!row) return row;
  const r = { ...row } as any;
  const date = r.created_at || r.createdat;
  if (date !== undefined) {
    r.createdAt = date;
  }
  // Calculate chegirma from total and final
  r.chegirma = (r.total || 0) - (r.final || 0);
  return r;
}

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  
  // Safe mapping for status/holat
  if (b.holat !== undefined) {
    b.status = b.holat;
  }
  
  // These fields are only for frontend calculation/display or handled by DB defaults.
  const fieldsToRemove = [
    'createdAt', 'created_at', 'createdat', 
    'chegirmaFoiz', 'subTotal', 'finalTotal',
    'print_status'
  ];
  
  fieldsToRemove.forEach(f => {
    if (f in b) delete b[f];
  });

  return b;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleUpdate(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleUpdate(request, context);
}

async function handleUpdate(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const body = await request.json();
    
    // Map application fields to database schema
    const dbBody = mapAppToDB(body);
    
    // Whitelist: Faqat bazada borligi aniq bo'lgan ustunlar
    const whitelist = [
      'ism', 'tel', 'mashina', 'raqam', 'vin', 'yil', 'km', 'muammo',
      'srv', 'zap', 'total', 'final', 'holat', 'status', 'sana',
      'services', 'zaps', 'zarplata', 'pribil'
    ];
    
    const cleanBody: any = {};
    whitelist.forEach(key => {
      if (dbBody[key] !== undefined) cleanBody[key] = dbBody[key];
    });
    
    console.log("DEBUG: Updating order", id, cleanBody);

    const { data, error, status } = await supabase.from('orders').update(cleanBody).eq('id', id).select();
    
    if (error) {
       console.error("❌ Supabase Update Error:", error);
       return NextResponse.json({ 
         error: error.message, 
         details: error.details, 
         hint: error.hint,
         status: status 
       }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
       console.warn("⚠️ No data returned after update. ID might be wrong or RLS blocking.");
       return NextResponse.json({ error: "Record not found or update blocked by RLS policies" }, { status: 404 });
    }

    return NextResponse.json(mapRowToApp(data[0]));
  } catch (err) {
    console.error("Update Handler Error:", err);
    return NextResponse.json({ error: 'Invalid request or server error' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const { data, error } = await supabase.from('orders').delete().eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: mapRowToApp((data && data[0]) ?? null) });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
