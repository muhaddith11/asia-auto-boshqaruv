'use client';
import React, { useState } from 'react';
import { X, Banknote, Wrench } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Xodim } from '@/types';

interface Props {
  worker: Xodim;
  onClose: () => void;
}

export default function WorkerHistoryModal({ worker, onClose }: Props) {
  const { maoshTarixi, buyurtmalar } = useStore();
  const [activeTab, setActiveTab] = useState<'maosh' | 'ishlar'>('maosh');

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return iso; }
  };

  // ── Tab 1: Maosh tarixi ──
  const maoshHistory = maoshTarixi
    .filter(m => Number(m.xodimId) === Number(worker.id))
    .slice()
    .sort((a, b) => new Date(b.sana).getTime() - new Date(a.sana).getTime());

  const maoshJami = maoshHistory.reduce((s, m) => s + (m.summa || 0), 0);

  // ── Tab 2: Bajarilgan ishlar ──
  // Xodim bajargan barcha xizmatlarni buyurtmalardan topamiz
  interface IshRow {
    orderId: number;
    sana: string;
    mashina: string;
    xizmatNom: string;
    xizmatNarx: number;
    topganPul: number;
  }

  const ishlar: IshRow[] = [];
  for (const b of buyurtmalar) {
    // Chegirma nisbatini buyurtma darajasida hisoblash
    const srv = (b as any).srv || (b.services || []).reduce((s: number, x: any) => s + (x.narx || 0), 0);
    const zap = (b as any).zap || 0;
    const final = (b as any).final ?? (b as any).total ?? 0;
    const discountRatio = srv > 0 ? Math.min(1, Math.max(0, final - zap) / srv) : 1;

    for (const s of (b.services || [])) {
      if (Number(s.workerId) === Number(worker.id)) {
        const rawZarplata = s.zarplata ?? Math.round(((s.narx || 0) * (worker.foiz || 0)) / 100);
        const topgan = Math.round(rawZarplata * discountRatio);
        ishlar.push({
          orderId: b.id,
          sana: b.sana || b.createdAt || '',
          mashina: b.mashina || '—',
          xizmatNom: s.nom || s.name || '—',
          xizmatNarx: s.narx || 0,
          topganPul: topgan,
        });
      }
    }
  }
  ishlar.sort((a, b) => new Date(b.sana).getTime() - new Date(a.sana).getTime());

  const ishlarJami = ishlar.reduce((s, i) => s + i.topganPul, 0);

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontSize: 10,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid #1e293b',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    background: '#0b1420',
  };
  const tdStyle: React.CSSProperties = {
    padding: '11px 14px',
    fontSize: 12,
    color: '#cbd5e1',
    borderBottom: '1px solid #0f1c2d',
    verticalAlign: 'middle',
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1724] border border-[#1f2a37] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#16202b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-[16px]">
              {worker.ism.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-black uppercase tracking-tight">{worker.ism} {worker.familiya || ''}</div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Foiz: {worker.foiz}% · Tarix</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#16202b] shrink-0">
          <button
            onClick={() => setActiveTab('maosh')}
            className={`flex items-center gap-2 px-6 py-3 text-[12px] font-black uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'maosh'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Banknote size={14} /> Maosh tarixi
          </button>
          <button
            onClick={() => setActiveTab('ishlar')}
            className={`flex items-center gap-2 px-6 py-3 text-[12px] font-black uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'ishlar'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Wrench size={14} /> Bajarilgan ishlar
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* ── TAB 1: MAOSH TARIXI ── */}
          {activeTab === 'maosh' && (
            <>
              {maoshHistory.length === 0 ? (
                <div className="text-slate-500 text-center py-16 text-[13px]">Maosh to'lovlari topilmadi</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Sana</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Summa</th>
                      <th style={thStyle}>Amaliyot turi</th>
                      <th style={thStyle}>Izoh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maoshHistory.map((m) => (
                      <tr key={m.id} style={{ transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={tdStyle}>{fmtDate(m.sana)}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: '#34d399', fontWeight: 700 }}>
                          {(m.summa || 0).toLocaleString()} UZS
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            background: m.method === 'karta' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                            color: m.method === 'karta' ? '#60a5fa' : '#34d399',
                            padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700
                          }}>
                            {m.method === 'karta' ? 'Karta' : 'Naqd'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: '#94a3b8' }}>{m.izoh || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* ── TAB 2: BAJARILGAN ISHLAR ── */}
          {activeTab === 'ishlar' && (
            <>
              {ishlar.length === 0 ? (
                <div className="text-slate-500 text-center py-16 text-[13px]">Bajarilgan ishlar topilmadi</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Sana</th>
                      <th style={thStyle}>Mashina</th>
                      <th style={thStyle}>Xizmat</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Xizmat narxi</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Ishlab topgan</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Buyurtma ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ishlar.map((ish, idx) => (
                      <tr key={idx} style={{ transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={tdStyle}>{fmtDate(ish.sana)}</td>
                        <td style={{ ...tdStyle, color: '#e2e8f0', fontWeight: 600 }}>
                          {ish.mashina}
                        </td>
                        <td style={tdStyle}>{ish.xizmatNom}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>
                          {ish.xizmatNarx.toLocaleString()} UZS
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: '#34d399', fontWeight: 700 }}>
                          {ish.topganPul.toLocaleString()} UZS
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{
                            background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                            padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700
                          }}>
                            #{ish.orderId}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#16202b] flex items-center justify-between shrink-0 bg-[#0b1420]">
          <div className="text-[12px] text-slate-500 font-bold">
            {activeTab === 'maosh' ? (
              <>Jami to'langan: <span className="text-emerald-400 font-black">{maoshJami.toLocaleString()} UZS</span></>
            ) : (
              <>Jami ishlab topgan: <span className="text-emerald-400 font-black">{ishlarJami.toLocaleString()} UZS</span> · {ishlar.length} ta xizmat</>
            )}
          </div>
          <button onClick={onClose} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black text-[12px] uppercase tracking-widest transition-all">
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
