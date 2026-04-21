'use client';
import React from 'react';

/**
 * BusinessReportPage (Stage 1: Minimalist)
 * ---------------------------------------
 * Bu sahifa hozircha faqat test rejimida.
 */
export default function BusinessReportPage() {
  return (
    <div style={{ flex: 1, padding: 40, background: '#0a0d14', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Moliya Hisoboti (Ishlanmoqda...)</h1>
      <p style={{ marginTop: 20, color: '#94a3b8' }}>
        Sahifa xavfsiz holatda tiklanmoqda. Agar siz ushbu yozuvni ko'rayotgan bo'lsangiz, demak sayt barqaror ishlayapti.
      </p>
      <div style={{ marginTop: 40, padding: 20, border: '1px dashed #334155', borderRadius: 12 }}>
        Yaqinda bu yerda keng qamrovli filtrlar va barcha amaliyotlar jadvali paydo bo'ladi.
      </div>
    </div>
  );
}
