// Ish sessiyalaridan sof ish vaqtini hisoblash.
//
// Bu tezlik balining ASOSI: xodim "Ishni boshladim"/"Tugatdim" bosgan vaqt —
// mashina hovlida turgan vaqt emas. Shu sabab "svecha 20 daqiqa" kabi norma
// adolatli maqsadga aylanadi.
//
// Eng muhim qism — ISHONCHLILIK. Xodim "Tugatdim" bosishni unutsa, sessiya
// kechasi bo'ylab cho'zilib ketadi va normadan 30 barobar oshgandek ko'rinadi.
// Bunday holatda ball YOZILMAYDI (neytral) — noto'g'ri jarima yozishdan ko'ra
// hech narsa yozmagan xavfsizroq.

import { POINTS_MAX_SESSION_HOURS } from './config';

export interface WorkSessionRow {
  worker_id: number;
  started_at: string;
  ended_at: string | null;
}

export type SessionReason = 'ok' | 'no_sessions' | 'session_too_long' | 'still_open';

export interface SessionSummary {
  totalMinutes: number;
  reliable: boolean;
  reason: SessionReason;
  byWorker: Record<number, number>;
  sessionCount: number;
}

/**
 * Sessiyalar yig'indisi.
 *
 * `fallbackEnd` — yopilmagan sessiyani yopish uchun (odatda tayyor_vaqti).
 * Agar u ham yo'q bo'lsa (ish hali tugamagan) — baholab bo'lmaydi.
 *
 * Bitta sessiya `maxSessionHours` dan uzun bo'lsa, xodim tugmani unutgan deb
 * hisoblanadi va butun buyurtma baholanmaydi.
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
    byWorker: {},
    sessionCount: 0,
  };
  if (!Array.isArray(sessions) || sessions.length === 0) return empty;

  const maxMs = maxSessionHours * 60 * 60 * 1000;
  const byWorker: Record<number, number> = {};
  let totalMs = 0;

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
    if (ms > maxMs) {
      // "Tugatdim" bosilmagan — bu vaqt haqiqiy ish emas.
      return { ...empty, reason: 'session_too_long', sessionCount: sessions.length };
    }

    totalMs += ms;
    const wid = Number(s.worker_id);
    byWorker[wid] = (byWorker[wid] || 0) + ms / 60000;
  }

  if (totalMs <= 0) return empty;

  return {
    totalMinutes: totalMs / 60000,
    reliable: true,
    reason: 'ok',
    byWorker,
    sessionCount: sessions.length,
  };
}
