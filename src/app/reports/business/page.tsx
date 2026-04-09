'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Receipt,
  PieChart,
  Target,
  ArrowRight,
  BrainCircuit,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { analyzeTrends, getColorForTrend } from '@/services/predictionService';

export default function BusinessReportPage() {
  const { buyurtmalar, tashqariOperatsiyalar, kassa } = useStore();
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState('oy'); // kun, hafta, oy, yil

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Simple statistics calculation for the current month
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7);
  
  const monthOrders = buyurtmalar.filter(b => b.sana.startsWith(currentMonth));
  const orderIncome = monthOrders.reduce((sum, b) => sum + b.final, 0);
  const orderCost = monthOrders.reduce((sum, b) => sum + b.zap, 0);
  
  const externalOps = tashqariOperatsiyalar.filter(op => op.date.startsWith(currentMonth));
  const extIncome = externalOps.filter(op => op.type === 'income').reduce((sum, op) => sum + op.amount, 0);
  const extExpense = externalOps.filter(op => op.type === 'expense').reduce((sum, op) => sum + op.amount, 0);

  const totalIncome = orderIncome + extIncome;
  const totalExpense = extExpense; 
  const netProfit = totalIncome - totalExpense;

  const analysis = analyzeTrends(buyurtmalar);

  const stats = [
    { label: 'Jami tushum', value: totalIncome, icon: <TrendingUp />, color: 'emerald', trend: '+12.5%' },
    { label: 'Jami xarajat', value: totalExpense, icon: <TrendingDown />, color: 'red', trend: '-2.4%' },
    { label: 'Kassa (Naqd/Karta)', value: kassa.naqd + kassa.karta, icon: <Wallet />, color: 'blue', trend: 'Mavjud' },
    { label: 'Sof foyda (oy)', value: netProfit, icon: <Target />, color: 'amber', trend: '+8.1%' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      
      {/* ── PAGE HEADER ── */}
      <div className="px-7 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-white tracking-tight">Moliyaviy tahlil</h1>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Avtoservisning umumiy moliyaviy holati, daromad va xarajatlar tahlili.</p>
        </div>
        
        <div className="flex bg-surface border border-border rounded-xl p-1 shadow-sm">
          {['kun', 'hafta', 'oy', 'yil'].map((p) => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
                period === p 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7 space-y-7">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${
                    stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                    stat.color === 'red' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                    stat.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                    'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {React.cloneElement(stat.icon as any, { size: 20, strokeWidth: 2.5 })}
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    stat.color === 'red' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {stat.trend}
                  </span>
               </div>
               <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
               <div className="text-[22px] font-black text-white">
                  {stat.value.toLocaleString()} <span className="text-[10px] text-slate-600 font-bold ml-1 uppercase">UZS</span>
               </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
          {/* Recent Operations Log */}
          <div className="xl:col-span-2 bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
             <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-[#1d1f27]">
                <h3 className="text-[13px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Receipt size={18} className="text-blue-500" /> So'nggi operatsiyalar
                </h3>
                <button className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1 transition-all">
                  Hammasini ko'rish <ArrowRight size={12} />
                </button>
             </div>
             <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left text-[12px] whitespace-nowrap">
                  <thead className="bg-[#1e212b] text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-border">
                    <tr>
                      <th className="px-6 py-4">SANA / TURI</th>
                      <th className="px-6 py-4">IZOH / KLIENT</th>
                      <th className="px-6 py-4 text-right">SUMMA</th>
                      <th className="px-6 py-4 text-center">USUL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {[...buyurtmalar, ...tashqariOperatsiyalar]
                      .sort((a, b) => {
                        const dateA = (a as any).date || (a as any).sana || (a as any).createdAt;
                        const dateB = (b as any).date || (b as any).sana || (b as any).createdAt;
                        return new Date(dateB).getTime() - new Date(dateA).getTime();
                      })
                      .slice(0, 10).map((op, i) => {
                       const isOrder = 'final' in op;
                       const opDate = isOrder ? op.sana : op.date;
                       const opAmount = isOrder ? op.final : op.amount;
                       const opType = isOrder ? 'BUYURTMA' : op.type;
                       const opComment = isOrder ? op.ism : (op.comment || op.category);
                       const opMethod = isOrder ? 'NAQD' : op.method;

                       return (
                         <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                           <td className="px-6 py-4">
                             <div className="text-[10px] text-slate-500 font-bold mb-1">{opDate}</div>
                             <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-black tracking-tighter border ${
                               isOrder || (op as any).type === 'income' 
                               ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                               : 'bg-red-500/10 text-red-500 border-red-500/20'
                             }`}>
                               {opType === 'income' ? 'Kirim' : opType === 'expense' ? 'Chiqim' : 'Order'}
                             </span>
                           </td>
                           <td className="px-6 py-4">
                             <div className="max-w-[200px] truncate font-bold text-slate-300">{opComment}</div>
                           </td>
                           <td className="px-6 py-4 text-right">
                             <span className={`font-black text-[14px] ${
                               isOrder || (op as any).type === 'income' ? 'text-emerald-400' : 'text-red-400'
                             }`}>
                               {opAmount.toLocaleString()}
                             </span>
                           </td>
                           <td className="px-6 py-4 text-center">
                             <span className="text-[10px] text-slate-500 uppercase font-black border border-border px-3 py-1 rounded-lg bg-surface2/30">
                               {opMethod}
                             </span>
                           </td>
                         </tr>
                       );
                     })}
                  </tbody>
                </table>
             </div>
          </div>

          {/* AI Prediction Breakdown */}
          <div className="bg-surface border border-border rounded-2xl p-7 shadow-sm">
             <h3 className="text-[13px] font-bold text-white uppercase tracking-wider mb-8 flex items-center gap-2">
                <BrainCircuit size={18} className="text-purple-500" /> AI BASHORAT VA TAHLIL
             </h3>
             
             <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 mb-8">
                <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Keyingi oy uchun bashorat</div>
                <div className="text-[26px] font-black text-white mb-2">{analysis.prediction} <span className="text-[12px] text-slate-500">UZS</span></div>
                <div className="flex items-center gap-2">
                   <div className={`text-[11px] font-black px-2 py-0.5 rounded ${analysis.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {analysis.growth > 0 ? '+' : ''}{analysis.growth}%
                   </div>
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">O'tgan oyga nisbatan</div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border">
                   <ShieldCheck size={18} className="text-emerald-500" />
                   <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase">Ishonch darajasi</div>
                      <div className="text-[12px] font-bold text-white uppercase">{analysis.confidence === 'high' ? 'YUQORI' : analysis.confidence === 'medium' ? 'O\'RTA' : 'PAST'}</div>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border">
                   <Zap size={18} className="text-amber-500" />
                   <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase">Trend holati</div>
                      <div className="text-[12px] font-bold text-white uppercase">{analysis.trend === 'up' ? 'O\'SISHDA' : 'PASAYISHDA'}</div>
                   </div>
                </div>
             </div>

             <p className="text-[10px] text-slate-600 font-medium italic mt-8 text-center px-4 leading-relaxed">
                * Bashoratlar so'nggi ma'lumotlar tahlili asosida generatsiya qilindi.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
