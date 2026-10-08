'use client';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { buildLedgerRows } from '@/lib/businessLedger';
import { attachOrderProfit, computeBossStats, orderPartLines } from '@/lib/bossProfit';
import { monthRange, quickRange, type QuickRangeKind } from '@/lib/dateRange';
import { exportToCSV } from '@/lib/export';
import { Target, Banknote, Receipt, FileSpreadsheet, Package } from 'lucide-react';
import type { Buyurtma } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Boshliq uchun "Ishxona bo'yicha" hisobot.
//
// ASOSIY RAQAM — kirim emas, ISHXONA FOYDASI:
//     Foyda = Kirim (zapchast va rasxod puli chiqarilgan) − To'langan ish xaqi − Ishxona xarajati − Aylanmadan tashqari
// Formula va uning "nega hech narsa ikki marta ayirilmaydi" izohi: @/lib/bossProfit.
//
// Qatorlar manbasi — @/lib/businessLedger (egasining /reports/business sahifasi
// bilan AYNAN bir xil), farqi faqat KO'RINISHDA: har qator bitta BUYURTMA,
// yonida o'sha buyurtmaning zapchast puli va ishxonaga qolgan foydasi.
//
// Jadvaldagi "Foyda" ustuni yig'indisi + boshqa kirimlar − ish xaqi − ishxona
// xarajati = yuqoridagi katta raqam (hech qayerda raqam "yo'qolmaydi").
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

// Katta raqam ostidagi formula bo'lagi: "− ZAPCHAST 22 730 000"
function Term({ label, value, color, sign }: { label: string; value: number; color: string; sign?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap' }}>
      {sign && <span style={{ color: 'var(--text3)', fontWeight: 800 }}>{sign}</span>}
      <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color }}>{fmt(value)}</span>
    </span>
  );
}

