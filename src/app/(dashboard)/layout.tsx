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
      {/* Sidebar: Faqat kompyuterda (lg: dan kattada) ko'rinadi */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Asosiy sath: Kompyuterda 240px joy qoladi (lg:ml-[240px]), telefonda 0 */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px] pb-[70px] lg:pb-0">
        <GlobalNavbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>

      {/* Bottom Navigation: Faqat telefonda (lg dan kichikda) ko'rinadi */}
      <BottomNav />
      
      <PWAAux />
    </div>
  );
}
