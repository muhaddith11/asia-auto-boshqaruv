'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  UserCog, 
  Search, 
  Banknote, 
  TrendingUp, 
  Calendar,
  Award,
  BarChart3
} from 'lucide-react';

export default function WorkerReportsPage() {
  const { xodimlar, buyurtmalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    period: 'oy' // oy, yil
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const workerStats = xodimlar.map(x => {
    // Collect stats from orders where this worker was assigned to at least one service
    let totalServicesAmount = 0;
    let servicesPerformed = 0;

    buyurtmalar.forEach(b => {
      b.services.forEach(s => {
        if (s.workerId === x.id) {
          totalServicesAmount += (s.narx || 0);
          servicesPerformed += 1;
        }
      });
    });

    const earned = Math.round(totalServicesAmount * (x.foiz || 0) / 100);

    return {
      ...x,
      totalServicesAmount,
      servicesPerformed,
      earned,
      performance: servicesPerformed > 0 ? (totalServicesAmount / servicesPerformed).toFixed(0) : 0
    };
  });

  const filtered = workerStats.filter(w => 
    w.ism.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      <header className="h-[70px] bg-surface flex items-center justify-between px-8 shrink-0 text-white sticky top-0 z-40">
        <h2 className="text-slate-400 font-bold text-[13px] uppercase tracking-widest flex items-center gap-2">
          <Award size={18} className="text-blue-500" /> Xodimlar unumdorligi hisoboti
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Xodim ismi..." 
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[13px] focus:border-blue-500 outline-none w-64 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
           <table className="w-full text-left text-[14px]">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                 <tr>
                    <th className="px-6 py-4">Xodim</th>
                    <th className="px-6 py-4">Mutaxassislik</th>
                    <th className="px-6 py-4 text-center">Xizmatlar</th>
                    <th className="px-6 py-4 text-right">Umumiy ish (Summa)</th>
                    <th className="px-6 py-4 text-right">Ulush ({workerStats[0]?.foiz}%)</th>
                    <th className="px-6 py-4 text-right">O'rtacha chek</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filtered.sort((a,b) => b.earned - a.earned).map((w) => (
                   <tr key={w.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[11px] font-black text-blue-500 border border-blue-100 italic">{w.ism.charAt(0)}</div>
                            <span className="font-bold text-slate-800">{w.ism}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-bold text-[12px] uppercase tracking-tighter">{w.mutax || 'Usta'}</td>
                      <td className="px-6 py-4 text-center font-black text-slate-400">{w.servicesPerformed} ta</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">{w.totalServicesAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-black text-blue-600">{w.earned.toLocaleString()} <span className="text-[10px]">sum</span></td>
                      <td className="px-6 py-4 text-right font-black text-slate-400">
                         {Number(w.performance).toLocaleString()}
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
