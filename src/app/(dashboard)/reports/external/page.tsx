'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import PageLayout from '@/components/layout/PageLayout';
import { 
  Plus, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Trash2, 
  Search, 
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart3,
  Banknote,
  CreditCard,
  RotateCcw
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function ExternalOperationsPage() {
  const { tashqariOperatsiyalar, deleteTashqariOperatsiya, kassa, resetKassa } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all', // all, income, expense
    category: 'all'
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });
  const [resetConfirm, setResetConfirm] = useState(false);

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
    <PageLayout
      title="Aylanmadan tashqari operatsiyalar"
      subtitle="Barcha tashqi kirim va chiqimlar, operatsion xarajatlar va daromadlar."
      headerActions={
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

          <button 
            onClick={() => setResetConfirm(true)}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
          >
            <RotateCcw size={16} /> Hisobni tozalash
          </button>
        </div>
      }
      filterPanel={null}
    >
      <div className="flex-1 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center gap-5 backdrop-blur-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                 <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                    <ChevronUp size={24} />
                 </div>
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Jami Kirim</div>
                 <div className="text-[22px] font-black text-emerald-500 tracking-tight">
                    {totalIncome.toLocaleString()} <span className="text-[12px] opacity-60 font-bold ml-1 uppercase">uzs</span>
                 </div>
              </div>
           </div>
           <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center gap-5 backdrop-blur-xl">
              <div className="w-14 h-14 rounded-2xl bg-red-500/5 flex items-center justify-center text-red-500 border border-red-500/10">
                 <div className="bg-red-500/10 p-2.5 rounded-xl">
                    <ChevronDown size={24} />
                 </div>
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Jami Chiqim</div>
                 <div className="text-[22px] font-black text-red-500 tracking-tight">
                    {totalExpense.toLocaleString()} <span className="text-[12px] opacity-60 font-bold ml-1 uppercase">uzs</span>
                 </div>
              </div>
           </div>
           <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center gap-5 backdrop-blur-xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/5 flex items-center justify-center text-indigo-500 border border-indigo-500/10">
                 <div className="bg-indigo-500/10 p-2.5 rounded-xl">
                    <BarChart3 size={24} />
                 </div>
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Sof Farq</div>
                 <div className="text-[22px] font-black text-white tracking-tight">
                    {(totalIncome - totalExpense).toLocaleString()} <span className="text-[12px] opacity-40 font-bold ml-1 uppercase">uzs</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex-1">
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
                  {filteredOps.sort((a, b) => {
                    const timeA = new Date(a.createdAt || a.date).getTime();
                    const timeB = new Date(b.createdAt || b.date).getTime();
                    if (timeB !== timeA) return timeB - timeA;
                    return b.id - a.id;
                  }).map((op) => (
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
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setDeleteConfirm({ isOpen: true, id: op.id });
                            }}
                            style={{ padding: 7, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 7, cursor: 'pointer', color: '#f43f5e', display: 'flex' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = '#f43f5e')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(244,63,94,0.15)')}
                            title="O'chirish"
                          >
                             <Trash2 size={14} />
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

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        title="Operatsiyani o'chirish"
        message="Haqiqatdan ham ushbu moliyaviy amaliyotni o'chirib tashlamoqchimisiz? Bu kassa balansiga ta'sir qilishi mumkin."
        onConfirm={() => {
          if (deleteConfirm.id) deleteTashqariOperatsiya(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, id: null });
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />

      <ConfirmModal 
        isOpen={resetConfirm}
        title="Hisobni to'liq tozalash"
        message="Haqiqatdan ham kassa balansini va barcha operatsiyalar tarixini o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
        onConfirm={() => {
          resetKassa();
          setResetConfirm(false);
        }}
        onCancel={() => setResetConfirm(false)}
      />
    </PageLayout>
  );
}
