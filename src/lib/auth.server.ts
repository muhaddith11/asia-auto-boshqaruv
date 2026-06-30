import type { Role } from './auth';

// ─────────────────────────────────────────────────────────────────────────────
// SERVER-ONLY: akkauntlar va parollar. Bu fayl HECH QACHON client komponentlarga
// import qilinmasligi kerak — faqat /api/auth route'larida ishlatiladi.
// Shu sababli parollar brauzer bundle'iga tushmaydi.
//
// Parolni env orqali ham berish mumkin (masalan OWNER_PASSWORD), aks holda
// quyidagi default ishlatiladi. Ishlatishdan oldin parollarni o'zgartiring!
// ─────────────────────────────────────────────────────────────────────────────

export interface ServerAccount {
  login: string;
  parol: string;
  role: Role;
  ism: string;
}

export const ACCOUNTS: ServerAccount[] = [
  { login: 'asiaauto', parol: process.env.OWNER_PASSWORD  || 'salom123',  role: 'egasi',  ism: 'Egasi' },
  { login: 'sherik',   parol: process.env.PARTNER_PASSWORD || 'sherik123', role: 'sherik', ism: 'Sherik' },
  { login: 'xodim',    parol: process.env.WORKER_PASSWORD  || 'xodim123',  role: 'xodim',  ism: 'Xodim' },
];

export function findAccount(login: string, parol: string): ServerAccount | null {
  const l = (login || '').trim().toLowerCase();
  return ACCOUNTS.find(a => a.login.toLowerCase() === l && a.parol === parol) ?? null;
}
