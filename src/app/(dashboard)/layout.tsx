'use client';
import Sidebar from "@/components/Sidebar";
import GlobalNavbar from "@/components/GlobalNavbar";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import PWAAux from "@/components/PWAAux";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content-layout" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <GlobalNavbar onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
      <PWAAux />
    </div>
  );
}
