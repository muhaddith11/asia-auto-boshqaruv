'use client';
import React, { useMemo, useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { bolimMeta, normalizeBolim } from '@/lib/departments';

interface Props {
  onClose: () => void;
}

interface WorkerProfitRow {
  id: number;
  ism: string;
  bolim?: string;
  role?: string;
  profit: number;
  orders: number;
}

export default function MonthlyProfitModal({ onClose }: Props) {
  const { xodimlar, buyurtmalar } = useStore();

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(defaultMonth);

  // Har bir xodim ushbu oyda ishxonaga qancha foyda opkeldi:
  // - Xizmatli buyurtmalarda: (xizmat narxi − usta ulushi) × chegirma nisbati,
  //   xizmatni bajargan xodimga yoziladi.
  // - Xizmatsiz buyurtmalarda (yog' quyish bo'limi — "xizmat" tushunchasi yo'q,
  //   foyda faqat yog'/filtr narx−tannarx farqidan): buyurtma foydasidan xodimning
  //   o'z ulushi (foiz%) ayirilib, qolgani qabul qilib ishlagan xodimga yoziladi —
  //   ustaxonadagi bilan bir xil mantiq (xodimning shaxsiy ulushi har doim chiqarib
  //   tashlanadi, faqat kompaniyaga qolgan sof foyda ko'rsatiladi).
  const profitMap = useMemo(() => {
    const foizById = new Map(xodimlar.map(w => [Number(w.id), w.foiz || 0]));
    const acc = new Map<number, { profit: number; orders: Set<string> }>();

    const bump = (wid: number, profit: number, orderId: any) => {
      if (!Number.isFinite(wid)) return;
      const cur = acc.get(wid) || { profit: 0, orders: new Set<string>() };
      cur.profit += profit;
      cur.orders.add(String(orderId));
      acc.set(wid, cur);
    };

    buyurtmalar.forEach((b: any) => {
      if (b.holat !== 'tulangan') return;
      if (!b.sana || !b.sana.startsWith(month)) return;

      const services = b.services || [];
      const srv = b.srv || services.reduce((s: number, sv: any) => s + (sv.narx || 0), 0);
      const zap = b.zap || 0;
      const final = b.final ?? b.total ?? 0;
      const ratio = srv > 0 ? Math.min(1, Math.max(0, final - zap) / srv) : 1;

      if (services.length > 0) {
        services.forEach((s: any) => {
          const wid = Number(s.workerId);
          if (!foizById.has(wid)) return;
          const raw = s.zarplata ?? Math.round(((s.narx || 0) * (foizById.get(wid) || 0)) / 100);
          const profit = Math.round(((s.narx || 0) - raw) * ratio);
          bump(wid, profit, b.id);
        });
      } else if (b.qabul_xodim_id && foizById.has(Number(b.qabul_xodim_id))) {
        const wid = Number(b.qabul_xodim_id);
        const orderPribil = Math.max(0, Number(b.pribil) || 0);
        const foiz = foizById.get(wid) || 0;
        const companyProfit = Math.round(orderPribil * (1 - foiz / 100));
        bump(wid, companyProfit, b.id);
      }
    });

    return acc;
  }, [buyurtmalar, xodimlar, month]);

  const rows: WorkerProfitRow[] = useMemo(() => {
    return xodimlar
      .filter(x => x.role !== 'sherik')
      .map(x => {
        const entry = profitMap.get(Number(x.id));
        return {
          id: x.id,
          ism: x.ism,
          bolim: x.bolim,
          role: x.role,
          profit: entry?.profit || 0,
          orders: entry?.orders.size || 0,
        };
      })
      .sort((a, b) => b.profit - a.profit);
  }, [xodimlar, profitMap]);

  const jamiFoyda = rows.reduce((s, r) => s + r.profit, 0);

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
      <div className="bg-[#0f1724] border border-[#1f2a37] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#16202b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="text-white font-black uppercase tracking-tight">Oylik foyda hisoboti</div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Har bir xodim ishxonaga qancha foyda opkelgani</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        {/* Oy tanlash */}
        <div className="px-6 py-3 border-b border-[#16202b] shrink-0 flex items-center gap-3">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Oy:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 12,
              color: 'var(--text)',
              outline: 'none',
            }}
          />
        </div>

        {/* Jadval */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {rows.length === 0 ? (
            <div className="text-slate-500 text-center py-16 text-[13px]">Xodimlar topilmadi</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Xodim</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Buyurtmalar</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Opkelgan foyda</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const bm = bolimMeta(normalizeBolim(r.bolim));
                  return (
                    <tr key={r.id} style={{ transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={tdStyle}>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold uppercase">{r.ism}</span>
                          <span
                            className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest"
                            style={{ background: bm.color + '22', color: bm.color, borderColor: bm.color + '44' }}
                          >
                            {bm.emoji} {bm.label}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>{r.orders} ta</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: r.profit > 0 ? '#34d399' : '#64748b', fontWeight: 700 }}>
                        {r.profit.toLocaleString()} UZS
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#16202b] flex items-center justify-between shrink-0 bg-[#0b1420]">
          <div className="text-[12px] text-slate-500 font-bold">
            Jami: <span className="text-emerald-400 font-black">{jamiFoyda.toLocaleString()} UZS</span>
          </div>
          <button onClick={onClose} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black text-[12px] uppercase tracking-widest transition-all">
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
