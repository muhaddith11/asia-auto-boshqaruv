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

// Bitta ish sessiyasi shu soatdan uzun bo'lsa — xodim "To'xtatdim" bosishni
// unutgan deb hisoblanadi va buyurtma umuman baholanmaydi (neytral).
//
// 13 soat: ustaxona 09:00–21:00 ishlaydi, ya'ni eng uzun halol sessiya 12 soat.
// Batareyka/tarpeda kabi 1 kunlik ishda usta ertalab boshlab kechqurun to'xtatsa
// shu chegaraga sig'adi; undan oshgani albatta kechani o'z ichiga oladi.
export const POINTS_MAX_SESSION_HOURS = Number(process.env.POINTS_MAX_SESSION_HOURS) || 13;

export const BEKOR_HOLAT = 'bekor'; // Jonli bazadagi haqiqiy qiymat — types/index.ts'dagi 'bekor qilingan' emas.
