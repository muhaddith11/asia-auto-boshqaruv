'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Bot, NotebookPen, Wrench } from 'lucide-react';
import RasxodDaftar from '@/components/rasxod/RasxodDaftar';
import BotRasxodReport from '@/components/rasxod/BotRasxodReport';

// ─────────────────────────────────────────────────────────────────────────────
// "Rasxod qaytishi" — ikki ko'rinish:
//  • Rasxod daftari (asosiy) — mashinaga qilingan, KASSADAN AYIRILMAGAN
//    rasxodlarni qo'lda yozib borish; mijoz pulni qaytarganda "To'landi"
//    qilinadi. Kassaga tegmaydi. (@/lib/rasxodDaftar, /api/rasxod-daftar)
//  • Bot rasxodlari — xodimlar bot orqali buyurtmaga kiritgan rasxodlar:
//    kassadan darrov ayiriladi, buyurtma to'langanda qaytadi. (@/lib/rasxodRecovery)
// ─────────────────────────────────────────────────────────────────────────────

type View = 'daftar' | 'bot';

const VIEWS: { key: View; label: string; icon: React.ReactNode; subtitle: string }[] = [
  {
    key: 'daftar',
    label: 'Rasxod daftari',
    icon: <NotebookPen size={14} />,
    subtitle: "Mashinaga qilingan, kassadan ayirilmagan rasxodlar — mijoz qaytarguncha shu yerda yozilib turadi",
  },
  {
    key: 'bot',
    label: 'Bot rasxodlari',
    icon: <Bot size={14} />,
    subtitle: "Xodimlar bot orqali buyurtmaga kiritgan rasxodlar — kassadan ayirilgan, buyurtma to'langanda qaytadi",
  },
];

export default function RasxodReportPage() {
  const [view, setView] = useState<View>('daftar');
  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0];

  const header = (
    <div style={{ minWidth: 0 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Wrench size={20} color="var(--accent)" /> Rasxod qaytishi
      </h1>
      <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{current.subtitle}</p>
      <div
        role="tablist"
        aria-label="Ko'rinish"
        style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4, marginTop: 14, padding: 4, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {VIEWS.map((v) => {
          const active = v.key === view;
          return (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={active}
              className="rd-btn"
              onClick={() => setView(v.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 9,
                border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                background: active ? 'rgba(99,102,241,0.18)' : 'transparent',
                color: active ? '#c7d2fe' : 'var(--text3)',
              }}
            >
              {v.icon} {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '28px clamp(14px, 3vw, 28px) 60px', background: 'var(--bg)', color: 'white', minHeight: '100vh' }}>
      {view === 'daftar' ? <RasxodDaftar header={header} /> : <BotRasxodReport header={header} />}
    </div>
  );
}
