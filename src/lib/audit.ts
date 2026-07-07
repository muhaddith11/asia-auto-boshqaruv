import type { NextRequest } from 'next/server';
import supabase from '@/lib/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// Server tomon audit log yozuvchi.
// Asosiy amalni BLOKLAMAYDI — xatolik bo'lsa faqat konsolga yozadi.
// ─────────────────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'create' | 'update' | 'delete' | 'payment' | 'transfer' | 'salary' | 'telegram_notify';

interface LogParams {
  req?: NextRequest;
  action: AuditAction;
  entity: string;            // 'order' | 'operation' | 'salary' | 'client' | ...
  entityId?: string | number | null;
  details?: Record<string, any>;
}

export async function logAudit(p: LogParams): Promise<void> {
  try {
    if (!supabase) return;

    let role: string | null = null;
    let name: string | null = null;
    if (p.req) {
      role = p.req.cookies.get('auth_role')?.value ?? null;
      const rawName = p.req.cookies.get('auth_name')?.value;
      name = rawName ? decodeURIComponent(rawName) : null;
    }

    await supabase.from('audit_log').insert([{
      action: p.action,
      entity: p.entity,
      entity_id: p.entityId != null ? String(p.entityId) : null,
      user_role: role,
      user_name: name,
      details: p.details ?? null,
    }]);
  } catch (err) {
    // Audit yozuvi asosiy ishni to'xtatmasligi kerak
    console.error('⚠️ Audit log yozishda xatolik:', err);
  }
}
