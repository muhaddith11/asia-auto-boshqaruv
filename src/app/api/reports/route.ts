import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [{ data: clients, count: clientsCount }, { data: orders, count: ordersCount }] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact' }),
    supabase.from('orders').select('*', { count: 'exact' })
  ]) as any[];

  const totalClients = clientsCount ?? (clients ? clients.length : 0);
  const totalOrders = ordersCount ?? (orders ? orders.length : 0);
  const totalRevenue = (orders ?? []).reduce((s: number, o: any) => s + (o.total || 0), 0);

  const report = {
    totalClients,
    totalOrders,
    totalRevenue,
    generatedAt: new Date().toISOString()
  };

  return NextResponse.json(report);
}
