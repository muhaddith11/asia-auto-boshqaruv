'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

/**
 * BusinessReportPage (Ultra-Safe Version)
 * ---------------------------------------
 * Hech qanday tashqi ikonkalarsiz (Lucide-react o'rniga Emoji).
 * Bu versiya build va runtime xatolarini oldini olish uchun yaratildi.
 */
export default function BusinessReportPage() {
  // Store ma'lumotlarini xavfsiz olish (optional chaining bilan)
  const store = useStore();
  const buyurtmalar = store?.buyurtmalar || [];
  const ishxonaOperatsiyalar = store?.ishxonaOperatsiyalar || [];
  const kassa = store?.kassa || { naqd: 0, karta: 0 };
  const maoshTarixi = store?.maoshTarixi || [];
  const xodimlar = store?.xodimlar || [];

  const [mounted, setMounted] = useState(false);

  // Filtrlar
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom,     setFilterFrom]     = useState('');
  const [filterTo,       setFilterTo]       = useState('');
  const [activeQuick,    setActiveQuick]    = useState('oy');

  useEffect(() => { 
    setMounted(true); 
  }, []);
  
  useEffect(() => {
    if (!mounted) return;
    // Default: joriy oyning boshi va oxiri
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const to   = last.toISOString().split('T')[0];
    setFilterFrom(from);
    setFilterTo(to);
  }, [mounted]);

  // Yordamchi sanalar
  const helpers = useMemo(() => ({
    getWeekRange: () => {
      const now = new Date();
      const day = now.getDay();
      const diffToMon = (day === 0 ? -6 : 1 - day);
      const mon = new Date(now); mon.setDate(now.getDate() + diffToMon);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return { from: mon.toISOString().split('T')[0], to: sun.toISOString().split('T')[0] };
    },
    getMonthRange: () => {
      const now = new Date();
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from, to: last.toISOString().split('T')[0] };
    },
    getYearRange: () => {
      const y = new Date().getFullYear();
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    }
  }), []);

  if (!mounted) return null;

  function applyQuick(q: string) {
    setActiveQuick(q);
    if (q === 'hafta') { const r = helpers.getWeekRange();  setFilterFrom(r.from); setFilterTo(r.to); }
    if (q === 'oy')    { const r = helpers.getMonthRange(); setFilterFrom(r.from); setFilterTo(r.to); }
    if (q === 'yil')   { const r = helpers.getYearRange();  setFilterFrom(r.from); setFilterTo(r.to); }
  }

  function resetFilters() {
    const r = helpers.getMonthRange();
    setFilterFrom(r.from);
    setFilterTo(r.to);
    setFilterCategory('');
    setActiveQuick('oy');
  }

  // Barcha ma'lumotlarni yagona jadval uchun tayyorlash
  const allRows = useMemo(() => {
    try {
      const rows: any[] = [];

      buyurtmalar.forEach((b: any) => {
        const raw = b.createdAt || b.created_at || b.sana || '';
        let dStr = b.sana || '';
        try {
          const d = new Date(raw);
          if (!isNaN(d.getTime())) dStr = d.toISOString().split('T')[0];
        } catch {}
        rows.push({
          _id: String(b.id),
          _date: dStr,
          _rawDate: raw,
          _category: 'Buyurtma',
          _izoh: b.muammo || b.mashina || '',
          _mijoz: b.ism || '',
          _amount: Number(b.final) || 0,
          _method: 'NAQD',
          _positive: true,
        });
      });

      ishxonaOperatsiyalar.forEach((op: any) => {
        if (op.source === 'buyurtma') return;
        const raw = op.createdAt || op.date || '';
        let dStr = op.date || '';
        try {
          const d = new Date(raw);
          if (!isNaN(d.getTime())) dStr = d.toISOString().split('T')[0];
        } catch {}
        rows.push({
          _id: String(op.id),
          _date: dStr,
          _rawDate: raw,
          _category: op.category || 'Operatsiya',
          _izoh: op.comment || '',
          _mijoz: '',
          _amount: Number(op.amount) || 0,
          _method: (op.method || '').toUpperCase(),
          _positive: op.type === 'income',
        });
      });

      maoshTarixi.forEach((m: any) => {
        const raw = m.createdAt || m.sana || '';
        let dStr = m.sana || '';
        try {
          const d = new Date(raw);
          if (!isNaN(d.getTime())) dStr = d.toISOString().split('T')[0];
        } catch {}
        const worker = xodimlar.find((w: any) => w.id === m.xodimId);
        rows.push({
          _id: String(m.id),
          _date: dStr,
          _rawDate: raw,
          _category: 'Ish xaqi',
          _izoh: m.izoh || '',
          _mijoz: worker?.ism || 'Xodim',
          _amount: Number(m.summa) || 0,
          _method: (m.method || '').toUpperCase(),
          _positive: false,
        });
      });

      return rows.sort((a, b) => new Date(b._rawDate).getTime() - new Date(a._rawDate).getTime());
    } catch (e) {
      console.error('Data process error:', e);
      return [];
    }
  }, [buyurtmalar, ishxonaOperatsiyalar, maoshTarixi, xodimlar]);

  const categories = useMemo(() => Array.from(new Set(allRows.map(r => r._category))).sort(), [allRows]);

  const filtered = useMemo(() => allRows.filter(r => {
    if (filterFrom && r._date < filterFrom) return false;
    if (filterTo   && r._date > filterTo)   return false;
    if (filterCategory && r._category !== filterCategory) return false;
    return true;
  }), [allRows, filterFrom, filterTo, filterCategory]);

  const totals = useMemo(() => ({
    income:  filtered.filter(r => r._positive).reduce((s, r) => s + r._amount, 0),
    expense: filtered.filter(r => !r._positive).reduce((s, r) => s + r._amount, 0),
  }), [filtered]);

  // CSS Styles
  const inputStyle: React.CSSProperties = {
    background: '#1e212b',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 12,
    color: 'white',
    outline: 'none',
    width: '100%',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0d14', color: '#f1f5f9', minHeight: '100vh', padding: 28 }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>📊 Moliyaviy Hisobot</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Barcha kirim va chiqimlar tahlili</p>
      </div>

      {/* FILTURLAR */}
      <div style={{ background: '#121721', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>KATEGORIYA</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={inputStyle}>
              <option value="">Barchasi</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>DAN</label>
            <input type="date" value={filterFrom} onChange={e => {setFilterFrom(e.target.value); setActiveQuick('custom');}} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>GACHA</label>
            <input type="date" value={filterTo} onChange={e => {setFilterTo(e.target.value); setActiveQuick('custom');}} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['hafta', 'oy', 'yil'].map(q => (
              <button key={q} onClick={() => applyQuick(q)} style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: activeQuick === q ? '#4f46e5' : '#1e212b',
                color: 'white'
              }}>{q.toUpperCase()}</button>
            ))}
            <button onClick={resetFilters} style={{ padding: '8px 12px', borderRadius: 8, background: '#1e212b', color: '#64748b', border: 'none', cursor: 'pointer' }}>🔄</button>
          </div>
        </div>
      </div>

      {/* STATISTIKA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tushum', value: totals.income, icon: '📈', color: '#10b981' },
          { label: 'Xarajat', value: totals.expense, icon: '📉', color: '#fb7185' },
          { label: 'Foyda', value: totals.income - totals.expense, icon: '🎯', color: '#3b82f6' },
          { label: 'Kassa (Jami)', value: kassa.naqd + kassa.karta, icon: '💰', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#121721', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>
              {s.value.toLocaleString()} <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>UZS</span>
            </div>
          </div>
        ))}
      </div>

      {/* JADVAL */}
      <div style={{ background: '#121721', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)', fontWeight: 800, fontSize: 13 }}>
          📝 AMALIYOTLAR RO'YXATI ({filtered.length} ta)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>
                {['ID', 'SANA', 'KATEGORIYA', 'IZOH', 'MIJOZ', 'SUMMA', 'USUL'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', fontWeight: 700, fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Ma'lumot topilmadi</td></tr>
              ) : filtered.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 20px', color: '#4f46e5', fontWeight: 700 }}>#{row._id}</td>
                  <td style={{ padding: '12px 20px' }}>{row._date}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: 10, background: '#1e212b', padding: '2px 8px', borderRadius: 4 }}>{row._category}</span>
                  </td>
                  <td style={{ padding: '12px 20px', color: '#cbd5e1' }}>{row._izoh || '—'}</td>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>{row._mijoz || '—'}</td>
                  <td style={{ padding: '12px 20px', fontWeight: 800, color: row._positive ? '#10b981' : '#fb7185' }}>
                    {row._amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 10, color: '#64748b' }}>{row._method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
