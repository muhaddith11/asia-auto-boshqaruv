import type { Role } from './auth';

// ─────────────────────────────────────────────────────────────────────────────
// SERVER-ONLY: akkauntlar va parollar. Bu fayl HECH QACHON client komponentlarga
// import qilinmasligi kerak — faqat /api/auth route'larida ishlatiladi.
// Shu sababli parollar brauzer bundle'iga tushmaydi.
//
// Parollar FAQAT env'dan olinadi: OWNER_PASSWORD, BOSS_PASSWORD, PARTNER_PASSWORD,
// WORKER_PASSWORD. Paroli berilmagan akkaunt bilan kirib bo'lmaydi.
// ─────────────────────────────────────────────────────────────────────────────

export interface ServerAccount {
  login: string;
  parol: string;
  role: Role;
  ism: string;
}

export const ACCOUNTS: ServerAccount[] = [
  { login: 'asiaauto', parol: process.env.OWNER_PASSWORD || '', role: 'egasi', ism: 'Egasi' },
  // Boshliq — egasi bilan bir xil huquq, ixcham ko'rinish. BOSS_PASSWORD berilmasa
  // egasi paroli ishlaydi.
  { login: 'boshliq',  parol: process.env.BOSS_PASSWORD || process.env.OWNER_PASSWORD || '', role: 'boshliq', ism: 'Boshliq' },
  { login: 'sherik',   parol: process.env.PARTNER_PASSWORD || '', role: 'sherik', ism: 'Sherik' },
  { login: 'xodim',    parol: process.env.WORKER_PASSWORD || '', role: 'xodim', ism: 'Xodim' },
];

export function findAccount(login: string, parol: string): ServerAccount | null {
  if (!parol) return null;
  const l = (login || '').trim().toLowerCase();
  return ACCOUNTS.find(a => a.login.toLowerCase() === l && a.parol === parol) ?? null;
}
