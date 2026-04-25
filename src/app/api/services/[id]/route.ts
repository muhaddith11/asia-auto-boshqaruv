import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Map fields to database schema
    const dbBody: any = {};
    if (body.name) dbBody.name = body.name;
    if (body.price !== undefined) dbBody.price = body.price;
    if (body.brand) dbBody.brand = body.brand;
    if (body.car_model) dbBody.car_model = body.car_model;
    if (body.stavka !== undefined) dbBody.stavka = body.stavka;

    const { data, error } = await supabase
      .from('services_list')
      .update(dbBody)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid request: ' + err.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { error } = await supabase
      .from('services_list')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
