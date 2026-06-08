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
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });
  const [resetConfirm, setResetConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeQuick, setActiveQuick] = useState('');
  const ITEMS_PER_PAGE = 30;

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setCurrentPage(1); }, [filters]);

  function applyQuick(key: string) {
    const now = new Date();
    let from = '', to = '';
    if (key === 'today') {
      from = to = now.toISOString().slice(0, 10);
    } else if (key === 'week') {
      const day = now.getDay() || 7;
      const mon = new Date(now); mon.setDate(now.getDate() - day + 1);
      from = mon.toISOString().slice(0, 10);
      to   = now.toISOString().slice(0, 10);
    } else if (key === 'month') {
      from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
      to   = now.toISOString().slice(0, 10);
    } else if (key === 'lastmonth') {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      from = d.toISOString().slice(0, 10);
      to   = last.toISOString().slice(0, 10);
    }
    setActiveQuick(key);
    setFilters(f => ({ ...f, dateFrom: from, dateTo: to }));
  }

  if (!mounted) return null;

  const filteredOps = tashqariOperatsiyalar.filter(op => {
    const sTerm = filters.search.toLowerCase();
    const matchesSearch = op.category.toLowerCase().includes(sTerm) || (op.comment && op.comment.toLowerCase().includes(sTerm));
    const matchesType = filters.type === 'all' || op.type === filters.type;
    const matchesCat = filters.category === 'all' || op.category === filters.category;
    const opDate = (op as any).date || (op as any).sana || '';
    const matchesFrom = !filters.dateFrom || opDate >= filters.dateFrom;
    const matchesTo   = !filters.dateTo   || opDate <= filters.dateTo;
    return matchesSearch && matchesType && matchesCat && matchesFrom && matchesTo;
  });

  const sortedOps = [...filteredOps].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.date).getTime();
    const timeB = new Date(b.createdAt || b.date).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return b.id - a.id;
  });
  const totalPages = Math.ceil(filteredOps.length / ITEMS_PER_PAGE);
  const paginatedOps = sortedOps.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const uniqueCategories = Array.from(new Set(tashqariOperatsiyalar.map(op => op.category)));

  const totalIncome = filteredOps.filter(op => op.type === 'income').reduce((s, op) => s + op.amount, 0);
  const totalExpense = filteredOps.filter(op => op.type === 'expense').reduce((s, op) => s + op.amount, 0);

  const inputSt: React.CSSProperties = {
    background: '#121721',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 12,
    color: 'white',
    outline: 'none',
    width: '100%',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 800,
    color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase',
  };

  return (
    <PageLayout
      title="Aylanmadan tashqari operatsiyalar"
      subtitle="Barcha tashqi kirim va chiqimlar, operatsion xarajatlar va daromadlar."
      headerActions={
        <button
          onClick={() => setResetConfirm(true)}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
        >
          <RotateCcw size={16} /> Hisobni tozalash
        </button>
      }
      filterPanel={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
          {/* Qidiruv */}
          <div>
            <label style={lbl}>Qidiruv</label>
            <div style={{ ...inputSt, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
              <Search size={14} color="var(--text3)" />
              <input
                type="text"
                placeholder="Kategoriya, izoh..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 12, width: '100%', padding: '8px 0' }}
              />
            </div>
          </div>

          {/* Turi */}
          <div>
            <label style={lbl}>Turi</label>
            <select
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              style={inputSt}
            >
              <option value="all">Barchasi</option>
              <option value="income">Kirim</option>
              <option value="expense">Chiqim</option>
            </select>
          </div>

          {/* Muddat dan */}
          <div>
            <label style={lbl}>Muddat (Dan)</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => { setActiveQuick(''); setFilters({ ...filters, dateFrom: e.target.value }); }}
              style={inputSt}
            />
          </div>

          {/* Muddat gacha */}
          <div>
            <label style={lbl}>Muddat (Gacha)</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => { setActiveQuick(''); setFilters({ ...filters, dateTo: e.target.value }); }}
              style={inputSt}
            />
          </div>

          {/* Tezkor tugmalar */}
          <div>
            <label style={lbl}>Tezkor</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'today',     label: 'Bugun' },
                { key: 'week',      label: 'Hafta' },
                { key: 'month',     label: 'Oy' },
                { key: 'lastmonth', label: "O'tgan" },
              ].map(q => (
                <button
                  key={q.key}
                  onClick={() => {
                    if (activeQuick === q.key) {
                      setActiveQuick('');
                      setFilters(f => ({ ...f, dateFrom: '', dateTo: '' }));
                    } else {
                      applyQuick(q.key);
                    }
                  }}
                  style={{
                    padding: '8px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: activeQuick === q.key ? '#4f46e5' : 'var(--surface2)',
                    color: activeQuick === q.key ? '#fff' : 'var(--text2)',
                  }}
                >
                  {q.label}
                </button>
              ))}
              <button
                onClick={() => { setActiveQuick(''); setFilters({ search: '', type: 'all', category: 'all', dateFrom: '', dateTo: '' }); }}
                style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--surface2)', border: 'none', cursor: 'pointer' }}
                title="Tozalash"
              >
                <RotateCcw size={14} color="var(--text3)" />
              </button>
            </div>
          </div>
        </div>
      }
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
                  {paginatedOps.map((op) => (
                    <tr key={op.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-0.5">
                          <div className="text-white font-black text-[14px]">{(op as any).date || (op as any).sana}</div>
                          <div className="text-white/60 font-medium text-[11px]">
                            {(() => {
                              const ts = op.createdAt || (op as any).created_at;
                              return ts ? new Date(ts).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '';
                            })()}
                          </div>
                        </div>
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

          {filteredOps.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-2 mt-6 pb-4">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-surface border border-border text-slate-400 text-[12px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-500 transition-all">
                Oldingi
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-[12px] font-bold transition-all ${currentPage === page ? 'bg-indigo-600 text-white border border-indigo-600' : 'bg-surface border border-border text-slate-400 hover:border-slate-500'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-surface border border-border text-slate-400 text-[12px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-500 transition-all">
                Keyingi
              </button>
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
