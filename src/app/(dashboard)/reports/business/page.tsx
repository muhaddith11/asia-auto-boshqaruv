'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
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


export default function BusinessReportPage() {
  const { buyurtmalar, ishxonaOperatsiyalar, kassa, maoshTarixi, xodimlar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState('oy'); // kun, hafta, oy, yil

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Simple statistics calculation for the current month
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7);
  const monthOrders = buyurtmalar.filter(b => b.sana && b.sana.startsWith(currentMonth) && b.holat === 'tulangan');
  const orderIncome = monthOrders.reduce((sum, b) => sum + (b.final || 0), 0);

  const localOps = ishxonaOperatsiyalar.filter(op => op.date && op.date.startsWith(currentMonth));
  // Filter out operations that come from orders to avoid double counting
  const manualIncome = localOps.filter(op => op.type === 'income' && op.source !== 'buyurtma').reduce((sum, op) => sum + op.amount, 0);
  const manualExpense = localOps.filter(op => op.type === 'expense').reduce((sum, op) => sum + op.amount, 0);

  const monthMaosh = maoshTarixi.filter(m => m.sana && m.sana.startsWith(currentMonth));
  const totalMaosh = monthMaosh.reduce((sum, m) => sum + m.summa, 0);

  const totalIncome = orderIncome + manualIncome;
  const totalExpense = manualExpense + totalMaosh;
  const netProfit = totalIncome - totalExpense;

  const stats = [
    { label: 'Jami tushum', value: totalIncome, icon: <TrendingUp />, color: 'emerald', trend: '+12.5%' },
    { label: 'Jami xarajat', value: totalExpense, icon: <TrendingDown />, color: 'red', trend: '-2.4%' },
    { label: 'Kassa (Naqd/Karta)', value: kassa.naqd + kassa.karta, icon: <Wallet />, color: 'blue', trend: 'Mavjud' },
    { label: 'Sof foyda (oy)', value: netProfit, icon: <Target />, color: 'amber', trend: '+8.1%' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      {/* PAGE HEADER */}
      <div className="px-8 pt-8 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">Moliyaviy tahlil</h1>
          <p className="text-[13px] text-slate-400 font-medium mt-1.5">Avtoservisning umumiy moliyaviy holati, daromad va xarajatlar tahlili.</p>
        </div>

        <div className="flex bg-surface border border-border rounded-xl p-1 shadow-sm">
          {['kun', 'hafta', 'oy', 'yil'].map((p) => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
                period === p ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] ring-1 ring-blue-400/50' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
             const isPositive = stat.trend.includes('+') || stat.trend === 'Mavjud';
             return (
              <div key={i} className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-sm">
                 <div className="flex items-center justify-between mb-5">
                    <div className={`p-3 rounded-xl ${stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : stat.color === 'red' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : stat.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                      {React.cloneElement(stat.icon as any, { size: 22, strokeWidth: 2.5 })}
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${stat.color === 'red' ? 'bg-red-500/10 text-red-400' : stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : stat.trend === 'Mavjud' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {stat.trend}
                    </span>
                 </div>
                 <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">{stat.label}</div>
                 <div className="text-[28px] font-black text-white leading-none">{stat.value.toLocaleString()} <span className="text-[12px] text-slate-500 font-bold ml-1 uppercase">UZS</span></div>
              </div>
             );
          })}
        </div>

        {/* One-column area: Recent Operations (full width) */}
        <div className="w-full">


          {/* Recent Operations Log (full width) */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
             <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-[#191c25]">
                <h3 className="text-[13px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Receipt size={18} className="text-blue-500" /> So'nggi operatsiyalar
                </h3>
                <Link href="/orders" className="px-4 py-2 rounded-xl bg-white/5 border border-border text-[10px] font-black text-blue-500 hover:text-blue-400 hover:bg-white/10 uppercase tracking-widest flex items-center gap-2 transition-all group/btn decoration-0">
                  Hammasini ko'rish <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
             </div>
             <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left text-[12px] whitespace-nowrap">
                  <thead className="bg-[#1e212b] text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-border">
                    <tr>
                      <th className="px-6 py-4 w-[150px]">SANA / TURI</th>
                      <th style={{ padding: "18px 24px" }}>IZOH / KLIENT</th>
                      <th className="px-6 py-4 text-right w-[140px]">SUMMA</th>
                      <th className="px-6 py-4 text-center w-[100px]">USUL</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderStyle: "solid" }}>
                     {[...buyurtmalar, ...ishxonaOperatsiyalar.filter(op => op.source !== 'buyurtma'), ...maoshTarixi]
                      .sort((a, b) => {
                        const dateA = (a as any).createdAt || (a as any).sana || (a as any).date;
                        const dateB = (b as any).createdAt || (b as any).sana || (b as any).date;
                        
                        const timeA = new Date(dateA).getTime();
                        const timeB = new Date(dateB).getTime();
                        
                        if (timeB !== timeA) return timeB - timeA;
                        return (b as any).id - (a as any).id;
                      })
                      .slice(0, 25).map((op, i) => {
                       const isOrder = 'final' in op;
                       const isMaosh = 'xodimId' in op;
                       
                       const opDate = isOrder ? (op as any).sana : (op as any).date || (op as any).sana;
                       const opAmount = isOrder ? (op as any).final : (isMaosh ? (op as any).summa : (op as any).amount);
                       const opType = isOrder ? 'BUYURTMA' : (isMaosh ? 'MAOSH' : (op as any).type);
                       
                       let opComment = '';
                       if (isOrder) {
                         opComment = (op as any).ism;
                       } else if (isMaosh) {
                         const worker = xodimlar.find(w => w.id === (op as any).xodimId);
                         opComment = `Ish xaqi: ${worker?.ism || 'Xodim'}`;
                       } else {
                         opComment = (op as any).comment || (op as any).category;
                       }

                       const opMethod = isOrder ? 'NAQD' : (op as any).method;

                       return (
                         <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="hover:bg-white/[0.02] transition-colors">
                           <td style={{ padding: "18px 24px" }}>
                             <div className="text-[10px] text-slate-500 font-bold mb-1">{opDate}</div>
                             <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-black tracking-tighter border ${
                               isOrder || (op as any).type === 'income' 
                               ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                               : 'bg-red-500/10 text-red-500 border-red-500/20'
                             }`}>
                               {opType === 'income' ? 'Kirim' : opType === 'expense' ? 'Chiqim' : opType === 'MAOSH' ? 'Ish xaqi' : 'Order'}
                             </span>
                           </td>
                           <td style={{ padding: "18px 24px" }}>
                             <div className="max-w-[200px] truncate font-bold text-slate-300">{opComment}</div>
                           </td>
                           <td style={{ padding: "18px 24px", textAlign: "right" }}>
                             <span className={`font-black text-[14px] ${
                               opAmount === 0 ? 'text-slate-600' :
                               (isOrder || (op as any).type === 'income' ? 'text-emerald-400' : 'text-red-400')
                             }`}>
                               {opAmount?.toLocaleString?.() ?? opAmount}
                             </span>
                           </td>
                           <td style={{ padding: "18px 24px", textAlign: "center" }}>
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
        </div>
      </div>
    </div>
  );
}
