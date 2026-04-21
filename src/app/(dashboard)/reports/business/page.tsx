'use client';
import React from 'react';
import { useStore } from '@/store/useStore';

/**
 * BusinessReportPage (Stage 2.1: Data Connection Test)
 * ---------------------------------------------------
 * Faqat store ulanishini tekshirish uchun.
 */
export default function BusinessReportPage() {
  const store = useStore();
  const ordersCount = store?.buyurtmalar?.length || 0;
  const opsCount = store?.ishxonaOperatsiyalar?.length || 0;

  return (
    <div style={{ flex: 1, padding: 40, background: '#0a0d14', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Moliya Hisoboti (Store Test)</h1>
      <p style={{ marginTop: 20, color: '#94a3b8' }}>
        Ma'lumotlar yuklanishi tekshirilmoqda...
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 40 }}>
        <div style={{ padding: 20, background: '#121721', borderRadius: 12, border: '1px solid #334155' }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>BUYURTMALAR SONI</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>{ordersCount}</div>
        </div>
        <div style={{ padding: 20, background: '#121721', borderRadius: 12, border: '1px solid #334155' }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>OPERATSIYALAR SONI</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>{opsCount}</div>
        </div>
      </div>

      <p style={{ marginTop: 40, color: '#64748b', fontSize: 13 }}>
        Agar bu ma'lumotlar chiqayotgan bo'lsa, demak bazaga ulanish to'g'ri ishlayapti.
      </p>
    </div>
  );
}
