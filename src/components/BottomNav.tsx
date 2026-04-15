'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, PlusCircle, PieChart, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Asosiy', icon: Home, path: '/' },
    { label: 'Buyurtmalar', icon: ClipboardList, path: '/orders' },
    { label: 'Qo\'shish', icon: PlusCircle, path: '/orders/new', highlight: true },
    { label: 'Hisobot', icon: PieChart, path: '/reports/business' },
    { label: 'Boshqa', icon: Settings, path: '/workers' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[70px] bg-[#0d1220] border-t border-white/5 z-[100] flex items-center justify-around px-4 lg:hidden">
      {navItems.map((item) => {
        const active = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              item.highlight 
                ? 'bg-blue-600 p-3 rounded-full -translate-y-4 shadow-lg shadow-blue-600/30' 
                : (active ? 'text-blue-500' : 'text-slate-500')
            }`}
          >
            <item.icon size={item.highlight ? 24 : 20} className={item.highlight ? 'text-white' : ''} />
            {!item.highlight && <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
