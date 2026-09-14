// ─────────────────────────────────────────────────────────────────────────────
// Rollar va kirish huquqlari (RBAC) — CLIENT-SAFE.
// Parollar bu yerda EMAS — ular faqat serverda (src/lib/auth.server.ts).
// Bu fayl client komponentlarga ham import qilinadi, shuning uchun maxfiy
// ma'lumot saqlamasligi kerak.
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'egasi' | 'boshliq' | 'sherik' | 'xodim';

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
  | 'backup';

// Har bir rol qaysi bo'limlarga kira oladi
const PERMISSIONS: Record<Role, Section[]> = {
  // Egasi — hammasi
  egasi: ['dashboard', 'orders', 'services', 'clients', 'parts', 'workers', 'reports', 'reminders', 'backup'],
  // Boshliq — egasi kabi hammasiga kira oladi, lekin interfeysi ixcham: bosh sahifa,
  // menyu va navbar faqat hisob-kitob va buyurtmalarni ko'rsatadi (qarang: isBoss).
  boshliq: ['dashboard', 'orders', 'services', 'clients', 'parts', 'workers', 'reports', 'reminders', 'backup'],
  // Sherik — moliyani ko'radi, lekin xodim boshqaruvi/backupsiz
  sherik: ['dashboard', 'orders', 'services', 'clients', 'parts', 'reports', 'reminders'],
  // Xodim — faqat operatsion ish (moliya/hisobotlarsiz)
  xodim: ['dashboard', 'orders', 'services', 'clients', 'parts'],
};

export const ROLES = Object.keys(PERMISSIONS) as Role[];

export function canAccess(role: Role | null | undefined, section: Section): boolean {
  if (!role) return false;
  return PERMISSIONS[role]?.includes(section) ?? false;
}

// Boshliq ko'rinishi: huquqlar to'liq, lekin dashboard ixcham — Sidebar, GlobalNavbar
// va bosh sahifa shu belgiga qarab soddalashadi.
export function isBoss(role: Role | null | undefined): boolean {
  return role === 'boshliq';
}

export const ROLE_LABEL: Record<Role, string> = {
  egasi: 'Admin',
  boshliq: 'Boshliq',
  sherik: 'Sherik',
  xodim: 'Xodim',
};
