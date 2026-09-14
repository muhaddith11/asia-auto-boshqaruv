'use client';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { buildLedgerRows, type LedgerRow } from '@/lib/businessLedger';
import { exportToCSV } from '@/lib/export';
import { TrendingUp, TrendingDown, Target, Banknote, Receipt, FileSpreadsheet, Package } from 'lucide-react';
import type { Buyurtma, OrderZap } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Boshliq uchun "Ishxona bo'yicha" hisobotning buyurtma-markazli ko'rinishi.
//
// Daromad/Xarajat/Foyda — EGASI ko'radigan raqamlar bilan AYNAN bir xil (ikkalasi
// ham @/lib/businessLedger'dan, hech narsa yashirilmaydi/o'zgartirilmaydi).
//
// Farqi — RO'YXAT: har qator alohida amaliyot emas, balki BITTA BUYURTMA —
// qaysi xizmat va qanaqa zapchast ishlatilgani bilan birga ("hammasi bitta
// joyda"). Xodimlar bot orqali kiritgan "Rasxod: ..." chiqim yozuvlari bu
// ro'yxatda ALOHIDA qator sifatida ko'rinmaydi — ular allaqachon o'sha
// buyurtmaning o'z zap/final summasiga qo'shilgan (src/app/api/bot-ui/rasxod);
// pastdagi "Boshqa amaliyotlar" jadvalida ham chiqarib tashlanadi. Summasi
// baribir Xarajat statistikasida TO'LIQ hisobga olinadi — faqat itemized
// ro'yxatdan yashiriladi, foyda raqami buzilmaydi.
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

// Buyurtmada ishlatilgan HAQIQIY zapchastlar (rasxod pseudo-qatorlari chiqarib tashlangan).
function realParts(zaps: OrderZap[] | undefined | null): { nom: string; qty: number }[] {
  return (zaps || [])
    .filter((z) => z && z.rasxod !== true && z.kat !== 'Rasxod')
    .map((z) => ({ nom: z.nom || z.name || 'Nomsiz', qty: Number(z.qty ?? z.quantity ?? 1) || 1 }));
}

