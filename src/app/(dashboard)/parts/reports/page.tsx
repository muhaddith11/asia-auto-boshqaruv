'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Search, TrendingUp, Target, Archive, List } from 'lucide-react';
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

const TAG_STYLE = (color: string): React.CSSProperties => ({
  fontSize: 9,
  fontWeight: 800,
  color,
  background: `${color}15`,
  border: `1px solid ${color}30`,
  padding: '2px 7px',
  borderRadius: 5,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
});

function fmtSana(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('uz-UZ', {
      timeZone: 'Asia/Tashkent',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function PartReportsPage() {
  const { zapchastlar, buyurtmalar, mashinalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'log' | 'arxiv'>('log');
  const [logSearch, setLogSearch] = useState('');
  const [filters, setFilters] = useState({ search: '', mashina: '', period: 'month' });

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // ═══════════════════════════════════════════════════════════════════════
  // YANGI: Xodimlar buyurtmalarga kiritgan har bir zapchast qatori — xuddi
  // chek qog'ozidagi "Ehtiyot qismlar" bo'limida chiqadigan ma'lumot bilan
  // bir xil manbadan (orders.zaps), qaysi mashinaga va qachon qo'shilgani bilan.
  // ═══════════════════════════════════════════════════════════════════════
  type LogRow = {
    key: string;
    sanaIso: string | null;
    orderId: number;
    mashina: string;
    raqam: string;
    ism: string;
    holat: string;
    nom: string;
    narx: number;
    turi: 'oddiy' | 'alohida' | 'rasxod';
    xodim: string;
  };

  const logRows: LogRow[] = [];
  buyurtmalar.forEach((b: any) => {
    (b.zaps || []).forEach((z: any, idx: number) => {
      const isRasxod = z.rasxod === true || z.kat === 'Rasxod';
      const turi: LogRow['turi'] = isRasxod ? 'rasxod' : z.alohida === true ? 'alohida' : 'oddiy';
      logRows.push({
        key: `${b.id}-${idx}`,
        sanaIso: z.vaqt || b.createdAt || b.created_at || null,
        orderId: b.id,
        mashina: b.mashina || '',
        raqam: b.raqam || '',
        ism: b.ism || '',
        holat: b.holat,
        nom: z.nom || z.name || '',
        // Narx miqdorga ko'paytirilmaydi — buyurtmaga (va chekka) yozilgan narx shundayligicha
        narx: Number(z.narx ?? z.price ?? 0),
        turi,
        xodim: (isRasxod ? z.xodim_nomi : b.qabul_xodim_nomi) || '',
      });
    });
  });

  const logFiltered = logRows
    .filter((r) => {
      const s = logSearch.trim().toLowerCase();
      if (!s) return true;
      return (
        r.nom.toLowerCase().includes(s) ||
        r.mashina.toLowerCase().includes(s) ||
        r.raqam.toLowerCase().includes(s) ||
        r.ism.toLowerCase().includes(s) ||
        String(r.orderId).includes(s)
      );
    })
    .sort((a, b) => (b.sanaIso || '').localeCompare(a.sanaIso || ''));

  const TURI_LABEL: Record<LogRow['turi'], { label: string; color: string }> = {
    oddiy: { label: 'Oddiy', color: '#3b82f6' },
    alohida: { label: 'Alohida', color: '#f97316' },
    rasxod: { label: 'Rasxod', color: '#f43f5e' },
  };
  const HOLAT_COLOR: Record<string, string> = {
    'bekor qilingan': '#f43f5e',
    'bekor': '#f43f5e',
    'tulangan': '#10b981',
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ARXIV: avval shu sahifada bo'lgan, davr bo'yicha zapchast turi kesimida
  // sarf/tushum/foyda hisoboti — o'zgarishsiz saqlab qolindi.
  // ═══════════════════════════════════════════════════════════════════════
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
      if (b.holat === 'bekor qilingan') return;
      b.zaps.forEach((bp: any) => {
        if (bp.id === p.id) {
          usageCount           += bp.qty;
          totalGeneratedIncome += Number(bp.narx || 0);
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

  const totalIncome = filtered.reduce((sum, p) => sum + p.totalGeneratedIncome, 0);
  const totalProfit = filtered.reduce((sum, p) => sum + p.profitPerItem * p.usageCount, 0);

  const opt: React.CSSProperties = { background: '#1a1c24', color: 'white' };

  return (
    <PageLayout
      title="Zapchastlar hisoboti"
      subtitle={view === 'log' ? "Xodimlar kiritgan har bir zapchast — chekdagi ma'lumotlar bilan bir xil" : "Davr bo'yicha zapchastlar sarfi va foyda tahlili (arxiv)"}
      headerActions={
        <button
          onClick={() => setView(view === 'log' ? 'arxiv' : 'log')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: view === 'arxiv' ? 'var(--accent)' : 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 16px',
            fontSize: 12, fontWeight: 800, color: 'white', cursor: 'pointer',
          }}
        >
          {view === 'arxiv' ? <><List size={15} /> Ro'yxatga qaytish</> : <><Archive size={15} /> Arxiv</>}
        </button>
      }
    >
      {view === 'log' ? (
        <>
          {/* ── QIDIRUV ── */}
          <div
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="text"
                placeholder="Zapchast, mashina, raqam, mijoz yoki buyurtma #..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                style={{ ...SEL, paddingLeft: 34, width: '100%' }}
              />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{logFiltered.length} ta qator</span>
          </div>

          {/* ── JADVAL ── */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full text-left text-[12px] whitespace-nowrap">
                <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    {['Sana', 'Buyurtma', 'Mashina', 'Mijoz', 'Zapchast', 'Turi', 'Xodim', 'Narx', 'Holat'].map((h) => (
                      <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                        className={h === 'Narx' ? 'text-right' : ''}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: 48, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                        Ma'lumot topilmadi
                      </td>
                    </tr>
                  ) : logFiltered.map((r, idx) => (
                    <tr key={r.key} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '12px 20px', color: 'var(--text3)', fontSize: 11 }}>{fmtSana(r.sanaIso)}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text3)', fontSize: 11 }}>#{r.orderId}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 12 }}>{r.mashina}</div>
                        {r.raqam && <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginTop: 2 }}>{r.raqam}</div>}
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text)', fontSize: 12 }}>{r.ism || '—'}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>{r.nom || '—'}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={TAG_STYLE(TURI_LABEL[r.turi].color)}>{TURI_LABEL[r.turi].label}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text3)', fontSize: 11 }}>{r.xodim || '—'}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 800, color: 'var(--text)' }}>{r.narx.toLocaleString()}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={TAG_STYLE(HOLAT_COLOR[r.holat] || '#64748b')}>{r.holat}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ── JAMI (TANLANGAN FILTR BO'YICHA) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 20 }}>
            {[
              { label: 'Jami tushum', value: totalIncome, icon: <TrendingUp size={20} />, color: '#10b981' },
              { label: 'Jami foyda', value: totalProfit, icon: <Target size={20} />, color: '#3b82f6' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ padding: 8, borderRadius: 8, background: `${s.color}15`, color: s.color }}>{s.icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>
                  {s.value.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>UZS</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── FILTRLAR ── */}
          <div
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}
            className="flex flex-wrap items-center gap-3"
          >
            <select value={filters.period} onChange={e => setFilters({ ...filters, period: e.target.value })} style={SEL}>
              <option style={opt} value="all">Barcha vaqt</option>
              <option style={opt} value="today">Bugun</option>
              <option style={opt} value="month">Shu oy</option>
              <option style={opt} value="year">Shu yil</option>
            </select>

            <select value={filters.mashina} onChange={e => setFilters({ ...filters, mashina: e.target.value })} style={SEL}>
              <option style={opt} value="">Barchasi (Mashina)</option>
              <option style={opt} value="Umumiy">Umumiy</option>
              {mashinalar.map(m => <option key={m} style={opt} value={m}>{m}</option>)}
            </select>

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
        </>
      )}
    </PageLayout>
  );
}
