import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mapRowToApp(row: any) {
  if (!row) return row;
  return { ...row };
}

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  const allowed = ['id', 'ism', 'tel', 'mashina', 'raqam', 'vin', 'tashriflar', 'jami', 'qarzdorlik', 'created_at', 'createdat'];
  Object.keys(b).forEach(key => {
    if (!allowed.includes(key)) {
      delete b[key];
    }
  });
  if (b.id) delete b.id; // Prevent updating the ID column itself
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
    const { data, error } = await supabase.from('clients').update(dbBody).eq('id', id).select();
    if (error) {
      console.error("Client Update Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(mapRowToApp((data && data[0]) ?? null));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request or server error' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const { data, error } = await supabase.from('clients').delete().eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: mapRowToApp((data && data[0]) ?? null) });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
