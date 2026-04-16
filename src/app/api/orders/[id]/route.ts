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
  return r;
}

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  if (b.createdAt !== undefined) {
    b.createdat = b.createdAt;
    b.created_at = b.createdAt;
    delete b.createdAt;
  }
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
    const dbBody = mapAppToDB(body);
    
    // Explicitly prevent updating the ID column
    if (dbBody.id) delete dbBody.id;

    const { data, error } = await supabase.from('orders').update(dbBody).eq('id', id).select();
    
    if (error) {
       console.error("Supabase Update Error:", error);
       return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
       return NextResponse.json({ error: "Record not found or not updated" }, { status: 404 });
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
