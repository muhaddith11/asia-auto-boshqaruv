'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Filter, 
  TrendingUp, 
  Calendar, 
  TrendingDown, 
  Target, 
  Wallet,
  Receipt,
  Clock
} from 'lucide-react';

/**
 * BusinessReportPage (Final Stage: Full Table & Stats)
 * ---------------------------------------------------
 * Barcha filtrlar, statistikalar va kengaytirilgan jadval bilan.
 */
export default function BusinessReportPage() {
  const store = useStore();
  const [mounted, setMounted] = useState(false);

  const buyurtmalar = store?.buyurtmalar || [];
  const ishxonaOperatsiyalar = store?.ishxonaOperatsiyalar || [];
  const kassa = store?.kassa || { naqd: 0, karta: 0 };
  const maoshTarixi = store?.maoshTarixi || [];
  const xodimlar = store?.xodimlar || [];

  const [filterCategory, setFilterCategory] = useState('');
  const [filterType,     setFilterType]     = useState(''); // '', 'income', 'expense'
  const [filterFrom,     setFilterFrom]     = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [activeQuick, setActiveQuick] = useState('oy');

  useEffect(() => { 
    setMounted(true); 
    // Default: joriy oyni sozlash
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const to   = last.toISOString().split('T')[0];
    setFilterFrom(from);
    setFilterTo(to);
  }, []);

  // Ma'lumotlarni birlashtirish (O'ta xavfsiz usulda)
  const allRows = useMemo(() => {
    const rows: any[] = [];
    try {
      buyurtmalar.forEach((b: any) => {
        if (b.holat !== 'tulangan') return; // Faqat to'langan buyurtmalar hisobotga tushadi
        const raw = b.createdAt || b.created_at || b.sana || '';
        let dStr = b.sana || '';
        let disp = b.sana || '';
        try { 
          const d = new Date(raw); 
          if (!isNaN(d.getTime())) {
            dStr = d.toISOString().split('T')[0];
            disp = d.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          }
        } catch {}
        rows.push({
          _id: String(b.id),
          _date: dStr,
          _displayDate: disp,
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
        let disp = op.date || '';
        try { 
          const d = new Date(raw); 
          if (!isNaN(d.getTime())) {
            dStr = d.toISOString().split('T')[0];
            disp = d.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          }
        } catch {}
        rows.push({
          _id: String(op.id),
          _date: dStr,
          _displayDate: disp,
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
        let disp = m.sana || '';
        try { 
          const d = new Date(raw); 
          if (!isNaN(d.getTime())) {
            dStr = d.toISOString().split('T')[0];
            disp = d.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          }
        } catch {}
        const worker = xodimlar.find((w: any) => w.id === m.xodimId);
        rows.push({
          _id: String(m.id),
          _date: dStr,
          _displayDate: disp,
          _rawDate: raw,
          _category: 'Ish xaqi',
          _izoh: m.izoh || '',
          _mijoz: worker?.ism || 'Xodim',
          _amount: Number(m.summa) || 0,
          _method: (m.method || '').toUpperCase(),
          _positive: false,
        });
      });
    } catch (e) {
      console.error("Data processing error:", e);
    }
    return rows.sort((a, b) => new Date(b._rawDate).getTime() - new Date(a._rawDate).getTime());
  }, [buyurtmalar, ishxonaOperatsiyalar, maoshTarixi, xodimlar]);

  const categories = useMemo(() => Array.from(new Set(allRows.map(r => r._category))).sort(), [allRows]);

  const filtered = useMemo(() => allRows.filter(r => {
    if (filterFrom && r._date < filterFrom) return false;
    if (filterTo   && r._date > filterTo)   return false;
    if (filterCategory && r._category !== filterCategory) return false;
    if (filterType) {
      if (filterType === 'income' && !r._positive) return false;
      if (filterType === 'expense' && r._positive) return false;
    }
    return true;
  }), [allRows, filterFrom, filterTo, filterCategory, filterType]);

  const stats = useMemo(() => ({
    income:  filtered.filter(r => r._positive).reduce((s, r) => s + r._amount, 0),
    expense: filtered.filter(r => !r._positive).reduce((s, r) => s + r._amount, 0),
  }), [filtered]);

  if (!mounted) return null;

  const inputStyle: React.CSSProperties = {
    background: '#121721',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 12,
    color: 'white',
    outline: 'none',
    width: '100%',
  };

  return (
    <div style={{ flex: 1, padding: '28px 28px 60px', background: 'var(--bg)', color: 'white', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Hisobotlar</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Ishxona bo'yicha keng qamrovli moliya tahlili</p>
      </div>

      {/* FILTURLAR */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase' }}>Kategoriya</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={inputStyle}>
              <option value="">Barchasi</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase' }}>Turi</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inputStyle}>
              <option value="">Barchasi</option>
              <option value="income">Kirim</option>
              <option value="expense">Chiqim</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase' }}>Muddat (Dan)</label>
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase' }}>Muddat (Gacha)</label>
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
             {['hafta', 'oy', 'yil'].map(q => (
              <button key={q} onClick={() => {
                if (q === 'hafta') {
                  const now = new Date();
                  const day = now.getDay();
                  const diffToMon = (day === 0 ? -6 : 1 - day);
                  const mon = new Date(now); mon.setDate(now.getDate() + diffToMon);
                  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
                  setFilterFrom(mon.toISOString().split('T')[0]);
                  setFilterTo(sun.toISOString().split('T')[0]);
                } else if (q === 'oy') {
                  const now = new Date();
                  setFilterFrom(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
                  setFilterTo(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
                } else if (q === 'yil') {
                  setFilterFrom(`${new Date().getFullYear()}-01-01`);
                  setFilterTo(`${new Date().getFullYear()}-12-31`);
                }
              }} style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: 'var(--surface2)', color: 'var(--text2)'
              }}>{q.toUpperCase()}</button>
            ))}
            <button onClick={() => { setFilterCategory(''); setFilterFrom(''); setFilterTo(''); }} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--surface2)', border: 'none', cursor: 'pointer' }}>
              <Clock size={14} color="var(--text3)" />
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        {[
          { label: 'Daromad', value: stats.income, icon: <TrendingUp size={20} />, color: '#10b981' },
          { label: 'Xarajat', value: stats.expense, icon: <TrendingDown size={20} />, color: '#fb7185' },
          { label: 'Foyda', value: stats.income - stats.expense, icon: <Target size={20} />, color: '#3b82f6' },
          { label: 'Kassa', value: kassa.naqd + kassa.karta, icon: <Wallet size={20} />, color: '#f59e0b' },
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

      {/* JADVAL */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Receipt size={18} color="var(--accent)" />
          <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>AMALIYOTLAR TARIXI</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {['ID', 'Sana', 'Turi', 'Kategoriya', 'Izoh', 'Mijoz', 'Summa', 'Usul'].map(h => (
                  <th key={h} style={{ padding: '14px 24px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Ma'lumot topilmadi</td></tr>
              ) : filtered.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 24px', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>#{row._id}</td>
                  <td style={{ padding: '14px 24px', fontSize: 11, color: 'white', whiteSpace: 'nowrap' }}>
                    {row._displayDate}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ 
                      padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                      background: row._positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 113, 133, 0.1)',
                      color: row._positive ? '#10b981' : '#fb7185'
                    }}>
                      {row._positive ? 'KIRIM' : 'CHIQIM'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 6, background: 'var(--surface2)', fontSize: 10, fontWeight: 700, color: 'var(--text2)' }}>{row._category}</span>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--text2)' }}>{row._izoh || '—'}</td>
                  <td style={{ padding: '14px 24px', fontSize: 12, color: 'white', fontWeight: 600 }}>{row._mijoz || '—'}</td>
                  <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 900, color: row._positive ? '#10b981' : '#fb7185' }}>
                    {row._amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>{row._method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
