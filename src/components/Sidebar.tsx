"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Wrench, 
  UserCog, 
  BarChart3, 
  ChevronDown, 
  Package,
  CreditCard,
  Zap
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
}
interface NavGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  subItems: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'orders',
    title: 'Buyurtmalar',
    icon: <ClipboardList size={16} />,
    color: '#6366f1', // Indigo
    subItems: [
      { title: 'Yangi buyurtma', href: '/orders/new' },
      { title: 'Barcha buyurtmalar', href: '/orders' }
    ]
  },
  {
    id: 'services',
    title: 'Xizmatlar',
    icon: <Wrench size={16} />,
    color: '#6366f1', // Indigo
    subItems: [
      { title: 'Xizmat qo\'shish', href: '/services?add=true' },
      { title: 'Xizmatlar ro\'yxati', href: '/services' }
    ]
  },
  {
    id: 'clients',
    title: 'Mijozlar',
    icon: <Users size={16} />,
    color: '#6366f1', // Indigo
    subItems: [
      { title: 'Mijoz qo\'shish', href: '/clients?add=true' },
      { title: 'Mijozlar ro\'yxati', href: '/clients' },
      { title: 'Mijozlar hisoboti', href: '/clients/reports' }
    ]
  },
  {
    id: 'parts',
    title: 'Zapchastlar',
    icon: <Package size={16} />,
    color: '#6366f1', // Indigo
    subItems: [
      { title: 'Zapchast qo\'shish', href: '/parts?add=true' },
      { title: 'Zapchastlar ro\'yxati', href: '/parts' },
      { title: 'Zapchastlar hisoboti', href: '/parts/reports' }
    ]
  },
  {
    id: 'workers',
    title: 'Xodimlar',
    icon: <UserCog size={16} />,
    color: '#6366f1', // Indigo
    subItems: [
      { title: 'Xodim qo\'shish', href: '/workers/new' },
      { title: 'Xodimlar ro\'yxati', href: '/workers' },
      { title: 'Xodimlar hisoboti', href: '/workers/reports' }
    ]
  },
  {
    id: 'finance',
    title: 'Hisobotlar',
    icon: <BarChart3 size={16} />,
    color: '#6366f1', // Indigo
    subItems: [
      { title: 'Ishxona bo\'yicha', href: '/reports/business' },
      { title: 'Aylanmadan tashqari', href: '/reports/external' }
    ]
  }
];

const Sidebar = () => {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(['orders']);
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-open the group that contains the active route
  useEffect(() => {
    navGroups.forEach(g => {
      if (g.subItems.some(s => s.href === pathname)) {
        setOpenGroups(prev => prev.includes(g.id) ? prev : [...prev, g.id]);
      }
    });
  }, [pathname]);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev =>
      prev.includes(group) ? [] : [group]
    );
  };

  return (
    <aside style={{
      width: 240,
      height: '100vh',
      background: '#0d1220',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50,
    }}>
      {/* ── LOGO ── */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 36,
          height: 36,
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          flexShrink: 0,
        }}>
          <Zap size={18} color="white" fill="white" />
        </div>
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            AutoServis
          </div>
          <div style={{ color: '#475569', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>
            Pro ERP
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }} className="scrollbar-none">
        {/* Dashboard */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={16} />
            <span>Bosh Sahifa</span>
          </div>
        </Link>

        {/* Grouped Nav */}
        <div style={{ marginTop: 8 }}>
          {navGroups.map((group) => {
            const isOpen = openGroups.includes(group.id);
            const hasActive = group.subItems.some(s => s.href === pathname);

            return (
              <div key={group.id}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    margin: '1px 8px',
                    width: 'calc(100% - 16px)',
                    background: isOpen ? 'rgba(99,102,241,0.1)' : hasActive ? 'rgba(99,102,241,0.06)' : 'transparent',
                    border: 'none',
                    borderLeft: (isOpen || hasActive) ? `3px solid ${group.color}` : '3px solid transparent',
                    borderRadius: '0 8px 8px 0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: (isOpen || hasActive) ? '#f1f5f9' : '#64748b',
                  }}
                  onMouseEnter={e => {
                    if (!hasActive && !isOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.currentTarget as HTMLElement).style.color = '#f1f5f9';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = isOpen ? 'rgba(99,102,241,0.1)' : hasActive ? 'rgba(99,102,241,0.06)' : 'transparent';
                    (e.currentTarget as HTMLElement).style.color = (isOpen || hasActive) ? '#f1f5f9' : '#64748b';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500 }}>
                    <span style={{ color: isOpen || hasActive ? group.color : 'inherit', display: 'flex' }}>
                      {group.icon}
                    </span>
                    {group.title}
                  </div>
                  <ChevronDown
                    size={13}
                    style={{
                      opacity: 0.4,
                      transition: 'transform 0.25s',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Sub Items */}
                {isOpen && (
                  <div style={{ paddingBottom: 4 }}>
                    {group.subItems.map(item => {
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                          <div className={`nav-sub-item ${isActive ? 'active' : ''}`}
                            style={isActive ? { color: group.color } : {}}>
                            <div style={{
                              width: isActive ? 6 : 4,
                              height: isActive ? 6 : 4,
                              borderRadius: '50%',
                              background: isActive ? group.color : 'rgba(255,255,255,0.15)',
                              flexShrink: 0,
                              transition: 'all 0.2s',
                              boxShadow: isActive ? `0 0 8px ${group.color}` : 'none',
                            }} />
                            {item.title}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── FOOTER (Clock) ── */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
          {mounted ? time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
        </div>
        <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>
          {mounted ? time.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
