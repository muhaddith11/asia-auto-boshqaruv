'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Filter, TrendingUp, Calendar } from 'lucide-react';

/**
 * BusinessReportPage (Stage 2.2: Filters & Icons Test)
 * ---------------------------------------------------
 * Filtrlar va asosiy ikonkalarni tekshirish uchun.
 */
export default function BusinessReportPage() {
  const store = useStore();
  const [mounted, setMounted] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const ordersCount = store?.buyurtmalar?.length || 0;
  const opsCount = store?.ishxonaOperatsiyalar?.length || 0;

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
    <div style={{ flex: 1, padding: 40, background: '#0a0d14', color: 'white', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 8, background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', borderRadius: 8 }}>
          <TrendingUp size={24} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Moliya Hisoboti (Filtrlar Test)</h1>
      </div>

      {/* FILTURLAR BO'LIMI */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: 20, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Filter size={14} color="#6366f1" />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>Filtrlash</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4b5563', marginBottom: 6 }}>KATEGORIYA</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={inputStyle}>
              <option value="">Barchasi</option>
              <option value="Buyurtma">Buyurtmalar</option>
              <option value="Ish xaqi">Ish xaqi</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4b5563', marginBottom: 6 }}>DAN</label>
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4b5563', marginBottom: 6 }}>GACHA</label>
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ padding: 20, background: '#111827', borderRadius: 12, border: '1px solid #1f2937' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
            <Calendar size={14} /> BUYURTMALAR SONI
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>{ordersCount}</div>
        </div>
        <div style={{ padding: 20, background: '#111827', borderRadius: 12, border: '1px solid #1f2937' }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>OPERATSIYALAR SONI</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>{opsCount}</div>
        </div>
      </div>

    </div>
  );
}
