'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { exportToCSV } from '@/lib/export';
import { computeDailyReport, KUNLIK_BELGILANGAN_XARAJAT } from '@/lib/dailyReport';
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Handshake,
  Building2,
  FileSpreadsheet,
  Info,
  Equal,
} from 'lucide-react';

// Kunlik hisob-kitob mantig'i sof funksiyada: @/lib/dailyReport (test bilan qoplangan).

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

export default function DailyReportPage() {
  const store = useStore();
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const buyurtmalar = store?.buyurtmalar || [];
  const ishxonaOperatsiyalar = store?.ishxonaOperatsiyalar || [];
  const xodimlar = store?.xodimlar || [];

  useEffect(() => {
    setMounted(true);
    // Saqlangan sanalar (buyurtma `sana`, kassa operatsiyasi sanasi) UTC asosida
    // olingani uchun "bugun" ham UTC bo'yicha — ichki izchillik uchun.
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  // ── Kunlik hisob-kitob (sof funksiya, test bilan qoplangan) ──────────────────
  const calc = useMemo(() => {
    if (!selectedDate) return null;
    return computeDailyReport(buyurtmalar, ishxonaOperatsiyalar, xodimlar, selectedDate);
  }, [selectedDate, buyurtmalar, ishxonaOperatsiyalar, xodimlar]);

  if (!mounted || !calc) return null;

  const isLoss = calc.sofFoyda < 0;

  const handleExport = () => {
    if (calc.empRows.length === 0) {
      toast.error("Bu kun uchun ma'lumot yo'q");
      return;
    }
    exportToCSV(
      `kundalik_${selectedDate}`,
      calc.empRows,
      [
        { key: 'ism', label: 'Xodim' },
        { key: 'mutax', label: 'Mutaxassislik', format: (r: any) => r.mutax || 'Usta' },
        { key: 'count', label: 'Xizmatlar (ta)' },
        { key: 'cars', label: 'Mashinalar (ta)' },
        { key: 'earned', label: 'Ishlab topgan (UZS)' },
      ],
    );
    toast.success('Kundalik hisobot eksport qilindi');
  };

  const inputStyle: React.CSSProperties = {
    background: '#121721',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    color: 'white',
    outline: 'none',
  };

  const prettyDate = (() => {
    try {
      return new Date(selectedDate + 'T00:00:00').toLocaleDateString('uz-UZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  })();

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ flex: 1, padding: '28px 28px 60px', background: 'var(--bg)', color: 'white', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarDays size={22} color="var(--accent)" /> Kundalik hisobot
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4, textTransform: 'capitalize' }}>{prettyDate}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={() => setSelectedDate(todayStr)}
            style={{
              padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
              background: selectedDate === todayStr ? 'var(--accent)' : 'var(--surface2)',
              color: selectedDate === todayStr ? 'white' : 'var(--text2)',
            }}
          >
            Bugun
          </button>
          <button
            onClick={handleExport}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(16,185,129,0.12)', color: '#10b981',
              border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8,
              padding: '9px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Ustalar ishlab topgani', value: calc.ustalarJami, icon: <Users size={20} />, color: '#8b5cf6' },
          { label: 'Sherik ulushi', value: calc.sherikUlushiJami, icon: <Handshake size={20} />, color: '#6366f1' },
          { label: 'Ishxona foydasi', value: calc.ishxonaFoyda, icon: <Building2 size={20} />, color: isLoss ? '#fb7185' : '#10b981' },
          { label: 'Kunlik sof foyda', value: calc.sofFoyda, icon: isLoss ? <TrendingDown size={20} /> : <TrendingUp size={20} />, color: isLoss ? '#fb7185' : '#3b82f6' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 8, borderRadius: 8, background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>
              {fmt(s.value)} <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>UZS</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }} className="daily-grid">
        {/* HISOB-KITOB (breakdown) */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Wallet size={18} color="var(--accent)" />
              <span style={{ fontSize: 14, fontWeight: 800 }}>KUNLIK FOYDA HISOB-KITOBI</span>
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text3)', marginTop: 4 }}>
              Sherik va ishxona foydasi — faqat bugun to'langan (kassaga tushgan) buyurtmalardan
            </div>
          </div>
          <div style={{ padding: '10px 22px 18px' }}>
            {[
              { label: 'Xizmatlardan yalpi foyda', hint: `${calc.ordersCount} ta to'langan buyurtma`, value: calc.yalpiFoyda, sign: '+', color: '#10b981' },
              { label: 'Boshqa kirimlar', value: calc.boshqaKirim, sign: '+', color: '#10b981', hide: calc.boshqaKirim === 0 },
              { label: 'Ishxona xarajatlari', hint: `${calc.xarajatCount} ta xarajat`, value: calc.xarajat, sign: '−', color: '#fb7185' },
              { label: 'Belgilangan xarajat (oylik)', hint: 'ulush olmaydigan xodimlar oyligi ÷ 30', value: KUNLIK_BELGILANGAN_XARAJAT, sign: '−', color: '#fb7185' },
            ].filter((r) => !r.hide).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{r.label}</div>
                  {r.hint && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{r.hint}</div>}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: r.color, whiteSpace: 'nowrap' }}>
                  {r.sign} {fmt(r.value)}
                </div>
              </div>
            ))}

            {/* Natija */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 4px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Equal size={16} color="var(--text3)" /> Kunlik sof {isLoss ? 'zarar' : 'foyda'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: isLoss ? '#fb7185' : '#3b82f6', whiteSpace: 'nowrap' }}>
                {fmt(calc.sofFoyda)} <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>UZS</span>
              </div>
            </div>

            {/* Bo'linish */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
              {calc.partnerShares.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text3)', paddingBottom: 8 }}>Sherik kiritilmagan</div>
              )}
              {calc.partnerShares.map((p: any) => (
                <div key={p.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Handshake size={14} /> {p.ism} <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>({p.foiz}%)</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#a5b4fc', whiteSpace: 'nowrap' }}>{fmt(p.share)}</div>
                  </div>
                  {p.subs?.map((s: any) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 4px 22px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>↳ {s.ism} ({s.foiz}% ulushdan)</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{fmt(s.share)}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', marginTop: 8, borderRadius: 10, background: isLoss ? 'rgba(251,113,133,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${isLoss ? 'rgba(251,113,133,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={15} color={isLoss ? '#fb7185' : '#10b981'} /> Ishxona foydasi
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: isLoss ? '#fb7185' : '#10b981', whiteSpace: 'nowrap' }}>
                  {fmt(calc.ishxonaFoyda)} <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>UZS</span>
                </div>
              </div>
            </div>

            {/* Izoh */}
            <div style={{ marginTop: 16, display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Info size={15} color="#818cf8" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.5 }}>
                <b>{fmt(KUNLIK_BELGILANGAN_XARAJAT)} UZS</b> — ishxonadagi xizmatdan ulush olmaydigan xodimlar oylik maoshi
                yig'indisi 30 kunga bo'lingan kunlik ulushi. Shu sabab kunlik foyda undan keyin hisoblanadi.
              </div>
            </div>
          </div>
        </div>

        {/* USTALAR */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={18} color="#8b5cf6" /> USTALAR ISHLAB TOPGANI
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#8b5cf6' }}>{fmt(calc.ustalarJami)} UZS</span>
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text3)', marginTop: 4 }}>
              Shu kuni qilingan ish bo'yicha — to'langan yoki to'lanmaganidan qat'i nazar ({calc.workOrdersCount} ta buyurtma)
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  {['Xodim', 'Xizmatlar', 'Mashina', 'Ishlab topgan'].map((h, i) => (
                    <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', textAlign: i >= 1 ? (i === 3 ? 'right' : 'center') : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calc.empRows.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Bu kun uchun ish topilmadi</td></tr>
                ) : calc.empRows.map((w: any) => (
                  <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.22)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12 }}>
                          {w.ism.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'white', textTransform: 'uppercase' }}>{w.ism}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)' }}>{w.mutax || 'Usta'} • {w.foiz}%</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>{w.count} ta</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>{w.cars} ta</td>
                    <td style={{ padding: '12px 20px', textAlign: 'right', fontSize: 14, fontWeight: 900, color: '#10b981', whiteSpace: 'nowrap' }}>{fmt(w.earned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .daily-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
