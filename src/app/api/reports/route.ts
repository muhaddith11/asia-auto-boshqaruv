import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { requireSection } from '@/lib/routeGuard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireSection(request, 'reports');
  if (guard.denied) return guard.denied;

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
