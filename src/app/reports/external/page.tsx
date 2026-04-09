'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Plus, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Trash2, 
  Search, 
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart3
} from 'lucide-react';

export default function ExternalOperationsPage() {
  const { tashqariOperatsiyalar, deleteTashqariOperatsiya } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all', // all, income, expense
    category: 'all'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredOps = tashqariOperatsiyalar.filter(op => {
    const sTerm = filters.search.toLowerCase();
    const matchesSearch = op.category.toLowerCase().includes(sTerm) || (op.comment && op.comment.toLowerCase().includes(sTerm));
    const matchesType = filters.type === 'all' || op.type === filters.type;
    const matchesCat = filters.category === 'all' || op.category === filters.category;
    
    // Specifically handle "Aylanmadan tashqari" if that's what's intended for this page
    // Or just show everything that isn't connected to a direct order purchase/system
    return matchesSearch && matchesType && matchesCat;
  });

  const uniqueCategories = Array.from(new Set(tashqariOperatsiyalar.map(op => op.category)));

  const totalIncome = filteredOps.filter(op => op.type === 'income').reduce((s, op) => s + op.amount, 0);
  const totalExpense = filteredOps.filter(op => op.type === 'expense').reduce((s, op) => s + op.amount, 0);

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      <header className="h-[80px] bg-surface flex items-center justify-between px-8 shrink-0 border-b border-border shadow-sm">
        <div>
          <h2 className="text-white font-black text-[18px] flex items-center gap-3">
            <BarChart3 size={22} className="text-indigo-500" /> 
            Aylanmadan tashqari operatsiyalar
          </h2>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Barcha tashqi kirim va chiqimlar</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface2 border border-border rounded-xl px-3 py-2 gap-2">
            <Search size={16} className="text-slate-500" />
            <input 
              type="text"
              placeholder="Qidiruv..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="bg-transparent border-none outline-none text-white text-[13px] w-[200px]"
            />
          </div>
          
          <div className="relative">
            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="bg-surface2 border border-border rounded-xl px-4 py-2.5 text-[12px] font-bold text-white outline-none focus:border-indigo-500 appearance-none pr-10"
            >
              <option value="all">Barcha turlar</option>
              <option value="income">Kirimlar</option>
              <option value="expense">Chiqimlar</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 bg-surface/50 border-b border-border">
         <div className="bg-surface2 border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
               <ChevronUp size={24} />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jami Kirim</div>
               <div className="text-[20px] font-black text-emerald-500">{totalIncome.toLocaleString()} <span className="text-[12px]">sum</span></div>
            </div>
         </div>
         <div className="bg-surface2 border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
               <ChevronDown size={24} />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jami Chiqim</div>
               <div className="text-[20px] font-black text-red-500">{totalExpense.toLocaleString()} <span className="text-[12px]">sum</span></div>
            </div>
         </div>
         <div className="bg-surface2 border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
               <BarChart3 size={24} />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sof Farq</div>
               <div className="text-[20px] font-black text-white">{(totalIncome - totalExpense).toLocaleString()} <span className="text-[12px]">sum</span></div>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {filteredOps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <BarChart3 size={80} className="mb-4 opacity-5" />
            <p className="text-lg font-bold text-slate-600">Operatsiyalar topilmadi</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-[14px] whitespace-nowrap">
              <thead className="bg-[#1e212b] text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-8 py-5">Sana</th>
                  <th className="px-6 py-5">Kategoriya</th>
                  <th className="px-6 py-5">Izoh</th>
                  <th className="px-6 py-5 text-right">Summa</th>
                  <th className="px-6 py-5">To'lov usuli</th>
                  <th className="px-8 py-5 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredOps.sort((a,b) => b.date.localeCompare(a.date)).map((op) => (
                  <tr key={op.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-4">
                      <div className="text-slate-400 font-bold text-[13px]">{op.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tight border ${
                        op.type === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {op.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 font-medium max-w-[250px] truncate">{op.comment || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`text-[16px] font-black ${op.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {op.type === 'income' ? '+' : '-'}{op.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[12px] uppercase">
                        {op.method === 'naqd' ? <Banknote size={14} /> : <CreditCard size={14} />}
                        {op.method}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => { if(confirm('Ochirishni tasdiqlaysizmi?')) deleteTashqariOperatsiya(op.id); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                        >
                           <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-icons for the table
function Banknote({ size, className }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
  );
}

function CreditCard({ size, className }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
  );
}
