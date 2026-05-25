'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Package, Search, History } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

const SEL: React.CSSProperties = {
  background: '#1a1c24',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  color: 'white',
  outline: 'none',
  cursor: 'pointer',
};

export default function PartReportsPage() {
  const { zapchastlar, buyurtmalar, mashinalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({ search: '', mashina: '', period: 'month' });

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // ── Davr filtri ─────────────────────────────────────────────────────────────
  const now           = new Date();
  const todayStr      = now.toISOString().split('T')[0];
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const yearStartStr  = `${now.getFullYear()}-01-01`;

  const matchesPeriod = (sana: string) => {
    if (filters.period === 'all')   return true;
    if (filters.period === 'today') return sana === todayStr;
    if (filters.period === 'month') return sana >= monthStartStr;
    if (filters.period === 'year')  return sana >= yearStartStr;
    return true;
  };

  const partStats = zapchastlar.map(p => {
    let usageCount = 0;
    let totalGeneratedIncome = 0;
    buyurtmalar.forEach(b => {
      if (!matchesPeriod(b.sana)) return;
      b.zaps.forEach((bp: any) => {
        if (bp.id === p.id) {
          usageCount           += bp.qty;
          totalGeneratedIncome += (bp.narx * bp.qty);
        }
      });
    });
    return { ...p, usageCount, totalGeneratedIncome, profitPerItem: p.narx - (p.sebestoimost || 0) };
  });

  const filtered = partStats.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCar    = !filters.mashina || p.mashina === filters.mashina;
    return matchesSearch && matchesCar;
  }).sort((a, b) => b.usageCount - a.usageCount);

  const opt: React.CSSProperties = { background: '#1a1c24', color: 'white' };

  return (
    <PageLayout title="Zapchastlar hisoboti" subtitle="Davr bo'yicha zapchastlar sarfi va foyda tahlili">

      {/* ── FILTRLAR ── */}
      <div
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}
        className="flex flex-wrap items-center gap-3"
      >
        {/* Davr */}
        <select value={filters.period} onChange={e => setFilters({ ...filters, period: e.target.value })} style={SEL}>
          <option style={opt} value="all">Barcha vaqt</option>
          <option style={opt} value="today">Bugun</option>
          <option style={opt} value="month">Shu oy</option>
          <option style={opt} value="year">Shu yil</option>
        </select>

        {/* Mashina */}
        <select value={filters.mashina} onChange={e => setFilters({ ...filters, mashina: e.target.value })} style={SEL}>
          <option style={opt} value="">Barchasi (Mashina)</option>
          <option style={opt} value="Umumiy">Umumiy</option>
          {mashinalar.map(m => <option key={m} style={opt} value={m}>{m}</option>)}
        </select>

        {/* Qidiruv */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Zapchast nomi..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            style={{ ...SEL, paddingLeft: 34, width: '100%' }}
          />
        </div>

        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>
          {filtered.length} ta mahsulot
        </span>
      </div>

      {/* ── JADVAL ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <table className="w-full text-left text-[12px] whitespace-nowrap">
          <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {['Mahsulot', 'Mashina', 'Ishlatilgan', 'Mavjud (Balance)', 'Summa (Sotuv)', 'Taxminiy Foyda'].map(h => (
                <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  className={h !== 'Mahsulot' && h !== 'Mashina' ? 'text-right' : ''}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : filtered.map((p, idx) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>{p.nom}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginTop: 2 }}>{p.bir}</div>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text3)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 5, textTransform: 'uppercase' }}>
                    {p.mashina}
                  </span>
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 800, color: p.usageCount > 0 ? '#3b82f6' : 'var(--text3)' }}>
                  {p.usageCount} {p.bir}
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 800, color: p.balance <= 0 ? '#f43f5e' : p.balance <= 5 ? '#f97316' : 'var(--text)' }}>
                  {p.balance} {p.bir}
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>
                  {p.totalGeneratedIncome.toLocaleString()}
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 800, color: p.profitPerItem * p.usageCount > 0 ? '#10b981' : 'var(--text3)' }}>
                  {(p.profitPerItem * p.usageCount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
