import { Buyurtma } from '@/types';

export const analyzeTrends = (buyurtmalar: Buyurtma[]) => {
  if (buyurtmalar.length < 5) return { 
    confidence: 'low', 
    prediction: 'Ma\'lumotlar yetarli emas',
    growth: 0
  };

  // Group by month
  const monthlyData: Record<string, number> = {};
  buyurtmalar.forEach(b => {
    const month = b.sana.substring(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + b.final;
  });

  const months = Object.keys(monthlyData).sort();
  const values = months.map(m => monthlyData[m]);

  if (values.length < 2) return {
    confidence: 'medium',
    prediction: (values[0] * 1.05).toLocaleString(), // Simple 5% growth guess
    growth: 5
  };

  // Calculate simple growth rate
  const lastMonth = values[values.length - 1];
  const prevMonth = values[values.length - 2];
  const growthRate = ((lastMonth - prevMonth) / prevMonth);
  
  const prediction = lastMonth * (1 + growthRate);

  return {
    confidence: values.length > 3 ? 'high' : 'medium',
    prediction: Math.round(prediction).toLocaleString(),
    growth: Math.round(growthRate * 100),
    trend: growthRate > 0 ? 'up' : 'down'
  };
};

export const getColorForTrend = (trend: string) => {
  return trend === 'up' ? '#10b981' : '#f43f5e';
};

// ─────────────────────────────────────────────────────────────────────────────
// Oyma-oy solishtirma: shu oyning 1–bugungi kunigacha aylanmasini o'tgan oyning
// xuddi shu davri (1–shu kun) bilan solishtiradi.
// Misol: bugun 14-bo'lsa → bu oy 1–14 vs o'tgan oy 1–14.
// Aylanma = buyurtma to'lov summasi (final), bekor qilinganlar hisobga olinmaydi.
// ─────────────────────────────────────────────────────────────────────────────
export const compareMonthToDate = (buyurtmalar: Buyurtma[], now: Date = new Date()) => {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // O'tgan oy
  const prevRef = new Date(year, month - 1, 1);
  const prevYear = prevRef.getFullYear();
  const prevMonth = prevRef.getMonth();
  // O'tgan oyda shu kun bo'lmasligi mumkin (masalan, fevral) — cheklab qo'yamiz
  const daysInPrev = new Date(prevYear, prevMonth + 1, 0).getDate();
  const prevCapDay = Math.min(day, daysInPrev);

  let current = 0;
  let previous = 0;

  buyurtmalar.forEach(b => {
    if (!b.sana || b.holat === 'bekor qilingan') return;
    const parts = String(b.sana).split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!y || !m || !d) return;
    const total = b.final || 0;

    if (y === year && (m - 1) === month && d <= day) {
      current += total;
    } else if (y === prevYear && (m - 1) === prevMonth && d <= prevCapDay) {
      previous += total;
    }
  });

  const diff = current - previous;
  const growthPct = previous > 0
    ? Math.round((diff / previous) * 100)
    : (current > 0 ? 100 : 0);

  return {
    day,
    current,
    previous,
    diff,
    growthPct,
    trend: (diff >= 0 ? 'up' : 'down') as 'up' | 'down',
    hasPrev: previous > 0,
  };
};