export default function BossBusinessReport() {
  const { buyurtmalar, ishxonaOperatsiyalar, maoshTarixi, xodimlar } = useStore();
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [activeQuick, setActiveQuick] = useState('oy');

  useEffect(() => {
    const now = new Date();
    setFilterFrom(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
    setFilterTo(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
  }, []);

  const allRows = useMemo(
    () => buildLedgerRows(buyurtmalar, ishxonaOperatsiyalar, maoshTarixi, xodimlar),
    [buyurtmalar, ishxonaOperatsiyalar, maoshTarixi, xodimlar],
  );

  const filtered = useMemo(
    () => allRows.filter((r) => (!filterFrom || r._date >= filterFrom) && (!filterTo || r._date <= filterTo)),
    [allRows, filterFrom, filterTo],
  );

  // Statistika — EGASI'ning /reports/business sahifasidagi bilan bir xil formula
  // (barcha qatorlar, rasxod ham ichida) — foyda raqami hech qachon buzilmaydi.
  // Xarajat ikkiga ajratiladi: to'langan ish xaqi (maoshTarixi'dan, shtraf/bonus
  // bundan mustasno) va qolgan hammasi — "ishxona xarajati" (ijara, kommunal,
  // ta'minotchi, rasxod va h.k.). Ikkalasi yig'indisi = jami xarajat, aynan.
  const stats = useMemo(() => {
    const income = filtered.filter((r) => r._positive).reduce((s, r) => s + r._amount, 0);
    const expense = filtered.filter((r) => !r._positive).reduce((s, r) => s + r._amount, 0);
    const ishXaqi = filtered.filter((r) => !r._positive && r._category === 'Ish xaqi').reduce((s, r) => s + r._amount, 0);
    return { income, expense, ishXaqi, ishxonaXarajat: expense - ishXaqi };
  }, [filtered]);

  const orderById = useMemo(() => new Map<number, Buyurtma>(buyurtmalar.map((b) => [Number(b.id), b])), [buyurtmalar]);

  // Buyurtma-markazli ro'yxat — aynan shu davr uchun Daromadga qo'shilgan qatorlar
  // (shu sababli jadval va statistika har doim bir-biriga mos keladi).
  const orderRows = useMemo(() => {
    return filtered
      .filter((r) => r._category === "Buyurtma to'lovi" && r._orderId != null)
      .map((r) => {
        const order = orderById.get(r._orderId as number);
        return { row: r, order, parts: realParts(order?.zaps) };
      })
      .filter((x) => x.order);
  }, [filtered, orderById]);

  // Buyurtmaga bog'liq bo'lmagan (yoki bog'liq bo'lsa ham rasxod bo'lgan) qolgan
  // amaliyotlar — ishxona xarajati, maosh, o'tkazma va h.k.
  const otherRows = useMemo(
    () => filtered.filter((r) => r._category !== "Buyurtma to'lovi" && !r._isRasxod),
    [filtered],
  );

  const handleExport = () => {
    if (orderRows.length === 0) { toast.error("Eksport uchun ma'lumot yo'q"); return; }
    exportToCSV('boshliq_buyurtmalar', orderRows.map(({ row, order, parts }) => ({
      sana: row._displayDate,
      mijoz: row._mijoz,
      mashina: order?.mashina || '',
      xizmatlar: order?.srv || 0,
      zapchastlar: parts.map((p) => `${p.nom} x${p.qty}`).join('; '),
      summa: row._amount,
      holat: order?.holat || '',
    })), [
      { key: 'sana', label: 'Sana' },
      { key: 'mijoz', label: 'Mijoz' },
      { key: 'mashina', label: 'Mashina' },
      { key: 'xizmatlar', label: 'Xizmatlar summasi' },
      { key: 'zapchastlar', label: 'Ishlatilgan zapchastlar' },
      { key: 'summa', label: "To'lov" },
      { key: 'holat', label: 'Holat' },
    ]);
    toast.success(`${orderRows.length} ta buyurtma eksport qilindi`);
  };

  const inputStyle: React.CSSProperties = {
    background: '#121721', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
    padding: '8px 12px', fontSize: 12, color: 'white', outline: 'none', width: '100%',
  };

  return (
    <div style={{ flex: 1, padding: '28px 28px 60px', background: 'var(--bg)', color: 'white', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Ishxona bo&apos;yicha</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Buyurtmalar, ishlatilgan zapchastlar va moliyaviy hisob-kitob — bitta joyda</p>
        </div>
        <button onClick={handleExport} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(16,185,129,0.12)', color: '#10b981',
          border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10,
          padding: '9px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>
          <FileSpreadsheet size={15} /> Excel
        </button>
      </div>

      {/* MUDDAT */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: 160 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase' }}>Muddat (dan)</label>
          <input type="date" value={filterFrom} onChange={(e) => { setActiveQuick(''); setFilterFrom(e.target.value); }} style={inputStyle} />
        </div>
        <div style={{ minWidth: 160 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase' }}>Muddat (gacha)</label>
          <input type="date" value={filterTo} onChange={(e) => { setActiveQuick(''); setFilterTo(e.target.value); }} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['hafta', 'oy', 'yil'].map((q) => (
            <button key={q} onClick={() => {
              setActiveQuick(q);
              const now = new Date();
              if (q === 'hafta') {
                const day = now.getDay();
                const mon = new Date(now); mon.setDate(now.getDate() + (day === 0 ? -6 : 1 - day));
                const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
                setFilterFrom(mon.toISOString().split('T')[0]);
                setFilterTo(sun.toISOString().split('T')[0]);
              } else if (q === 'oy') {
                setFilterFrom(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
                setFilterTo(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
              } else {
                setFilterFrom(`${now.getFullYear()}-01-01`);
                setFilterTo(`${now.getFullYear()}-12-31`);
              }
            }} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
              background: activeQuick === q ? '#4f46e5' : 'var(--surface2)',
              color: activeQuick === q ? '#fff' : 'var(--text2)',
            }}>{q.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* STATS — egasi bilan bir xil formula, faqat xarajat ish xaqi/ishxona bo'lib ko'rsatiladi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
        {[
          { label: 'Kirim', value: stats.income, icon: <TrendingUp size={20} />, color: '#10b981' },
          { label: 'Ishxona xarajati', value: stats.ishxonaXarajat, icon: <TrendingDown size={20} />, color: '#fb7185' },
          { label: "To'langan ish xaqi", value: stats.ishXaqi, icon: <Banknote size={20} />, color: '#f59e0b' },
          { label: 'Foyda', value: stats.income - stats.expense, icon: <Target size={20} />, color: '#3b82f6' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 8, borderRadius: 8, background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>
              {fmt(s.value)} <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>UZS</span>
            </div>
          </div>
        ))}
      </div>

      {/* BUYURTMALAR + ZAPCHASTLAR */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Package size={18} color="var(--accent)" />
          <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>BUYURTMALAR VA ISHLATILGAN ZAPCHASTLAR</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{orderRows.length} ta buyurtma</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {['Sana', 'Mijoz', 'Mashina', 'Xizmatlar', 'Ishlatilgan zapchastlar', "To'lov", 'Holat'].map((h) => (
                  <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderRows.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Bu davr uchun buyurtma topilmadi</td></tr>
              ) : orderRows.map(({ row, order, parts }) => (
                <tr key={row._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{row._displayDate}</td>
                  <td style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>{row._mijoz || '—'}</td>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{order?.mashina} {order?.raqam ? `· ${order.raqam}` : ''}</td>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmt(order?.srv || 0)}</td>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text2)', maxWidth: 320 }}>
                    {parts.length === 0 ? (
                      <span style={{ color: 'var(--text4)' }}>—</span>
                    ) : (
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={parts.map((p) => `${p.nom} x${p.qty}`).join(', ')}>
                        {parts.map((p) => `${p.nom}${p.qty > 1 ? ` x${p.qty}` : ''}`).join(', ')}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 800, color: '#10b981', whiteSpace: 'nowrap' }}>{fmt(row._amount)}</td>
                  <td style={{ padding: '12px 20px', fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{order?.holat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOSHQA AMALIYOTLAR (buyurtmaga bog'liq bo'lmagan) */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Receipt size={18} color="var(--text3)" />
          <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>BOSHQA AMALIYOTLAR</span>
          <span style={{ fontSize: 10.5, color: 'var(--text3)', marginLeft: 12 }}>Ishxona xarajati, maosh, o&apos;tkazma va h.k. — buyurtmaga bog&apos;liq emas</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {otherRows.length === 0 ? (
                <tr><td style={{ padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Bu davr uchun boshqa amaliyot yo&apos;q</td></tr>
              ) : otherRows.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 20px', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{r._displayDate}</td>
                  <td style={{ padding: '10px 20px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: 'var(--surface2)', color: 'var(--text2)' }}>{r._category}</span>
                  </td>
                  <td style={{ padding: '10px 20px', fontSize: 12, color: 'var(--text2)' }}>{r._izoh || '—'}</td>
                  <td style={{ padding: '10px 20px', fontSize: 13, fontWeight: 800, textAlign: 'right', color: r._positive ? '#10b981' : '#fb7185', whiteSpace: 'nowrap' }}>
                    {r._positive ? '+' : '−'} {fmt(r._amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
