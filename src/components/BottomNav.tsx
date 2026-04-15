'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  BarChart3, 
  Settings,
  Plus
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Asosiy', href: '/' },
    { icon: <ClipboardList size={22} />, label: 'Buyurtmalar', href: '/orders' },
    { icon: <div className="bg-blue-600 rounded-full p-3 mb-6 shadow-lg shadow-blue-500/40 border-4 border-[#0d1220] transition-transform active:scale-90"><Plus size={24} color="white" /></div>, label: '', href: '/orders/new' },
    { icon: <BarChart3 size={22} />, label: 'Hisobot', href: '/reports/business' },
    { icon: <Settings size={22} />, label: 'Boshqa', href: '/workers' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[70px] bg-[#0d1220] border-t border-white/5 z-[100] flex items-center justify-around px-4 lg:hidden">
      {navItems.map((item, i) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link 
            key={i} 
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all ${isActive ? 'text-blue-500' : 'text-slate-500 animate-in fade-in'}`}
          >
            <div className={`${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </div>
            {item.label && <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
