'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ClipboardList,
  ChevronRight,
  ArrowUpRight,
  Zap,
  Activity,
  Target,
  Clock
} from 'lucide-react';
import { useStore } from '@/store/useStore';

// ── STATUS CONFIG ──────────────────────────────────────────────
const statusConfig: Record<string, { label: string; cls: string }> = {
  kutilmoqda: { label: 'Kutilmoqda',  cls: 'status-kutilmoqda' },
  jarayonda:  { label: 'Jarayonda',   cls: 'status-jarayonda'  },
  zapchast:   { label: 'Zapchast',    cls: 'status-zapchast'   },
  tolov:      { label: "To'lov",      cls: 'status-tolov'      },
  tayyor:     { label: 'Tayyor',      cls: 'status-tayyor'     },
  bekor:      { label: 'Bekor',       cls: 'status-bekor'      },
};

export default function Dashboard() {
  const { buyurtmalar, xodimlar, kassa } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().substring(0, 7);

  const todayOrders  = buyurtmalar.filter(b => b.sana === today);
  const monthOrders  = buyurtmalar.filter(b => b.sana.startsWith(currentMonth));
  const todayIncome  = todayOrders.reduce((s, b) => s + b.final, 0);
  const todayProfit  = todayOrders.reduce((s, b) => s + (b.pribil || 0), 0);
  const monthIncome  = monthOrders.reduce((s, b) => s + b.final, 0);
  const totalBalance = kassa.naqd + kassa.karta;

  const recentOrders = [...buyurtmalar].reverse().slice(0, 6);

  // Top workers by turnover
  const workerStats = xodimlar.map(x => {
    const turnover = buyurtmalar.reduce((sum, b) =>
      sum + b.services
        .filter(s => s.workerId === x.id)
        .reduce((ss, s) => ss + (s.narx || 0), 0), 0
    );
    return { ...x, turnover, earned: Math.round(turnover * x.foiz / 100) };
  }).sort((a, b) => b.turnover - a.turnover).slice(0, 4);

  const maxTurnover = workerStats[0]?.turnover || 1;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* ── CONTENT ────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── STAT CARDS ──────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            {
              label: "Bugungi buyurtmalar",
              value: todayOrders.length,
              suffix: 'ta',
              sub: "Bugun qabul qilingan",
              icon: <ClipboardList size={20} />,
              color: '#6366f1',
              glow: 'rgba(99,102,241,0.18)',
            },
            {
              label: "Bugungi tushum",
              value: todayIncome.toLocaleString(),
              suffix: 'so\'m',
              sub: "Kassaga kirgan",
              icon: <Activity size={20} />,
              color: '#06b6d4',
              glow: 'rgba(6,182,212,0.18)',
            },
            {
              label: "Bugungi sof foyda",
              value: todayProfit.toLocaleString(),
              suffix: 'so\'m',
              sub: "Xarajatlar chiqarilib",
              icon: <TrendingUp size={20} />,
              color: '#10b981',
              glow: 'rgba(16,185,129,0.18)',
            },
            {
              label: "Bu oygi oborot",
              value: monthIncome.toLocaleString(),
              suffix: 'so\'m',
              sub: `${monthOrders.length} ta buyurtma`,
              icon: <Target size={20} />,
              color: '#f59e0b',
              glow: 'rgba(245,158,11,0.18)',
            },
          ].map((stat, i) => (
            <div key={i} className="stat-card" style={{ padding: 22 }}>
              {/* Top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: stat.color, borderRadius: '14px 14px 0 0' }} />
              
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {stat.label}
                </span>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: stat.glow,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>

              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {stat.value}
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text3)', marginLeft: 4 }}>{stat.suffix}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowUpRight size={12} color={stat.color} />
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN ROW ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, flex: 1 }}>

          {/* Recent Orders */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={16} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>So'nggi buyurtmalar</span>
              </div>
              <Link href="/orders" style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none',
              }}>
                Barchasi <ChevronRight size={13} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 48 }}>
                <ClipboardList size={48} color="var(--surface3)" />
                <span style={{ color: 'var(--text4)', fontSize: 14 }}>Buyurtmalar yo'q</span>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mijoz</th>
                    <th>Mashina</th>
                    <th>Sana</th>
                    <th style={{ textAlign: 'right' }}>Summa</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((b) => {
                    const sc = statusConfig[b.holat] || { label: b.holat, cls: '' };
                    return (
                      <tr key={b.id}>
                        <td style={{ color: 'var(--text3)', fontWeight: 600 }}>#{b.id}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{b.ism}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{b.tel || '—'}</div>
                        </td>
                        <td style={{ color: 'var(--text2)', fontSize: 12, fontWeight: 500 }}>{b.mashina}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: 11 }}>
                            <Clock size={11} />
                            {b.sana}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>
                          {b.final.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${sc.cls}`}>{sc.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Workers Leaderboard */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.02)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Zap size={16} color="var(--amber)" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Eng faol xodimlar</span>
            </div>

            <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {workerStats.length === 0 ? (
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text4)' }}>
                  Xodimlar yo'q
                </div>
              ) : (
                workerStats.map((w, i) => {
                  const pct = Math.round((w.turnover / maxTurnover) * 100);
                  const colors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];
                  const c = colors[i % colors.length];
                  return (
                    <div key={w.id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: `${c}20`, border: `1.5px solid ${c}50`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, color: c,
                          }}>
                            {i + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{w.ism}</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{w.mutax || 'Usta'}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{w.earned.toLocaleString()}</div>
                          <div style={{ fontSize: 10, color: 'var(--text4)' }}>ulush</div>
                        </div>
                      </div>
                      <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${c}, ${c}99)`, borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <Link href="/workers" style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 0', fontSize: 11, fontWeight: 700,
                  color: 'var(--text3)', cursor: 'pointer', letterSpacing: '0.07em',
                  textTransform: 'uppercase', transition: 'all 0.2s',
                }}>
                  Barcha xodimlar →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
