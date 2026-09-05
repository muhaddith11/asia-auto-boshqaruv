'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Trophy,
  Zap,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

// Boshliq uchun ball paneli — davr bo'yicha har xodimning tezlik/sifat bali.
// Faqat KO'RISH (o'qish). Ma'lumot manbai = points_ledger (avtomatik hisoblangan);
// bu sahifa hech narsani o'zgartirmaydi, pulga tegmaydi.

interface LedgerRow {
  worker_id: number;
  category: 'speed' | 'quality';
  points: number;
  reason: string;
  service_nom: string | null;
  order_id: number;
  detail: { work_min?: number; norma_min?: number | null; days_later?: number } | null;
  payout_salary_id: number | null;
  computed_at: string;
}

interface WorkerAgg {
  worker_id: number;
  ism: string | null;
  net: number;
  speed: number;
  quality: number;
  bonusPoints: number;
  penaltyPoints: number;
  bonusLines: number;
  penaltyLines: number;
  lineCount: number;
  unpaidPoints: number;
  rows: LedgerRow[];
}

interface SummaryData {
  period: string;
  somPerBall: number;
  workers: WorkerAgg[];
  totals: { net: number; bonus: number; penalty: number; unpaid: number };
}

const REASON_LABEL: Record<string, string> = {
  much_faster_than_norm: 'Normadan ancha tez',
  faster_than_norm: 'Normadan tez',
  within_norm: 'Normada bajarildi',
  over_norm: 'Normadan oshdi',
  far_over_norm: 'Normadan ancha oshdi',
  clean_no_rework: 'Sifatli ish',
  rework_detected: 'Qayta ta\'mirlash',
};

const OY_NOMI = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

// 'YYYY-MM' → "Avgust 2026"
function periodLabel(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  return `${OY_NOMI[m - 1]} ${y}`;
}

// Oxirgi 6 oy davrlari (joriydan orqaga). Boshliq brauzeri Toshkent vaqtida,
// shuning uchun mahalliy oy = server tashkentPeriod bilan mos keladi.
function recentPeriods(count = 6): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} ${String(
    d.getHours(),
  ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function speedDetail(d: LedgerRow['detail']): string | null {
  if (!d || d.norma_min == null || d.work_min == null) return null;
  return `norma ${d.norma_min} daq · sarflandi ${d.work_min} daq`;
}

const S = {
  input: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 12,
    color: 'var(--text)',
    outline: 'none',
  } as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text3)',
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '12px 14px',
    fontSize: 12,
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
};

