'use client';
export const dynamic = 'force-dynamic';
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
import AiForecast from '@/components/AiForecast';
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
    <div className="flex-1 flex flex-col bg-[#0b0d11]">
      {/* ── CONTENT ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 md:gap-8">

        {/* ── STAT CARDS ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
            <div key={i} className="stat-card p-6 md:p-8 relative">
              {/* Top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: stat.color, borderRadius: '14px 14px 0 0' }} />
              
              <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  {stat.label}
                </span>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: stat.glow,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>

              <div className="text-[22px] md:text-[26px] font-black text-white tracking-tight leading-none mb-2">
                {stat.value}
                <span className="text-[12px] font-medium text-slate-500 ml-1.5">{stat.suffix}</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-2">
                <ArrowUpRight size={10} color={stat.color} />
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN ROW ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 md:gap-8 flex-1">

          {/* Recent Orders */}
          <div className="glass-card flex flex-col overflow-hidden">
             <div className="px-6 md:px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <ClipboardList size={16} className="text-blue-500" />
                <span className="font-bold text-[13px] md:text-[14px] text-white uppercase tracking-tight">So'nggi buyurtmalar</span>
              </div>
              <Link href="/orders" className="flex items-center gap-1.5 text-[11px] font-black text-blue-500 hover:text-blue-400 no-underline uppercase tracking-widest">
                Barchasi <ChevronRight size={13} />
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
              {recentOrders.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-4 p-12">
                  <ClipboardList size={40} className="text-slate-800" />
                  <span className="text-slate-600 text-[13px] font-medium italic">Buyurtmalar yo'q</span>
                </div>
              ) : (
                <table className="w-full text-left text-[13px] whitespace-nowrap min-w-[700px]">
                  <thead className="bg-[#1e212b] text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Mijoz</th>
                      <th className="px-6 py-4">Mashina</th>
                      <th className="px-6 py-4">Sana</th>
                      <th className="px-6 py-4 text-right">Summa</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentOrders.map((b) => {
                      const sc = statusConfig[b.holat] || { label: b.holat, cls: '' };
                      return (
                        <tr key={b.id} className="hover:bg-white/[0.02] transition-all">
                          <td className="px-6 py-4 text-slate-500 font-bold">#{b.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white mb-0.5">{b.ism}</div>
                            <div className="text-[11px] text-slate-500">{b.tel || '—'}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-medium">{b.mashina}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Clock size={11} />
                              {b.sana}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-white">
                            {b.final.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`badge ${sc.cls}`}>{sc.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right column: workers leaderboard + AI forecast */}
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="glass-card flex flex-col overflow-hidden">
              <div className="px-6 md:px-8 py-5 border-b border-white/5 flex items-center gap-2.5 bg-white/[0.02]">
                <Zap size={16} className="text-amber-500" />
                <span className="font-bold text-[13px] md:text-[14px] text-white uppercase tracking-tight">Eng faol xodimlar</span>
              </div>

              <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
                {workerStats.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-[13px] italic p-8">
                    Xodimlar yo'q
                  </div>
                ) : (
                  workerStats.map((w, i) => {
                    const pct = Math.round((w.turnover / maxTurnover) * 100);
                    const colors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];
                    const c = colors[i % colors.length];
                    return (
                      <div key={w.id}>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-3">
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: `${c}10`, border: `1.5px solid ${c}30`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 900, color: c,
                            }}>
                              {i + 1}
                            </div>
                            <div>
                              <div className="text-[13px] font-black text-white leading-none mb-1">{w.ism}</div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{w.mutax || 'Usta'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div style={{ fontSize: 13, fontWeight: 900, color: c }}>{w.earned.toLocaleString()}</div>
                            <div className="text-[9px] text-slate-600 font-bold uppercase">ulush</div>
                          </div>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div style={{ height: '100%', width: `${pct}%`, background: c, boxShadow: `0 0 10px ${c}40` }} className="transition-all duration-1000" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-6 md:px-8 py-4 border-t border-white/5 bg-white/[0.01]">
                <Link href="/workers" className="no-underline">
                  <button className="w-full bg-white/5 border border-white/5 rounded-xl py-3 text-[10px] font-black text-slate-400 cursor-pointer tracking-widest uppercase transition-all hover:text-white hover:bg-white/10 active:scale-[0.98]">
                    Barcha xodimlar ro'yxati →
                  </button>
                </Link>
              </div>
            </div>

            <AiForecast />
          </div>
        </div>
      </div>
    </div>
  );
}
