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

  const activeOrders = buyurtmalar.filter(o => o.status !== 'Yopilgan');
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
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {stats.map((stat, i) => (
            <Link key={i} href={stat.path} className="stat-card" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.title}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{stat.value}</div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
          {/* Recent Orders */}
          <div className="glass-card flex flex-col overflow-hidden">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={16} color="var(--accent)" /> Oxirgi buyurtmalar
              </h3>
              <Link href="/orders" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(99,102,241,0.1)', padding: '5px 12px', borderRadius: 8 }}>
                Hammasini ko'rish
              </Link>
            </div>
            <div style={{ padding: '8px 0' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>MAREKA / NOMI</th>
                    <th>RAQAMI</th>
                    <th>STATUS</th>
                    <th>XIZMATLAR</th>
                    <th>SUMMA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700 }}>{order.mashinaMarkasi}</td>
                      <td><span className="badge-outline">{order.mashinaRaqami}</span></td>
                      <td>
                        <span className={`status-badge ${order.status === 'Tugatilgan' ? 'status-done' : order.status === 'Jarayonda' ? 'status-process' : 'status-pending'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.servislar.length} ta xizmat</td>
                      <td style={{ color: 'var(--green)', fontWeight: 800 }}>{order.jamiSumma.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights Sidebar Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <AiForecast />
          </div>
        </div>
      </div>
    </div>
  );
}
