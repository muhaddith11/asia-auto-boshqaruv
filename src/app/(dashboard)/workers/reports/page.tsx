'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Award, Search, ChevronDown } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

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

export default function WorkerReportsPage() {
  const { xodimlar, buyurtmalar, maoshTarixi } = useStore();
  const [mounted, setMounted]   = useState(false);
  const [search,  setSearch]    = useState('');
  const [period,  setPeriod]    = useState('month');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // ── Davr filtri ─────────────────────────────────────────────────────────────
  const now           = new Date();
  const todayStr      = now.toISOString().split('T')[0];
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const yearStartStr  = `${now.getFullYear()}-01-01`;
  // O'tkan oy boshi
  const lastMonth        = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStartStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`;

  const matchesPeriod = (sana: string) => {
    if (period === 'all')       return true;
    if (period === 'today')     return sana === todayStr;
    if (period === 'month')     return sana >= monthStartStr;
    if (period === 'lastmonth') return sana >= lastMonthStartStr && sana < monthStartStr;
    if (period === 'year')      return sana >= yearStartStr;
    return true;
  };

  // ── Har bir xodim uchun statistika ──────────────────────────────────────────
  const workerStats = xodimlar.map(x => {
    let totalServicesAmount = 0;
    let servicesPerformed   = 0;
    // Nechta mashinaga (buyurtmaga) xizmat ko'rsatgani — takrorlanmas buyurtmalar
    const orderIds = new Set<string>();

    buyurtmalar.forEach(b => {
      if (b.holat !== 'tulangan') return;
      if (!matchesPeriod(b.sana)) return;

      let participated = false;
      b.services.forEach((s: any) => {
        if (Number(s.workerId) === Number(x.id)) {
          totalServicesAmount += (s.narx || 0);
          servicesPerformed += 1;
          participated = true;
        }
      });
      if (participated) orderIds.add(String(b.id));
    });

    const carsServed = orderIds.size;

    // Berilgan (to'langan) maosh — maosh tarixidan. Shtraf (jarima) hisobga olinmaydi.
    const paidSalary = (maoshTarixi || [])
      .filter((m: any) =>
        Number(m.xodimId) === Number(x.id) &&
        m.method !== 'shtraf' &&
        matchesPeriod((m.sana || '').slice(0, 10))
      )
      .reduce((s: number, m: any) => s + (Number(m.summa) || 0), 0);

    return { ...x, totalServicesAmount, servicesPerformed, carsServed, paidSalary };
  });

  const filtered = workerStats.filter(w =>
    w.ism.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.paidSalary - a.paidSalary);

  return (
    <PageLayout
      title="Xodimlar unumdorligi"
      subtitle="Faqat to'langan buyurtmalar bo'yicha usta hisoboti"
    >
      {/* ── FILTRLAR ── */}
      <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Qidiruv */}
          <div>
            <label style={S.label}>Xodim ismi</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Ism bo'yicha qidiruv..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...S.input, paddingLeft: 34 }}
              />
            </div>
          </div>

          {/* Davr */}
          <div>
            <label style={S.label}>Davr</label>
            <div className="relative">
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                style={S.input}
                className="appearance-none"
              >
                <option value="all">Barcha vaqt</option>
                <option value="today">Bugun</option>
                <option value="month">Shu oy</option>
                <option value="lastmonth">O'tkan oy</option>
                <option value="year">Shu yil</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* ── JADVAL ── */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-[12px] whitespace-nowrap">
          <thead className="bg-[#1e212b] text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-border">
            <tr>
              <th className="px-6 py-4">Xodim</th>
              <th className="px-6 py-4">Mutaxassislik</th>
              <th className="px-6 py-4 text-center">Xizmatlar</th>
              <th className="px-6 py-4 text-center">Mashinalar</th>
              <th className="px-6 py-4 text-right">Umumiy ish</th>
              <th className="px-6 py-4 text-right">Ulush (%)</th>
              <th className="px-6 py-4 text-right">Zarplata (berilgan)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-500 text-[13px]">
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : filtered.map((w, idx) => (
              <tr key={w.id} className={`${idx % 2 === 0 ? '' : 'bg-white/[0.01]'} hover:bg-white/[0.02] transition-colors`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-[11px]">
                      {w.ism.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-white uppercase">{w.ism}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400 font-bold uppercase tracking-tight">{w.mutax || 'Usta'}</td>
                <td className="px-6 py-4 text-center font-black text-slate-400">{w.servicesPerformed} ta</td>
                <td className="px-6 py-4 text-center font-black text-slate-300">{w.carsServed} ta</td>
                <td className="px-6 py-4 text-right font-bold text-slate-300">
                  {w.totalServicesAmount.toLocaleString()} <span className="text-[9px] text-slate-600">so'm</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-slate-400 font-bold">{w.foiz}%</span>
                </td>
                <td className="px-6 py-4 text-right font-black text-emerald-400">
                  {w.paidSalary.toLocaleString()} <span className="text-[9px] text-emerald-800">so'm</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
