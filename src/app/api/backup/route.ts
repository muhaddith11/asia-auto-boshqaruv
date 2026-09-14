import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { canAccess, type Role } from '@/lib/auth';
import { verifySessionToken } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TABLES = [
  'clients', 'orders', 'workers', 'parts', 'services',
  'operations', 'salaries', 'purchases', 'cars', 'kassa',
];

// To'liq zaxira nusxa — barcha jadvallarni JSON sifatida qaytaradi.
// Faqat zaxira huquqi bor rol (egasi, boshliq) yuklab olishi mumkin.
export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB ulanmagan' }, { status: 500 });

  // Rol imzolangan sessiyadan olinadi — auth_role cookie'sini qo'lda o'zgartirib o'tib bo'lmaydi.
  const session = await verifySessionToken(request.cookies.get('auth_session')?.value);
  if (!canAccess(session?.role as Role | undefined, 'backup')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q — zaxirani faqat egasi yoki boshliq oladi' }, { status: 403 });
  }

  const backup: Record<string, any> = {
    _meta: {
      created_at: new Date().toISOString(),
      app: 'asia-auto-service',
      version: 1,
    },
  };

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    backup[table] = error ? { _error: error.message } : (data ?? []);
  }

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="asia-auto-backup-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
