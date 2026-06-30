import { describe, it, expect } from 'vitest';
import { compareMonthToDate } from '@/services/predictionService';
import type { Buyurtma } from '@/types';

// Yordamchi: minimal buyurtma yasash
const order = (sana: string, final: number, holat: string = 'tulanmagan'): Buyurtma =>
  ({ sana, final, holat } as Buyurtma);

describe('compareMonthToDate', () => {
  it('shu oy 1–14 vs o\'tgan oy 1–14 (bugun = 14)', () => {
    const now = new Date(2026, 5, 14); // 14-iyun 2026
    const orders = [
      order('2026-06-05', 100000), // bu oy, kiradi
      order('2026-06-14', 50000),  // bu oy, kiradi (14 <= 14)
      order('2026-06-20', 999999), // bu oy, lekin 20 > 14 — kirmaydi
      order('2026-05-05', 80000),  // o'tgan oy, kiradi
      order('2026-05-14', 20000),  // o'tgan oy, kiradi
      order('2026-05-25', 777777), // o'tgan oy, 25 > 14 — kirmaydi
    ];
    const a = compareMonthToDate(orders, now);
    expect(a.day).toBe(14);
    expect(a.current).toBe(150000);   // 100000 + 50000
    expect(a.previous).toBe(100000);  // 80000 + 20000
    expect(a.diff).toBe(50000);
    expect(a.growthPct).toBe(50);
    expect(a.trend).toBe('up');
  });

  it('bekor qilingan buyurtma hisobga olinmaydi', () => {
    const now = new Date(2026, 5, 30);
    const orders = [
      order('2026-06-10', 100000),
      order('2026-06-11', 500000, 'bekor qilingan'), // tushmaydi
    ];
    const a = compareMonthToDate(orders, now);
    expect(a.current).toBe(100000);
  });

  it('o\'tgan oyda kun bo\'lmasa cheklaydi (31-mart → fevral 28)', () => {
    const now = new Date(2026, 2, 31); // 31-mart 2026
    const orders = [
      order('2026-02-28', 40000), // fevral oxiri — kiradi
      order('2026-03-15', 60000), // bu oy
    ];
    const a = compareMonthToDate(orders, now);
    expect(a.previous).toBe(40000); // 31 > 28, lekin 28 kiradi
    expect(a.current).toBe(60000);
  });

  it('o\'tgan oy ma\'lumoti yo\'q bo\'lsa growth 100% va hasPrev false', () => {
    const now = new Date(2026, 5, 10);
    const a = compareMonthToDate([order('2026-06-03', 70000)], now);
    expect(a.previous).toBe(0);
    expect(a.hasPrev).toBe(false);
    expect(a.growthPct).toBe(100);
  });

  it('pasayish — trend down va manfiy farq', () => {
    const now = new Date(2026, 5, 20);
    const orders = [
      order('2026-06-05', 30000),  // bu oy
      order('2026-05-05', 100000), // o'tgan oy
    ];
    const a = compareMonthToDate(orders, now);
    expect(a.diff).toBe(-70000);
    expect(a.trend).toBe('down');
    expect(a.growthPct).toBe(-70);
  });
});
