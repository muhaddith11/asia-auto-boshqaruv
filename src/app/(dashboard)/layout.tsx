'use client';
import Sidebar from "@/components/Sidebar";
import GlobalNavbar from "@/components/GlobalNavbar";
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
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <GlobalNavbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
      {/* Mobil menyular hozircha butunlay o'chirildi */}
      <PWAAux />
    </div>
  );
}
