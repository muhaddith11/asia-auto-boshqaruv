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
    const dbBody: any = {};
    
    // Whitelist: Faqat bazada borligi aniq bo'lgan ustunlar
    const whitelist = [
      'ism', 'tel', 'mashina', 'raqam', 'vin', 'yil', 'km', 'muammo',
      'srv', 'zap', 'total', 'final', 'holat', 'sana',
      'services', 'zaps', 'zarplata', 'pribil', 'print_status'
    ];
    
    whitelist.forEach(key => {
      if (body[key] !== undefined) dbBody[key] = body[key];
    });
    
    // 🔄 Handle status/holat mapping
    // If frontend sends 'status' but not 'holat', map it
    if (body.status !== undefined && dbBody.holat === undefined) {
      dbBody.holat = body.status;
    }

    if (Object.keys(dbBody).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    console.log("DEBUG: Updating order", id, dbBody);

    const { data, error, status } = await supabase.from('orders').update(dbBody).eq('id', id).select();
    
    if (error) {
       console.error("❌ Supabase Update Error:", error);
       return NextResponse.json({ 
         error: error.message, 
         details: error.details, 
         status: status 
       }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
       return NextResponse.json({ 
         error: `Record with ID ${id} not found or update blocked by RLS policies`,
         receivedId: id,
         sentData: dbBody
       }, { status: 404 });
    }

    return NextResponse.json(mapRowToApp(data[0]));
  } catch (err: any) {
    console.error("Update Handler Error:", err);
    return NextResponse.json({ error: 'Invalid request: ' + err.message }, { status: 400 });
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
