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
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col gap-6 lg:gap-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <Link key={i} href={stat.path} className="stat-card" style={{ textDecoration: 'none', padding: '24px lg:32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={18} color={stat.color} />
                </div>
              </div>
              <div className="text-[10px] lg:text-[13px] font-bold text-[var(--text3)] mb-1 uppercase tracking-wider">{stat.title}</div>
              <div className="text-[15px] lg:text-[22px] font-black text-white">{stat.value}</div>
            </Link>
          ))}
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden p-0!">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 14, lg: 15, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={16} color="var(--accent)" /> Oxirgi buyurtmalar
              </h3>
              <Link href="/orders" className="text-[11px] font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-lg no-underline">
                Hammasi
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table min-w-[500px] lg:min-w-full">
                <thead>
                  <tr>
                    <th>MASHINA</th>
                    <th>RAQAM</th>
                    <th className="desktop-only text-center">HOLAT</th>
                    <th className="text-right">SUMMA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700 }}>{order.mashina}</td>
                      <td><span className="badge-outline text-[11px]">{order.raqam}</span></td>
                      <td className="desktop-only text-center">
                        <span className={`status-badge ${order.holat === 'tulangan' ? 'status-done' : 'status-pending'}`}>
                          {order.holat}
                        </span>
                      </td>
                      <td className="text-right" style={{ color: 'var(--green)', fontWeight: 800 }}>{order.final.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:gap-8">
            <AiForecast />
          </div>
        </div>
      </div>
    </div>
  );
}
