// Ish sessiyalaridan sof ish vaqtini hisoblash.
//
// Bu tezlik balining ASOSI: xodim "Ishni boshladim"/"Tugatdim" bosgan vaqt —
// mashina hovlida turgan vaqt emas. Shu sabab "svecha 20 daqiqa" kabi norma
// adolatli maqsadga aylanadi.
//
// Xodim "Pauza" bosishni unutsa, sessiya kechasi bo'ylab cho'zilib ketadi.
// Egasining qarori: bunday holat ham BAHOLANADI va normadan oshgan bo'lsa
// jarima yoziladi — aks holda tugmani atayin unutish jarimadan qutulish
// yo'liga aylanardi. Uzoq sessiya `suspicious` deb belgilanadi, shunda egasi
// qaysi yozuv unutilganini ko'ra oladi (ball baribir -4 dan pastga tushmaydi).

import { POINTS_MAX_SESSION_HOURS } from './config';

export interface WorkSessionRow {
  worker_id: number;
  started_at: string;
  ended_at: string | null;
}

export type SessionReason = 'ok' | 'no_sessions' | 'forgotten_stop' | 'still_open';

export interface SessionSummary {
  totalMinutes: number;
  reliable: boolean;
  reason: SessionReason;
  /** Sessiya juda uzun — xodim "Pauza" bosishni unutgan. Ball baribir beriladi. */
  suspicious: boolean;
  byWorker: Record<number, number>;
  sessionCount: number;
}

/**
 * Sessiyalar yig'indisi.
 *
 * `fallbackEnd` — yopilmagan sessiyani yopish uchun (odatda tayyor_vaqti).
 * Agar u ham yo'q bo'lsa (ish hali tugamagan) — baholab bo'lmaydi.
 *
 * Bitta sessiya `maxSessionHours` dan uzun bo'lsa ham vaqt HISOBGA OLINADI,
 * faqat `suspicious: true` deb belgilanadi (egasining qarori: unutish jarimadan
 * qutulish yo'li bo'lmasin).
 */
export function summarizeSessions(
  sessions: WorkSessionRow[],
  fallbackEnd: string | null,
  maxSessionHours: number = POINTS_MAX_SESSION_HOURS,
): SessionSummary {
  const empty: SessionSummary = {
    totalMinutes: 0,
    reliable: false,
    reason: 'no_sessions',
    suspicious: false,
    byWorker: {},
    sessionCount: 0,
  };
  if (!Array.isArray(sessions) || sessions.length === 0) return empty;

  const maxMs = maxSessionHours * 60 * 60 * 1000;
  const byWorker: Record<number, number> = {};
  let totalMs = 0;
  let suspicious = false;

  for (const s of sessions) {
    const start = new Date(s.started_at).getTime();
    if (!Number.isFinite(start)) continue;

    const endIso = s.ended_at || fallbackEnd;
    if (!endIso) {
      // Sessiya hali ochiq va yopish uchun vaqt yo'q — ish tugamagan.
      return { ...empty, reason: 'still_open', sessionCount: sessions.length };
    }
    const end = new Date(endIso).getTime();
    if (!Number.isFinite(end) || end <= start) continue;

    const ms = end - start;
    if (ms > maxMs) suspicious = true; // "Pauza" bosilmagan, lekin baribir sanaladi

    totalMs += ms;
    const wid = Number(s.worker_id);
    byWorker[wid] = (byWorker[wid] || 0) + ms / 60000;
  }

  if (totalMs <= 0) return empty;

  return {
    totalMinutes: totalMs / 60000,
    reliable: true,
    reason: suspicious ? 'forgotten_stop' : 'ok',
    suspicious,
    byWorker,
    sessionCount: sessions.length,
  };
}
