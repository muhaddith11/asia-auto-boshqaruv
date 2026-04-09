'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Users, 
  Search, 
  Target, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  User as UserIcon,
  Filter,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

const S = {
  input: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 12,
    color: 'var(--text)',
    outline: 'none',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text3)',
    marginBottom: 6,
    letterSpacing: '0.02em',
  } as React.CSSProperties,
};

export default function ClientReportsPage() {
  const { mijozlar, buyurtmalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    debtOnly: false,
    period: 'all'
  });
  const [appliedFilters, setAppliedFilters] = useState({ search: '', debtOnly: false, period: 'all' });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const clientStats = mijozlar.map(m => {
    const orders = buyurtmalar.filter(b => b.tel === m.tel || b.ism === m.ism);
    const totalSpent = orders.reduce((sum, b) => sum + (b.final || 0), 0);
    const totalProfit = orders.reduce((sum, b) => sum + (b.pribil || 0), 0);
    const servicesCount = orders.reduce((sum, b) => sum + b.services.length, 0);

    return {
      ...m,
      totalSpent,
      totalProfit,
      servicesCount,
      lastSeen: orders.length > 0 ? orders.sort((a,b) => b.sana.localeCompare(a.sana))[0].sana : '—'
    };
  });

  const filtered = clientStats.filter(c => {
    const matchesSearch = c.ism.toLowerCase().includes(appliedFilters.search.toLowerCase());
    const matchesDebt = appliedFilters.debtOnly ? (c.qarzdorlik > 0) : true;
    return matchesSearch && matchesDebt;
  });

  const applyFilters = () => setAppliedFilters({ ...filters });
  const resetFilters = () => {
    const defaultF = { search: '', debtOnly: false, period: 'all' };
    setFilters(defaultF);
    setAppliedFilters(defaultF);
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      
      {/* ── PAGE HEADER ── */}
      <div className="px-7 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-white tracking-tight">Mijozlar hisoboti</h1>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Mijozlarning faolligi, foyda ulushi va debitorlik qarzlari tahlili.</p>
        </div>
      </div>

      {/* ── FILTERS PANEL ── */}
      <div className="mx-7 mt-4 p-5 bg-surface border border-border rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label style={S.label}>Mijoz ismi</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" placeholder="Ism bo'yicha qidiruv..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                style={{ ...S.input, paddingLeft: '34px' }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label style={S.label}>Davr</label>
            <div className="relative">
              <select 
                value={filters.period}
                onChange={(e) => setFilters({...filters, period: e.target.value})}
                style={S.input} className="appearance-none"
              >
                <option value="all">Barcha vaqt</option>
                <option value="today">Bugun</option>
                <option value="month">Shu oy</option>
                <option value="year">Shu yil</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6">
             <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={filters.debtOnly}
                  onChange={(e) => setFilters({...filters, debtOnly: e.target.checked})}
                  className="w-4 h-4 rounded border-border bg-surface2 checked:bg-indigo-600 transition-all"
                />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-200 transition-colors">Faqat qarzdorlar</span>
             </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
           <button 
              onClick={applyFilters}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-lg text-[12px] transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
            >
              Tahlil qilish
            </button>
            <button 
              onClick={resetFilters}
              className="px-6 border border-border bg-surface2 hover:bg-surface3 text-slate-400 py-2.5 rounded-lg text-[12px] transition-all active:scale-95"
            >
              Tozalash
            </button>
        </div>
      </div>

      {/* ── REPORT TABLE ── */}
      <div className="flex-1 px-7 py-5 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-surface/30 border border-dashed border-border rounded-xl">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="text-[14px] font-bold">Hisobot uchun ma'lumotlar topilmadi</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-[12px] whitespace-nowrap">
              <thead className="bg-[#1e212b] text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-4">MIJOZ</th>
                  <th className="px-6 py-4">XIZMATLAR</th>
                  <th className="px-6 py-4 text-right">JAMI XARAJKAT</th>
                  <th className="px-6 py-4 text-right">BERGAN FOYDASI</th>
                  <th className="px-6 py-4 text-right">QARZDORLIK</th>
                  <th className="px-6 py-4 text-center">OXIRGI TASHRIF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.sort((a,b) => b.totalSpent - a.totalSpent).map((c, idx) => (
                  <tr key={c.id} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'} hover:bg-white/[0.02] transition-colors group`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">
                           {c.ism.charAt(0).toUpperCase()}
                         </div>
                         <span className="font-bold text-white uppercase">{c.ism}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-400">{c.servicesCount} ta</td>
                    <td className="px-6 py-4 text-right">
                       <span className="font-bold text-slate-300">{c.totalSpent.toLocaleString()} <span className="text-[9px] text-slate-600">so'm</span></span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="font-black text-emerald-500">{c.totalProfit.toLocaleString()} <span className="text-[9px] text-emerald-800">UZS</span></span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className={`font-black ${c.qarzdorlik > 0 ? 'text-red-500' : 'text-slate-600'}`}>
                          {c.qarzdorlik.toLocaleString()}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 font-medium">{c.lastSeen}</td>
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
