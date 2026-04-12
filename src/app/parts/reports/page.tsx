'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Package, 
  Search, 
  BarChart, 
  TrendingUp, 
  Calendar,
  History,
  ShoppingCart
} from 'lucide-react';

export default function PartReportsPage() {
  const { zapchastlar, buyurtmalar, mashinalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    mashina: '',
    period: 'all'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const partStats = zapchastlar.map(p => {
    // Collect usage across all orders
    let usageCount = 0;
    let totalGeneratedIncome = 0;
    buyurtmalar.forEach(b => {
      b.zaps.forEach((bp: any) => {
        if (bp.id === p.id) {
          usageCount += bp.qty;
          totalGeneratedIncome += (bp.narx * bp.qty);
        }
      });
    });

    return {
      ...p,
      usageCount,
      totalGeneratedIncome,
      profitPerItem: p.narx - (p.sebestoimost || 0)
    };
  });

  const filtered = partStats.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCar = !filters.mashina || p.mashina === filters.mashina;
    return matchesSearch && matchesCar;
  });

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      <header className="h-[70px] bg-surface flex items-center justify-between px-8 shrink-0 text-white sticky top-0 z-40">
        <h2 className="text-slate-400 font-bold text-[13px] uppercase tracking-widest flex items-center gap-2">
          <History size={18} className="text-green-500" /> Zapchastlar hisoboti
        </h2>
        
        <div className="flex items-center gap-4">
          <select 
            value={filters.mashina}
            onChange={(e) => setFilters({...filters, mashina: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-tighter text-white focus:border-green-500 outline-none transition-all"
          >
            <option value="">Barchasi (Mashina)</option>
            <option value="Umumiy">Umumiy</option>
            {mashinalar.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Zapchast nomi..." 
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[13px] focus:border-green-500 outline-none w-64 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
           <table className="w-full text-left text-[14px]">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                 <tr>
                    <th className="px-6 py-4">Mahsulot</th>
                    <th className="px-6 py-4">Mashina</th>
                    <th className="px-6 py-4 text-center">Ishlatilgan</th>
                    <th className="px-6 py-4 text-right">Mavjud (Balance)</th>
                    <th className="px-6 py-4 text-right">Summa (Sotuv)</th>
                    <th className="px-6 py-4 text-right">Taxminiy Foyda</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filtered.sort((a,b) => b.usageCount - a.usageCount).map((p) => (
                   <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{p.nom}</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{p.bir}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[11px] font-black uppercase tracking-tighter text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">{p.mashina}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-blue-600">{p.usageCount} {p.bir}</td>
                      <td className="px-6 py-4 text-right">
                         <span className={`font-black ${p.balance <= 5 ? 'text-red-500' : 'text-slate-800'}`}>{p.balance} {p.bir}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{p.totalGeneratedIncome.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-black text-green-600">
                         {(p.profitPerItem * p.usageCount).toLocaleString()}
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
