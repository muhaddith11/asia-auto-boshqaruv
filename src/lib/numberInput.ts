// Pul/miqdor input'lari uchun: foydalanuvchi yozayotganda 3 xonadan keyin
// probel qo'yib ko'rsatadi (1200000 -> "1 200 000"), lekin state'da har doim
// toza raqam qatori saqlanadi — mavjud parseInt/Number chaqiruvlari o'zgarishsiz ishlayveradi.

export function formatDigits(raw: string | number | null | undefined): string {
  const digits = String(raw ?? '').replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('ru-RU');
}

export function stripToDigits(formatted: string): string {
  return formatted.replace(/[^\d]/g, '');
}
