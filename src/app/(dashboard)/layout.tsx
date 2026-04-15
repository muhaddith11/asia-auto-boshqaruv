import Sidebar from "@/components/Sidebar";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNav from "@/components/BottomNav";
import React from 'react';
import PWAAux from "@/components/PWAAux";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', width: '100%', background: 'var(--bg)' }}>
      {/* Sidebar: Media Query orqali faqat desktopda chiqadi */}
      <div className="desktop-only">
        <Sidebar />
      </div>

      {/* Main: Kompyuterda 240px margin, telefonda 0 (CSS media query orqali) */}
      <div className="flex-1 flex flex-col min-h-screen main-content-layout" style={{ marginLeft: 240 }}>
        <GlobalNavbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>

      {/* BottomNav: Media Query orqali faqat telefonda chiqadi */}
      <div className="mobile-only">
        <BottomNav />
      </div>

      <PWAAux />
    </div>
  );
}
