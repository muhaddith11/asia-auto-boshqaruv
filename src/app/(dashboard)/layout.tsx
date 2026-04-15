'use client';
import Sidebar from "@/components/Sidebar";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNav from "@/components/BottomNav";
import React from 'react';
import { usePathname } from 'next/navigation';
import PWAAux from "@/components/PWAAux";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <div style={{ minHeight: '100vh', width: '100%', background: 'var(--bg)' }}>
        <main>{children}</main>
        <PWAAux />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', width: '100%', background: 'var(--bg)' }}>
      {/* Sidebar: Faqat desktopda va login bo'lmagan sahifada */}
      <div className="desktop-only">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen main-content-layout" style={{ marginLeft: 240 }}>
        <GlobalNavbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>

      {/* Bottom Nav: Faqat mobil qurilmada va login bo'lmagan sahifada */}
      <div className="mobile-only">
        <BottomNav />
      </div>

      <PWAAux />
    </div>
  );
}
