'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Users, ClipboardList, Package, Banknote, Clock, ExternalLink } from 'lucide-react';
import AiForecast from '@/components/AiForecast';
import Link from 'next/link';

export default function Dashboard() {
  const { buyurtmalar, xodimlar, kassa } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const activeOrders = buyurtmalar.filter(o => o.holat !== 'tulangan' && o.holat !== 'bekor qilingan');
  const recentOrders = [...buyurtmalar].reverse().slice(0, 6);

  const stats = [
    { title: 'Jami Buyurtmalar', value: buyurtmalar.length, icon: ClipboardList, color: 'var(--cyan)', path: '/orders' },
    { title: 'Aktiv Buyurtmalar', value: activeOrders.length, icon: Clock, color: 'var(--accent)', path: '/orders' },
    { title: 'Ishchilar', value: xodimlar.length, icon: Users, color: 'var(--orange)', path: '/workers' },
    { title: 'Kassa Jami', value: (kassa.naqd + kassa.karta).toLocaleString() + ' so\'m', icon: Banknote, color: 'var(--green)', path: '/reports/business' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* ── CONTENT ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col gap-6 lg:gap-8">
        
        {/* Stats Grid: Mobil ekranlarda 2 ta, kompyuterda 4 ta ustun */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <Link key={i} href={stat.path} className="stat-card" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
              </div>
              <div style={{ fontSize: 11, lg: 13, fontWeight: 700, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.title}</div>
              <div style={{ fontSize: 16, lg: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{stat.value}</div>
            </Link>
          ))}
        </div>

        {/* Main Grid: Telefonda ustma-ust (grid-cols-1), kompyuterda (grid-cols-3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Recent Orders: Kompyuterda 2 ta ustunli kenglikni oladi */}
          <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={16} color="var(--accent)" /> Oxirgi buyurtmalar
              </h3>
              <Link href="/orders" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(99,102,241,0.1)', padding: '5px 12px', borderRadius: 8 }}>
                Barchasi
              </Link>
            </div>
            {/* Jadval sig'maganda yon tomonga suriladi (overflow-x-auto) */}
            <div className="overflow-x-auto">
              <table className="data-table min-w-[600px] lg:min-w-full">
                <thead>
                  <tr>
                    <th>MAREKA / NOMI</th>
                    <th>RAQAMI</th>
                    <th>HOLAT</th>
                    <th>SUMMA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700 }}>{order.mashina}</td>
                      <td><span className="badge-outline">{order.raqam}</span></td>
                      <td>
                        <span className={`status-badge ${order.holat === 'tulangan' ? 'status-done' : order.holat === 'tamirlanmoqda' ? 'status-process' : 'status-pending'}`}>
                          {order.holat}
                        </span>
                      </td>
                      <td style={{ color: 'var(--green)', fontWeight: 800 }}>{order.final.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights Sidebar: Telefonda jadvalning tagidan chiqadi */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <AiForecast />
          </div>
        </div>
      </div>
    </div>
  );
}
