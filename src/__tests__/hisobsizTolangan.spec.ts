import { describe, it, expect } from 'vitest';
import { isHisobsizTolangan, isTolanganHisobda } from '@/lib/hisobsizTolangan';
import { realizedProfit } from '@/lib/realizedProfit';
import { buildLedgerRows } from '@/lib/businessLedger';
import { computePeriodFoyda } from '@/lib/dailyReport';

// Egasi qarori (2026-11-23): puli ilgari olingan, lekin yozilmay qolgan eski
// buyurtmalar "To'langan" bo'ladi, ammo kassa, hisobot va sherik ulushida
// hech narsa o'zgarmaydi — hisob-kitobda avvalgidek to'lanmagan deb olinadi.

// Ro'yxatdagi buyurtma (#1146) va ro'yxatda yo'q oddiy buyurtma (#5000).
const LISTED = 1146;
const ODDIY = 5000;

const order = (id: number, holat: string) => ({
  id, holat, sana: '2026-07-06', final: 5_800_000, pribil: 4_060_000, zarplata: 1_740_000, zaps: [], services: [],
  createdAt: '2026-07-06T10:00:00Z',
});

describe('isTolanganHisobda', () => {
  it('ro\'yxatdagi buyurtma to\'langan bo\'lsa ham hisobda to\'lanmagan', () => {
    expect(isHisobsizTolangan(LISTED)).toBe(true);
    expect(isHisobsizTolangan(String(LISTED))).toBe(true);
    expect(isTolanganHisobda(order(LISTED, 'tulangan'))).toBe(false);
  });

  it('oddiy to\'langan buyurtma o\'zgarmaydi', () => {
    expect(isHisobsizTolangan(ODDIY)).toBe(false);
    expect(isTolanganHisobda(order(ODDIY, 'tulangan'))).toBe(true);
    expect(isTolanganHisobda(order(ODDIY, 'tulanmagan'))).toBe(false);
  });
});

describe('sherik ulushi (realizedProfit) o\'zgarmaydi', () => {
  it('ro\'yxatdagi buyurtma: to\'langan holatda ham faqat chegaradan keyingi qisman to\'lov sanaladi', () => {
    const oldin = realizedProfit(order(LISTED, 'tulanmagan'), 3_680_000);
    const keyin = realizedProfit(order(LISTED, 'tulangan'), 3_680_000);
    expect(keyin).toBe(oldin);
    expect(keyin).toBe(3_680_000);
    expect(realizedProfit(order(LISTED, 'tulangan'))).toBe(0);
  });

  it('oddiy to\'langan buyurtma foydasi to\'liq sanaladi', () => {
    expect(realizedProfit(order(ODDIY, 'tulangan'))).toBe(4_060_000);
  });
});

describe('ishxona hisoboti (buildLedgerRows) kirimga yozmaydi', () => {
  it('to\'lov yozuvi yo\'q ro\'yxatdagi buyurtma kirim qatori bermaydi', () => {
    const rows = buildLedgerRows([order(LISTED, 'tulangan')], [], [], []);
    expect(rows).toHaveLength(0);
  });

  it('to\'lov yozuvi yo\'q oddiy to\'langan buyurtma avvalgidek kirim beradi', () => {
    const rows = buildLedgerRows([order(ODDIY, 'tulangan')], [], [], []);
    expect(rows).toHaveLength(1);
    expect(rows[0]._amount).toBe(5_800_000);
  });
});

describe('davr foydasi (computePeriodFoyda) o\'zgarmaydi', () => {
  it('ro\'yxatdagi buyurtmaning yozilmagan foydasi hech qaysi kunga tushmaydi', () => {
    const oldin = computePeriodFoyda([order(LISTED, 'tulanmagan')], [], '', '');
    const keyin = computePeriodFoyda([order(LISTED, 'tulangan')], [], '', '');
    expect(keyin).toBe(oldin);
    expect(keyin).toBe(0);
  });

  it('oddiy to\'langan buyurtma foydasi sanasiga tushadi', () => {
    expect(computePeriodFoyda([order(ODDIY, 'tulangan')], [], '', '')).toBe(4_060_000);
  });
});
