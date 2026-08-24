// Ball/bonus tizimi sozlamalari — env orqali, kod o'zgartirmasdan tuzatiladi.

export const POINTS_SOM_PER_BALL = Number(process.env.POINTS_SOM_PER_BALL) || 5000;
export const POINTS_MAX_PERCENT_OF_EARNED = Number(process.env.POINTS_MAX_PERCENT_OF_EARNED) || 20;
export const POINTS_REWORK_WINDOW_DAYS = Number(process.env.POINTS_REWORK_WINDOW_DAYS) || 14;
export const POINTS_MIN_DURATION_MINUTES = Number(process.env.POINTS_MIN_DURATION_MINUTES) || 5;
export const POINTS_SPEED_WINDOW_DAYS = 90;

export const BEKOR_HOLAT = 'bekor'; // Jonli bazadagi haqiqiy qiymat — types/index.ts'dagi 'bekor qilingan' emas.
