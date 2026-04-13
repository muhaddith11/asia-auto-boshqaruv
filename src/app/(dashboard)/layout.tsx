import Sidebar from "@/components/Sidebar";
import GlobalNavbar from "@/components/GlobalNavbar";
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', width: '100%' }}>
      {/* DIAGNOSTIKA BANNERI */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        background: '#ef4444', 
        color: 'white', 
        textAlign: 'center', 
        fontSize: '10px', 
        fontWeight: 'bold', 
        padding: '2px', 
        zIndex: 9999,
        letterSpacing: '1px'
      }}>
        DEBUG MODE: VERSION 2.2 - NO-IZOH-FIX-APPLIED
      </div>
      
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '14px' }}>
        <GlobalNavbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