function ballColor(n: number): string {
  return n > 0 ? '#34d399' : n < 0 ? '#f87171' : 'var(--text3)';
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', minWidth: 130 }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || 'var(--text)', marginTop: 3 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

export default function BossPointsPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(recentPeriods(1)[0]);
  const [open, setOpen] = useState<number | null>(null);
  const [hisoblanmoqda, setHisoblanmoqda] = useState(false);

  const periods = recentPeriods(6);

  const load = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/points/summary?period=${p}&t=${Date.now()}`);
      const j = await res.json();
      if (j.ok) setData(j);
      else toast.error(j.error || 'Yuklashda xatolik');
    } catch {
      toast.error('Yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  // Ballarni qo'lda qayta hisoblash — norms sahifasidagi tugma bilan bir xil.
  const hisobla = async () => {
    if (hisoblanmoqda) return;
    setHisoblanmoqda(true);
    const t = toast.loading('Ballar hisoblanmoqda...');
    try {
      const res = await fetch('/api/points/recalculate', { method: 'POST' });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Xatolik');
      toast.success(`Tayyor · tezlik ${j.speedRows} ta, sifat ${j.qualityRows} ta yozuv`, {
        id: t,
        duration: 5000,
      });
      await load(period);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Hisoblashda xatolik', { id: t });
    } finally {
      setHisoblanmoqda(false);
    }
  };

  const somPerBall = data?.somPerBall ?? 5000;
  const som = (ball: number) => `${(ball * somPerBall).toLocaleString()} so'm`;
  const workers = data?.workers ?? [];

  return (
    <PageLayout
      title="Ballar boshqaruvi"
      subtitle="Boshliq ko'rinishi — har xodimning tezlik va sifat bali, davr bo'yicha"
      headerActions={
        <button
          onClick={hisobla}
          disabled={hisoblanmoqda}
          style={{
            background: '#059669', border: 'none', borderRadius: 10,
            padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#fff',
            cursor: hisoblanmoqda ? 'default' : 'pointer', opacity: hisoblanmoqda ? 0.6 : 1,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
          title="Ballarni hoziroq qayta hisoblash (cron'ni kutmasdan)"
        >
          <RefreshCw size={14} className={hisoblanmoqda ? 'animate-spin' : ''} />
          Ballarni hozir hisobla
        </button>
      }
      filterPanel={
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => { setPeriod(e.target.value); setOpen(null); }}
              style={{ ...S.input, paddingRight: 34, minWidth: 170, appearance: 'none' }}
            >
              {periods.map((p) => (
                <option key={p} value={p}>{periodLabel(p)}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" color="var(--text3)" />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <StatCard label="Jami bonus" value={`+${data?.totals.bonus ?? 0}`} sub={som(data?.totals.bonus ?? 0)} color="#34d399" />
            <StatCard label="Jami jarima" value={`${data?.totals.penalty ?? 0}`} sub={som(data?.totals.penalty ?? 0)} color="#f87171" />
            <StatCard label="Sof natija" value={`${(data?.totals.net ?? 0) > 0 ? '+' : ''}${data?.totals.net ?? 0}`} sub={som(data?.totals.net ?? 0)} color={ballColor(data?.totals.net ?? 0)} />
          </div>
        </div>
      }
    >
      <div style={{ padding: '0 40px 40px' }}>
        {/* Tushuntirish */}
        <div
          className="flex items-start gap-2.5 rounded-xl p-3.5 mb-5"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <AlertCircle size={16} color="#818cf8" style={{ marginTop: 1, flexShrink: 0 }} />
          <div className="text-[12px]" style={{ color: 'var(--text2)', lineHeight: 1.6 }}>
            Ball avtomatik hisoblanadi: <b>tezlik</b> — sof ish vaqti xizmat normasiga solishtiriladi,
            <b> sifat</b> — 14 kun ichida bir xil ish qaytmasa bonus. Bu yerda faqat ko'rasiz — pul
            haftalik to'lovda avtomatik yoziladi (<b>{somPerBall.toLocaleString()} so'm/ball</b>).
            Xodim ustiga bosib tafsilotni oching.
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text3)', fontSize: 13, padding: 40, textAlign: 'center' }}>Yuklanmoqda...</div>
        ) : workers.length === 0 ? (
          <div
            className="rounded-2xl text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 48, color: 'var(--text3)', fontSize: 13 }}
          >
            Bu davrda ball yozuvi yo'q.
            <div style={{ fontSize: 12, marginTop: 6 }}>
              Norma belgilanmagan yoki vaqti o'lchanmagan ishlar baholanmaydi. "Ballarni hozir hisobla" tugmasini bosib ko'ring.
            </div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 44 }}>#</th>
                  <th style={S.th}>Xodim</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Tezlik</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Sifat</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Sof ball</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>≈ So'm</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Yozuvlar</th>
                  <th style={{ ...S.th, width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {workers.map((w, idx) => {
                  const isOpen = open === w.worker_id;
                  return (
                    <React.Fragment key={w.worker_id}>
                      <tr
                        onClick={() => setOpen(isOpen ? null : w.worker_id)}
                        style={{ cursor: 'pointer' }}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td style={{ ...S.td, color: 'var(--text3)', fontWeight: 800 }}>{idx + 1}</td>
                        <td style={S.td}>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex items-center justify-center font-black"
                              style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 11 }}
                            >
                              {(w.ism || '?').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 700 }}>{w.ism || `#${w.worker_id}`}</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, textAlign: 'center' }}>
                          <span className="inline-flex items-center gap-1" style={{ color: ballColor(w.speed), fontWeight: 700 }}>
                            <Zap size={12} />{w.speed > 0 ? '+' : ''}{w.speed}
                          </span>
                        </td>
                        <td style={{ ...S.td, textAlign: 'center' }}>
                          <span className="inline-flex items-center gap-1" style={{ color: ballColor(w.quality), fontWeight: 700 }}>
                            <ShieldCheck size={12} />{w.quality > 0 ? '+' : ''}{w.quality}
                          </span>
                        </td>
                        <td style={{ ...S.td, textAlign: 'center' }}>
                          <span className="inline-flex items-center gap-1" style={{ color: ballColor(w.net), fontWeight: 900, fontSize: 13 }}>
                            {w.net > 0 ? <TrendingUp size={13} /> : w.net < 0 ? <TrendingDown size={13} /> : null}
                            {w.net > 0 ? '+' : ''}{w.net}
                          </span>
                        </td>
                        <td style={{ ...S.td, textAlign: 'right', fontWeight: 800, color: ballColor(w.net) }}>
                          {(w.net * somPerBall).toLocaleString()}
                          {w.unpaidPoints !== 0 && (
                            <span
                              className="ml-2 inline-block"
                              style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 6, padding: '2px 6px' }}
                              title="Bu davrdagi to'lanmagan ball — keyingi haftalik to'lovda yoziladi"
                            >
                              kutilmoqda
                            </span>
                          )}
                        </td>
                        <td style={{ ...S.td, textAlign: 'center', color: 'var(--text3)' }}>{w.lineCount} ta</td>
                        <td style={{ ...S.td, textAlign: 'center', color: 'var(--text3)' }}>
                          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td colSpan={8} style={{ padding: 0, borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                            <div style={{ padding: '10px 16px 14px 58px' }}>
                              {w.rows.length === 0 ? (
                                <div style={{ color: 'var(--text3)', fontSize: 12, padding: 8 }}>Tafsilot yo'q</div>
                              ) : (
                                <div className="space-y-1.5">
                                  {w.rows.map((r, i) => {
                                    const detailStr =
                                      r.category === 'speed'
                                        ? speedDetail(r.detail)
                                        : r.detail?.days_later != null
                                          ? `${r.detail.days_later} kundan keyin qaytdi`
                                          : null;
                                    return (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          {r.category === 'speed'
                                            ? <Zap size={13} color="#60a5fa" style={{ flexShrink: 0 }} />
                                            : <ShieldCheck size={13} color="#34d399" style={{ flexShrink: 0 }} />}
                                          <div className="min-w-0">
                                            <div style={{ fontSize: 12, fontWeight: 600 }}>{REASON_LABEL[r.reason] || r.reason}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text3)' }} className="truncate">
                                              {r.service_nom || `Buyurtma #${r.order_id}`} · {fmtTime(r.computed_at)}
                                              {detailStr ? ` · ${detailStr}` : ''}
                                            </div>
                                          </div>
                                        </div>
                                        <div style={{ fontWeight: 900, fontSize: 13, color: ballColor(r.points), flexShrink: 0 }}>
                                          {r.points > 0 ? '+' : ''}{r.points}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