export default function BossBusinessReport() {
  const { buyurtmalar, ishxonaOperatsiyalar, maoshTarixi, xodimlar, tashqariOperatsiyalar } = useStore();
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [activeQuick, setActiveQuick] = useState('oy');

  useEffect(() => {
    const { from, to } = monthRange();
    setFilterFrom(from);
    setFilterTo(to);
  }, []);

  const allRows = useMemo(
    () => buildLedgerRows(buyurtmalar, ishxonaOperatsiyalar, maoshTarixi, xodimlar),
    [buyurtmalar, ishxonaOperatsiyalar, maoshTarixi, xodimlar],
  );

  const filtered = useMemo(
    () => allRows.filter((r) => (!filterFrom || r._date >= filterFrom) && (!filterTo || r._date <= filterTo)),
    [allRows, filterFrom, filterTo],
  );

  // Aylanmadan tashqari operatsiyalar — asosiy ro'yxatdan ajratib saqlanadi, shu
  // sababli alohida qator qilib olinadi va foydadan ayiriladi (bossProfit.ts, 5-band).
  const extFiltered = useMemo(
    () => buildLedgerRows([], tashqariOperatsiyalar || [], [], [])
      .filter((r) => (!filterFrom || r._date >= filterFrom) && (!filterTo || r._date <= filterTo)),
    [tashqariOperatsiyalar, filterFrom, filterTo],
  );

  const orderById = useMemo(() => new Map<number, Buyurtma>(buyurtmalar.map((b) => [Number(b.id), b])), [buyurtmalar]);

  // Buyurtma-markazli qatorlar — har biriga o'sha buyurtmaning zapchast puli va
  // foydasi biriktiriladi. Taqsimlash BARCHA to'lovlar bo'yicha qilinadi (davr
  // filtridan OLDIN): buyurtma bir oyda qisman, keyingi oyda qolganini to'lagan
  // bo'lsa, zapchast ikkala oyga ham to'liq tushib ketmaydi — har oyga o'z
  // ulushi tushadi.
  const allOrderRows = useMemo(() => {
    const base = allRows
      .filter((r) => r._category === "Buyurtma to'lovi" && r._orderId != null)
      .map((r) => {
        const order = orderById.get(r._orderId as number);
        return { row: r, order, parts: orderPartLines(order?.zaps) };
      })
      .filter((x) => x.order);
    return attachOrderProfit(base);
  }, [allRows, orderById]);

  const orderRows = useMemo(
    () => allOrderRows.filter((x) => (!filterFrom || x.row._date >= filterFrom) && (!filterTo || x.row._date <= filterTo)),
    [allOrderRows, filterFrom, filterTo],
  );

  const zapchastJami = useMemo(() => orderRows.reduce((s, r) => s + r.zapchast, 0), [orderRows]);
  const stats = useMemo(() => computeBossStats(filtered, zapchastJami, extFiltered), [filtered, zapchastJami, extFiltered]);

  const jami = useMemo(() => ({
    tolov: orderRows.reduce((s, r) => s + r.row._amount, 0),
    foyda: orderRows.reduce((s, r) => s + r.foyda, 0),
  }), [orderRows]);

  // Buyurtmaga bog'liq bo'lmagan qolgan amaliyotlar. Rasxod qatorlari bu yerda
  // ham, statistikada ham ko'rinmaydi — ular yuqorida o'z buyurtmasining
  // "Zapchast" ustunida allaqachon ayirilgan (ikki marta ayirilmasligi uchun).
  const otherRows = useMemo(
    () => [...filtered.filter((r) => r._category !== "Buyurtma to'lovi" && !r._isRasxod), ...extFiltered]
      .sort((a, b) => new Date(b._rawDate || b._date).getTime() - new Date(a._rawDate || a._date).getTime()),
    [filtered, extFiltered],
  );

  // Ishchilar bo'yicha to'langan maosh (davr ichida) — har xodim va jami.
  const ishchilar = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of filtered) {
      if (x._category !== 'Ish xaqi') continue;
      const nom = x._mijoz || 'Xodim';
      m.set(nom, (m.get(nom) || 0) + (Number(x._amount) || 0));
    }
    return Array.from(m, ([nom, summa]) => ({ nom, summa })).sort((a, b) => b.summa - a.summa);
  }, [filtered]);

  const handleExport = () => {
    if (orderRows.length === 0) { toast.error("Eksport uchun ma'lumot yo'q"); return; }
    exportToCSV('boshliq_buyurtmalar', orderRows.map(({ row, order, parts, zapchast, foyda }) => ({
      sana: row._displayDate,
      mijoz: row._mijoz,
      mashina: order?.mashina || '',
      xizmatlar: order?.srv || 0,
      zapchastlar: parts.map((p) => `${p.nom} x${p.qty}`).join('; '),
      zapchast_summa: zapchast,
      summa: row._amount,
      foyda,
      holat: order?.holat || '',
    })), [
      { key: 'sana', label: 'Sana' },
      { key: 'mijoz', label: 'Mijoz' },
      { key: 'mashina', label: 'Mashina' },
      { key: 'xizmatlar', label: 'Xizmatlar summasi' },
      { key: 'zapchastlar', label: 'Ishlatilgan zapchastlar' },
      { key: 'zapchast_summa', label: 'Zapchast summasi' },
      { key: 'summa', label: "To'lov" },
      { key: 'foyda', label: 'Foyda' },
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
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Zapchast, ish xaqi va xarajatlar chiqarilgandan keyingi sof foyda</p>
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
              const { from, to } = quickRange(q as QuickRangeKind);
              setFilterFrom(from);
              setFilterTo(to);
            }} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
              background: activeQuick === q ? '#4f46e5' : 'var(--surface2)',
              color: activeQuick === q ? '#fff' : 'var(--text2)',
            }}>{q.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* ASOSIY RAQAM — ISHXONA FOYDASI (kirim emas) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(16,185,129,0.08) 100%)',
        border: '1px solid rgba(59,130,246,0.28)', borderRadius: 18, padding: '24px 28px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ padding: 8, borderRadius: 10, background: 'rgba(59,130,246,0.18)', color: '#3b82f6' }}><Target size={20} /></div>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ishxona foydasi</span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: stats.foyda >= 0 ? '#10b981' : '#fb7185', lineHeight: 1.05 }}>
          {fmt(stats.foyda)} <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>UZS</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 14, alignItems: 'baseline' }}>
          <Term label="Kirim" value={stats.kirim - stats.zapchast} color="#e2e8f0" />
          <Term sign="−" label="Ish xaqi" value={stats.ishXaqi} color="#a78bfa" />
          <Term sign="−" label="Ishxona xarajati" value={stats.ishxonaXarajat} color="#fb7185" />
          <Term sign="−" label="Aylanmadan tashqari" value={stats.tashqari} color="#fb7185" />
        </div>
      </div>

      {/* ISHCHILAR BO'YICHA MAOSH */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Banknote size={18} color="var(--text3)" />
          <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>ISHCHILAR XARAJATI</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{ishchilar.length} ta xodim</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {ishchilar.length === 0 ? (
              <tr><td style={{ padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Bu davr uchun maosh to&apos;lanmagan</td></tr>
            ) : ishchilar.map((w) => (
              <tr key={w.nom} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, color: 'white' }}>{w.nom}</td>
                <td style={{ padding: '10px 20px', fontSize: 13, fontWeight: 800, textAlign: 'right', color: '#a78bfa', whiteSpace: 'nowrap' }}>{fmt(w.summa)}</td>
              </tr>
            ))}
          </tbody>
          {ishchilar.length > 0 && (
            <tfoot>
              <tr>
                <td style={{ padding: '12px 20px', fontSize: 12.5, fontWeight: 900, color: 'var(--text3)' }}>MAOSH JAMI</td>
                <td style={{ padding: '12px 20px', fontSize: 12.5, fontWeight: 900, textAlign: 'right', color: '#a78bfa', whiteSpace: 'nowrap' }}>{fmt(stats.ishXaqi)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* BUYURTMALAR + ZAPCHASTLAR + HAR BIRINING FOYDASI */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Package size={18} color="var(--accent)" />
          <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>BUYURTMALAR VA ISHLATILGAN ZAPCHASTLAR</span>
          <span style={{ fontSize: 10.5, color: 'var(--text3)', marginLeft: 12 }}>Foyda = to&apos;lov − zapchast (ish xaqi va ishxona xarajati yuqorida, umumiy hisobda)</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{orderRows.length} ta buyurtma</span>
        </div>
        {/* Balandlik chegaralangan (ichkarida o'z skrolli bilan) — aks holda 100+
            buyurtma pastdagi "Chiqimlar" bo'limini sahifaning tagiga surib
            yuborib, boshliq uni deyarli topolmasdi. Sarlavha va "Jami" qatori
            "sticky" — skroll qilganda ham ko'rinib turadi. */}
        <div style={{ overflow: 'auto', maxHeight: 560 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                {['Sana', 'Mijoz', 'Mashina', 'Xizmat', 'Ishlatilgan zapchastlar', 'Zapchast', "To'lov", 'Foyda', 'Holat'].map((h) => (
                  <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', position: 'sticky', top: 0, background: '#171d30', zIndex: 1, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderRows.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Bu davr uchun buyurtma topilmadi</td></tr>
              ) : orderRows.map(({ row, order, parts, zapchast, foyda }) => (
                <tr key={row._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{row._displayDate}</td>
                  <td style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>{row._mijoz || '—'}</td>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{order?.mashina} {order?.raqam ? `· ${order.raqam}` : ''}</td>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmt(order?.srv || 0)}</td>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text2)', maxWidth: 300 }}>
                    {parts.length === 0 ? (
                      <span style={{ color: 'var(--text4)' }}>—</span>
                    ) : (
                      <div
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={parts.map((p) => `${p.nom} x${p.qty} — ${fmt(p.narx)}${p.alohida ? " (alohida — kassaga tushmagan)" : ''}`).join(', ')}
                      >
                        {parts.map((p, i) => (
                          <span key={i} style={{ color: p.alohida ? 'var(--text4)' : p.rasxod ? '#f59e0b' : 'var(--text2)' }}>
                            {i > 0 && ', '}{p.nom}{p.qty > 1 ? ` x${p.qty}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: zapchast > 0 ? '#f59e0b' : 'var(--text4)', whiteSpace: 'nowrap' }}>{zapchast > 0 ? `− ${fmt(zapchast)}` : '—'}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 800, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmt(row._amount)}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 900, color: foyda >= 0 ? '#10b981' : '#fb7185', whiteSpace: 'nowrap' }}>{fmt(foyda)}</td>
                  <td style={{ padding: '12px 20px', fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{order?.holat}</td>
                </tr>
              ))}
            </tbody>
            {orderRows.length > 0 && (
              <tfoot>
                <tr>
                  {[
                    { v: 'JAMI', c: 'var(--text3)' },
                    { v: '', c: '' }, { v: '', c: '' }, { v: '', c: '' }, { v: '', c: '' },
                    { v: `− ${fmt(zapchastJami)}`, c: '#f59e0b' },
                    { v: fmt(jami.tolov), c: 'var(--text2)' },
                    { v: fmt(jami.foyda), c: jami.foyda >= 0 ? '#10b981' : '#fb7185' },
                    { v: '', c: '' },
                  ].map((c, i) => (
                    <td key={i} style={{
                      padding: '12px 20px', fontSize: 12.5, fontWeight: 900, color: c.c || 'var(--text3)',
                      whiteSpace: 'nowrap', position: 'sticky', bottom: 0, background: '#171d30',
                      borderTop: '1px solid var(--border)',
                    }}>{c.v}</td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* CHIQIMLAR VA BOSHQA AMALIYOTLAR — buyurtmalar jadvalidan keyin (eski
          joyida), lekin endi ustun sarlavhalari va yozuvlar soni bilan. */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Receipt size={18} color="var(--text3)" />
          <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>CHIQIMLAR VA BOSHQA AMALIYOTLAR</span>
          <span style={{ fontSize: 10.5, color: 'var(--text3)', marginLeft: 12 }}>Ishxona xarajati, maosh, o&apos;tkazma va h.k. — buyurtmaga bog&apos;liq emas</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{otherRows.length} ta amaliyot</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {['Sana', 'Kategoriya', 'Izoh', 'Summa'].map((h, i) => (
                  <th key={h} style={{ padding: '10px 20px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {otherRows.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Bu davr uchun boshqa amaliyot yo&apos;q</td></tr>
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
