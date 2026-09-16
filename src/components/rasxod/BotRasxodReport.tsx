'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, FileSpreadsheet, Timer, Wallet, XCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { exportToCSV } from '@/lib/export';
import { buildRasxodRows, summarizeRasxod, type RasxodStatus } from '@/lib/rasxodRecovery';
import { btn, fmt } from './styles';

// ─────────────────────────────────────────────────────────────────────────────
// Bot rasxodlari — xodimlar bot orqali buyurtmaga kiritgan xarajatlar
// (akkumulyator, ehtiyot qism va h.k.) va bu pul QACHON qaytgani. Bu rasxodlar
// kiritilgan zahoti kassadan ayiriladi va buyurtma to'langanda qaytadi — qo'lda
// belgilash shart emas. Mantiq @/lib/rasxodRecovery'da (sof, testlangan).
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_META: Record<RasxodStatus, { label: string; color: string; bg: string }> = {
  qaytdi: { label: 'Qaytdi', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  kutilmoqda: { label: 'Kutilmoqda', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  bekor: { label: "Yo'qoldi (bekor)", color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
};

const FILTERS: { key: 'all' | RasxodStatus; label: string }[] = [
  { key: 'kutilmoqda', label: 'Kutilmoqda' },
  { key: 'qaytdi', label: 'Qaytgan' },
  { key: 'bekor', label: "Yo'qolgan" },
  { key: 'all', label: 'Barchasi' },
];

export default function BotRasxodReport({ header }: { header: React.ReactNode }) {
  const { buyurtmalar, ishxonaOperatsiyalar } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | RasxodStatus>('kutilmoqda');

  const allRows = useMemo(
    () => buildRasxodRows(buyurtmalar, ishxonaOperatsiyalar),
    [buyurtmalar, ishxonaOperatsiyalar],
  );
  const summary = useMemo(() => summarizeRasxod(allRows), [allRows]);

  const rows = useMemo(() => {
    const filtered = statusFilter === 'all' ? allRows : allRows.filter((r) => r.status === statusFilter);
    // "Kutilmoqda" ko'rinishida eng UZOQ kutayotganlar tepada — aynan shular
    // "tezroq qaytarish" uchun e'tibor talab qiladi.
    if (statusFilter === 'kutilmoqda') {
      return [...filtered].sort((a, b) => (b.kutishKuni ?? 0) - (a.kutishKuni ?? 0));
    }
    return filtered;
  }, [allRows, statusFilter]);

  const handleExport = () => {
    exportToCSV('bot_rasxodlari', rows, [
      { key: 'vaqt', label: 'Kiritilgan sana', format: (r) => (r.vaqt ? r.vaqt.split('T')[0] : '') },
      { key: 'mashina', label: 'Mashina' },
      { key: 'raqam', label: 'Raqam' },
      { key: 'mijoz', label: 'Mijoz' },
      { key: 'nom', label: 'Nima uchun' },
      { key: 'xodimNomi', label: 'Kim kiritdi' },
      { key: 'summa', label: 'Summa' },
      { key: 'status', label: 'Holat', format: (r) => STATUS_META[r.status].label },
      { key: 'qaytishKuni', label: 'Qaytish kuni', format: (r) => r.qaytishKuni ?? '' },
      { key: 'kutishKuni', label: 'Kutish kuni (hozircha)', format: (r) => r.kutishKuni ?? '' },
    ]);
  };

  return (
    <>
      {/* SARLAVHA */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
        {header}
        <button type="button" className="rd-btn" onClick={handleExport} style={btn('success')}>
          <FileSpreadsheet size={15} /> Excel
        </button>
      </div>

      {/* STATISTIKA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Hali qaytmagan', value: summary.outstandingAmount, hint: `${summary.outstandingCount} ta rasxod`, icon: <Clock size={20} />, color: '#f59e0b' },
          { label: 'Jami chiqarilgan', value: summary.totalAmount, hint: `${summary.totalCount} ta rasxod`, icon: <Wallet size={20} />, color: '#6366f1' },
          {
            label: "O'rtacha qaytish muddati",
            value: null,
            display: summary.avgRecoveryDays != null ? `${summary.avgRecoveryDays} kun` : '—',
            hint: `${summary.recoveredCount} ta qaytgan asosida`,
            icon: <CheckCircle2 size={20} />, color: '#10b981',
          },
          { label: "Yo'qolgan (bekor buyurtma)", value: summary.lostAmount, hint: `${summary.lostCount} ta`, icon: <XCircle size={20} />, color: '#f43f5e' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 8, borderRadius: 8, background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>
              {s.value != null ? fmt(s.value) : s.display}
              {s.value != null && <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}> UZS</span>}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text3)', marginTop: 4 }}>{s.hint}</div>
          </div>
        ))}
      </div>

      {/* IZOH */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: 24, fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.5 }}>
        <Timer size={15} color="#818cf8" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          {"Bu yerda xodimlar BOT orqali buyurtmaga kiritgan rasxodlar. Ular kiritilgan zahoti kassadan (naqd) ayiriladi va o'sha buyurtmaning yakuniy to'loviga qo'shiladi — pul mijoz buyurtmani TO'LIQ to'laganda avtomatik qaytadi, qo'lda belgilash shart emas. Kassadan ayirilmagan rasxodlar uchun «Rasxod daftari»dan foydalaning."}
        </div>
      </div>

      {/* FILTR */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button key={f.key} type="button" className="rd-btn" onClick={() => setStatusFilter(f.key)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: statusFilter === f.key ? 'var(--accent)' : 'var(--surface2)',
            color: statusFilter === f.key ? '#fff' : 'var(--text2)',
          }}>
            {f.label}
            {f.key !== 'all' && (
              <span style={{ marginLeft: 6, opacity: 0.7 }}>
                {allRows.filter((r) => r.status === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* JADVAL */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {['Sana', 'Mashina / Mijoz', 'Nima uchun', 'Kim kiritdi', 'Summa', 'Holat'].map((h) => (
                  <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Bu turkumda rasxod topilmadi</td></tr>
              ) : rows.map((r, i) => {
                const meta = STATUS_META[r.status];
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 20px', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {r.vaqt ? new Date(r.vaqt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{r.mashina || '—'} {r.raqam && <span style={{ fontWeight: 500, color: 'var(--text3)' }}>· {r.raqam}</span>}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{r.mijoz} · #{r.orderId}</div>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text2)' }}>{r.nom}</td>
                    <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text2)' }}>{r.xodimNomi || '—'}</td>
                    <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 800, color: 'white', whiteSpace: 'nowrap' }}>{fmt(r.summa)}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: meta.bg, color: meta.color, whiteSpace: 'nowrap' }}>
                        {meta.label}
                      </span>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>
                        {r.status === 'qaytdi' && (r.qaytishKuni != null ? `${r.qaytishKuni} kunda qaytdi` : 'qaytdi')}
                        {r.status === 'kutilmoqda' && (r.kutishKuni != null ? `${r.kutishKuni} kun kutmoqda` : 'kutilmoqda')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
