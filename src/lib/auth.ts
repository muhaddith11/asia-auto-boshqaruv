// ─────────────────────────────────────────────────────────────────────────────
// Rollar va kirish huquqlari (RBAC)
// Eslatma: bu qatlam UI darajasidagi rol ajratish uchun. To'liq kriptografik
// xavfsiz auth (parol hash + server session) alohida bosqich (#2/#3).
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'egasi' | 'sherik' | 'xodim';

export interface Account {
  login: string;
  parol: string;
  role: Role;
  ism: string;
}

// Tizim akkauntlari. Yangi xodim/sherik qo'shish uchun shu ro'yxatga qo'shing.
// (Kelajakda Supabase `workers` jadvalidan login/parol orqali tortish mumkin.)
export const ACCOUNTS: Account[] = [
  { login: 'asiaauto', parol: 'salom123', role: 'egasi',  ism: 'Egasi' },
  { login: 'sherik',   parol: 'sherik123', role: 'sherik', ism: 'Sherik' },
  { login: 'xodim',    parol: 'xodim123',  role: 'xodim',  ism: 'Xodim' },
];

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

export function findAccount(login: string, parol: string): Account | null {
  const l = login.trim().toLowerCase();
  return ACCOUNTS.find(a => a.login.toLowerCase() === l && a.parol === parol) ?? null;
}
