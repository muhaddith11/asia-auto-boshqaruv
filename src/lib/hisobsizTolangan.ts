// ─────────────────────────────────────────────────────────────────────────────
// Puli ilgari olingan, lekin tizimga yozilmay qolgan eski buyurtmalar
// (2026-04 … 2026-07). Egasi qarori, 2026-11-23:
//
//   • buyurtma "To'langan" holatida turadi — qarzdorlar ro'yxatidan chiqadi;
//   • kassaga pul QO'SHILMAYDI;
//   • hech qaysi hisobotga (kirim, foyda, kunlik, mijoz, xodim, oylik) va
//     SHERIK ULUSHIGA hech qanday o'zgarish kirmaydi — hisob-kitobda ular
//     avvalgidek TO'LANMAGAN deb olinadi;
//   • buyurtmaning o'zida hech qanday belgi yo'q (egasi talabi) — ro'yxat
//     faqat shu yerda.
//
// Shu sababli foyda/kirim hisoblaydigan joylar `holat === 'tulangan'` o'rniga
// `isTolanganHisobda` dan foydalanadi. Qarzdorlik, faol buyurtmalar va to'lov
// tugmasi esa oddiy `holat` ga qarashda davom etadi.
// ─────────────────────────────────────────────────────────────────────────────

const HISOBSIZ_TOLANGAN_IDS: ReadonlySet<number> = new Set([
  68, 283, 452, 595, 632, 664, 687, 688, 690, 747,
  954, 1009, 1031, 1086, 1101, 1146, 1181, 1187, 1220, 1223,
  1231, 1252, 1261, 1269, 1271, 1281, 1314, 1328, 1333, 1344,
  1351, 1355, 1373, 1384, 1395, 1426, 1446, 1453, 1465, 1466,
]);

export function isHisobsizTolangan(id: number | string | null | undefined): boolean {
  return id != null && HISOBSIZ_TOLANGAN_IDS.has(Number(id));
}

// Hisob-kitob (kirim, foyda, sherik ulushi) uchun buyurtma to'langanmi.
export function isTolanganHisobda(order: { id?: number | string | null; holat?: string | null } | null | undefined): boolean {
  return !!order && order.holat === 'tulangan' && !isHisobsizTolangan(order.id);
}
