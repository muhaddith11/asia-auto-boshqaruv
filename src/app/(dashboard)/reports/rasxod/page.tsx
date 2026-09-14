'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { exportToCSV } from '@/lib/export';
import { buildRasxodRows, summarizeRasxod, type RasxodStatus } from '@/lib/rasxodRecovery';
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  FileSpreadsheet,
  Wrench,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// "Rasxod qaytishi" — xodimlar bot orqali mashinaga o'z puliga qilgan
// xarajatlarni (akkumulyator, ehtiyot qism va h.k. sotib olish) va bu pul
// QACHON ishxonaga qaytganini (mijoz to'laganda) kuzatish. Maqsad: qaysi
// mashinaga qancha pul "osilib" turibdi va o'rtacha qanchada qaytib kelishini
// ko'rish — shu orqali qaysi buyurtmalarni tezroq yakunlash/to'lov olish
// kerakligini aniqlash mumkin.
//
// Mantiq @/lib/rasxodRecovery'da (sof, testlangan).
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

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

export default function RasxodReportPage() {
  const { buyurtmalar, ishxonaOperatsiyalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | RasxodStatus>('kutilmoqda');

  useEffect(() => setMounted(true), []);

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
    exportToCSV('rasxod_qaytishi', rows, [
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

  if (!mounted) return null;

  return (
    <div style={{ flex: 1, padding: '28px 28px 60px', background: 'var(--bg)', color: 'white', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wrench size={20} color="var(--accent)" /> Rasxod qaytishi
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            Xodimlar mashinaga o&apos;z puldan qilgan xarajatlari — qaysi mashinaga, qancha, va bu pul qachon qaytdi
          </p>
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

      {/* STATS */}
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
          Rasxod summasi kiritilgan zahoti kassadan (naqd) ayiriladi va o&apos;sha buyurtmaning yakuniy to&apos;loviga qo&apos;shiladi.
          Pul mijoz TO&apos;LIQ to&apos;laganda ("to&apos;langan") ishxonaga qaytadi. Uzoq &quot;Kutilmoqda&quot; bo&apos;lgan buyurtmalar — pulimiz eng ko&apos;p vaqt turgan joylar.
        </div>
      </div>

      {/* FILTR */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{
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
    </div>
  );
}
