// Ustaxona bo'limlari (department). Xodim va qabul qilingan mashina qaysi
// bo'limga tegishli ekanini belgilaydi. Kassa BITTA — bo'lim faqat xodim va
// ish oqimini ajratadi, moliyani ajratmaydi.
//
// Bu modul ham server (accept/cars route), ham klient (formalar, BossMonitor)
// tomonidan ishlatiladi — shuning uchun toza (server-only import yo'q).

export type Bolim = 'ustaxona' | 'yog';

// bolim null/bo'sh bo'lsa — eski ma'lumot, ustaxona deb qaraladi.
export const DEFAULT_BOLIM: Bolim = 'ustaxona';

export interface BolimMeta {
  value: Bolim;
  label: string;
  emoji: string;
  color: string;
}

export const BOLIMLAR: BolimMeta[] = [
  { value: 'ustaxona', label: 'Ustaxona', emoji: '🔧', color: '#3b82f6' },
  { value: 'yog', label: "Yog' quyish", emoji: '🛢️', color: '#f59e0b' },
];

// Har qanday qiymatni (null, eski matn) ma'lum bo'lim metasiga aylantiradi.
export function bolimMeta(value?: string | null): BolimMeta {
  return BOLIMLAR.find((b) => b.value === value) || BOLIMLAR[0];
}

// Normalizatsiya — faqat ma'lum qiymat, aks holda default (ustaxona).
export function normalizeBolim(value?: string | null): Bolim {
  return BOLIMLAR.some((b) => b.value === value) ? (value as Bolim) : DEFAULT_BOLIM;
}
