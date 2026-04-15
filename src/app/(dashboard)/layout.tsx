import Sidebar from "@/components/Sidebar";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNav from "@/components/BottomNav";
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex w-full bg-[#0b0d11]">
      {/* Sidebar hidden on mobile, visible on lg screens */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Content area: margin-left 0 on mobile, 240px on lg screens */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px] pb-[70px] lg:pb-0">
        <GlobalNavbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <BottomNav />
    </div>
  );
}
