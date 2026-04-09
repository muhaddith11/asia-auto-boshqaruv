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
