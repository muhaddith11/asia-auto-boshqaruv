// ─────────────────────────────────────────────────────────────────────────────
// Rollar va kirish huquqlari (RBAC) — CLIENT-SAFE.
// Parollar bu yerda EMAS — ular faqat serverda (src/lib/auth.server.ts).
// Bu fayl client komponentlarga ham import qilinadi, shuning uchun maxfiy
// ma'lumot saqlamasligi kerak.
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'egasi' | 'sherik' | 'xodim';

// Tizim bo'limlari
export type Section =
  | 'dashboard'
  | 'orders'
  | 'services'
  | 'clients'
  | 'parts'
  | 'workers'
  | 'reports'
  | 'reminders'
  | 'audit'
  | 'backup';

// Har bir rol qaysi bo'limlarga kira oladi
const PERMISSIONS: Record<Role, Section[]> = {
  // Egasi — hammasi
  egasi: ['dashboard', 'orders', 'services', 'clients', 'parts', 'workers', 'reports', 'reminders', 'audit', 'backup'],
  // Sherik — moliyani ko'radi, lekin xodim boshqaruvi/audit/backupsiz
  sherik: ['dashboard', 'orders', 'services', 'clients', 'parts', 'reports', 'reminders'],
  // Xodim — faqat operatsion ish (moliya/hisobotlarsiz)
  xodim: ['dashboard', 'orders', 'services', 'clients', 'parts'],
};

export function canAccess(role: Role | null | undefined, section: Section): boolean {
  if (!role) return false;
  return PERMISSIONS[role]?.includes(section) ?? false;
}

export const ROLE_LABEL: Record<Role, string> = {
  egasi: 'Egasi',
  sherik: 'Sherik',
  xodim: 'Xodim',
};
