// Ball/bonus tizimi sozlamalari — env orqali, kod o'zgartirmasdan tuzatiladi.

export const POINTS_SOM_PER_BALL = Number(process.env.POINTS_SOM_PER_BALL) || 5000;
export const POINTS_MAX_PERCENT_OF_EARNED = Number(process.env.POINTS_MAX_PERCENT_OF_EARNED) || 20;
export const POINTS_REWORK_WINDOW_DAYS = Number(process.env.POINTS_REWORK_WINDOW_DAYS) || 14;
export const POINTS_MIN_DURATION_MINUTES = Number(process.env.POINTS_MIN_DURATION_MINUTES) || 5;

// Kunlik hisoblash shu kundan orqadagi buyurtmalarni ko'rib chiqadi.
export const POINTS_SPEED_LOOKBACK_DAYS = Number(process.env.POINTS_SPEED_LOOKBACK_DAYS) || 90;

// Sabr oynasi: normadan shu FOIZ ga oshsa hali jarima yo'q (egasi 30% ni tanladi).
// 20 daqiqalik ishga 6 daqiqa, 3 kunlik ishga ~21 soat sabr degani.
export const POINTS_GRACE_PERCENT = Number(process.env.POINTS_GRACE_PERCENT) || 30;

// Normaning shu ulushidan tez bajarilsa — katta bonus (+3) o'rniga (+2).
export const POINTS_FAST_BONUS_RATIO = Number(process.env.POINTS_FAST_BONUS_RATIO) || 0.6;

// Ustaxona ish soatlari (Toshkent vaqti). Bazadagi qabul/tayyor belgilashlar
// taqsimoti aynan shu oraliqda: 09:00 dan oldin va 21:00 dan keyin deyarli yo'q.
export const WORK_DAY_START_HOUR = Number(process.env.WORK_DAY_START_HOUR) || 9;
export const WORK_DAY_END_HOUR = Number(process.env.WORK_DAY_END_HOUR) || 21;

export const BEKOR_HOLAT = 'bekor'; // Jonli bazadagi haqiqiy qiymat — types/index.ts'dagi 'bekor qilingan' emas.
