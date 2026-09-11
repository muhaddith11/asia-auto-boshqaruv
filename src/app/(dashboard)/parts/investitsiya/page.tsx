'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Layers, Boxes, PiggyBank, Wallet, TrendingUp, Target, Search } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { isCancelledHolat } from '@/lib/stock';

const SEL: React.CSSProperties = {
  background: '#1a1c24',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  color: 'white',
  outline: 'none',
};

export default function PartsInvestmentPage() {
  const { zapchastlar, buyurtmalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Faqat DASHBOARD orqali kiritilgan (source='site') zapchastlar — bot orqali
  // buyurtmaga qo'lda yozilgan (kataloglanmagan) nomlar bu yerda hisobga olinmaydi.
  const siteParts = zapchastlar.filter((p) => (p as unknown as { source?: string }).source === 'site');

  const stats = siteParts.map((p) => {
    let sotilganDona = 0;
    let sotilganSumma = 0;
    let sotilganTannarx = 0;

    buyurtmalar.forEach((b) => {
      // Bekor qilingan buyurtma (dashboard: "bekor qilingan", bot: "bekor") —
      // undan ishlatilgan zapchast aslida sotilmagan, hisobga qo'shilmaydi.
      if (isCancelledHolat(b.holat)) return;
      (b.zaps || []).forEach((z) => {
        if (Number(z.id) !== Number(p.id)) return;
        const qty = Number(z.qty ?? z.quantity ?? 1) || 1;
        sotilganDona += qty;
        // Narx miqdorga ko'paytirilmaydi — buyurtmaga yozilgan narx shu qator
        // uchun to'liq summa (bot-ui'dagi konventsiya bilan bir xil).
        sotilganSumma += Number(z.narx ?? 0);
        // Eski buyurtmalarda sebestoimost saqlanmagan bo'lishi mumkin —
        // shunday holatda zapchastning joriy tannarxi bilan taxminlanadi.
        sotilganTannarx += Number(z.sebestoimost ?? p.sebestoimost ?? 0);
      });
    });

    const qoldiq = Number(p.balance) || 0;
    const boshida = qoldiq + sotilganDona;
    const boshlangichTannarx = boshida * (Number(p.sebestoimost) || 0);
    const potensialSumma = boshida * (Number(p.narx) || 0);
    const potensialFoyda = potensialSumma - boshlangichTannarx;
    const sotilganFoyda = sotilganSumma - sotilganTannarx;

    return {
      ...p,
      qoldiq, sotilganDona, sotilganSumma, sotilganTannarx, sotilganFoyda,
      boshida, boshlangichTannarx, potensialSumma, potensialFoyda,
    };
  });

  const filtered = stats
    .filter((p) => p.nom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.boshida - a.boshida);

  const totals = filtered.reduce((acc, p) => ({
    boshida: acc.boshida + p.boshida,
    sotilganDona: acc.sotilganDona + p.sotilganDona,
    qoldiq: acc.qoldiq + p.qoldiq,
    boshlangichTannarx: acc.boshlangichTannarx + p.boshlangichTannarx,
    sotilganSumma: acc.sotilganSumma + p.sotilganSumma,
    sotilganFoyda: acc.sotilganFoyda + p.sotilganFoyda,
    potensialSumma: acc.potensialSumma + p.potensialSumma,
    potensialFoyda: acc.potensialFoyda + p.potensialFoyda,
  }), { boshida: 0, sotilganDona: 0, qoldiq: 0, boshlangichTannarx: 0, sotilganSumma: 0, sotilganFoyda: 0, potensialSumma: 0, potensialFoyda: 0 });

  const cards: { label: string; value: string; icon: React.ReactNode; color: string }[] = [
    { label: 'Kiritilgan (boshida, jami)', value: `${totals.boshida.toLocaleString()} dona`, icon: <Layers size={20} />, color: '#6366f1' },
    { label: 'Sotilgan', value: `${totals.sotilganDona.toLocaleString()} dona`, icon: <Boxes size={20} />, color: '#3b82f6' },
    { label: 'Qoldiq (omborda)', value: `${totals.qoldiq.toLocaleString()} dona`, icon: <PiggyBank size={20} />, color: '#f97316' },
    { label: "Boshlang'ich tannarx", value: `${totals.boshlangichTannarx.toLocaleString()} UZS`, icon: <Wallet size={20} />, color: '#f43f5e' },
    { label: 'Sotilgan summa (haqiqiy)', value: `${totals.sotilganSumma.toLocaleString()} UZS`, icon: <TrendingUp size={20} />, color: '#10b981' },
    { label: 'Sotilgan foyda (haqiqiy)', value: `${totals.sotilganFoyda.toLocaleString()} UZS`, icon: <TrendingUp size={20} />, color: '#10b981' },
    { label: 'Hammasi sotilsa — jami summa', value: `${totals.potensialSumma.toLocaleString()} UZS`, icon: <TrendingUp size={20} />, color: '#22c55e' },
    { label: 'Potensial jami foyda', value: `${totals.potensialFoyda.toLocaleString()} UZS`, icon: <Target size={20} />, color: '#3b82f6' },
  ];

  const opt: React.CSSProperties = { background: '#1a1c24', color: 'white' };

  const headers = ['Zapchast', 'Mashina', 'Boshida', 'Sotilgan', 'Qoldiq', 'Sebestoimost', 'Narx', "Boshlang'ich tannarx", 'Hammasi sotilsa', 'Potensial foyda'];

  return (
    <PageLayout title="Sarmoya va foyda tahlili" subtitle="Dashboarddan kiritilgan zapchastlar — boshidan hozirgacha to'liq hisob">

      {/* ── JAMI ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 20 }}>
        {cards.map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 8, borderRadius: 8, background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── QIDIRUV ── */}
      <div
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Zapchast nomi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...SEL, paddingLeft: 34, width: '100%' }}
          />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{filtered.length} ta zapchast turi</span>
      </div>

      {/* ── JADVAL ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {headers.map((h) => (
                  <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    className={h !== 'Zapchast' && h !== 'Mashina' ? 'text-right' : ''}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} style={{ padding: 48, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : filtered.map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>{p.nom}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginTop: 2 }}>{p.bir}</div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text3)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 5, textTransform: 'uppercase' }}>
                      {p.mashina}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 800, color: 'var(--text)' }}>{p.boshida}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 800, color: p.sotilganDona > 0 ? '#3b82f6' : 'var(--text3)' }}>{p.sotilganDona}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 800, color: p.qoldiq <= 0 ? '#f43f5e' : p.qoldiq <= 5 ? '#f97316' : 'var(--text)' }}>{p.qoldiq}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--text3)' }}>{Number(p.sebestoimost || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--text3)' }}>{Number(p.narx || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>{p.boshlangichTannarx.toLocaleString()}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>{p.potensialSumma.toLocaleString()}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 800, color: p.potensialFoyda > 0 ? '#10b981' : 'var(--text3)' }}>{p.potensialFoyda.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border)', background: 'rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 900, color: 'var(--text)' }} colSpan={2}>JAMI</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 900, color: 'var(--text)' }}>{totals.boshida.toLocaleString()}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 900, color: 'var(--text)' }}>{totals.sotilganDona.toLocaleString()}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 900, color: 'var(--text)' }}>{totals.qoldiq.toLocaleString()}</td>
                  <td colSpan={2}></td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 900, color: 'var(--text)' }}>{totals.boshlangichTannarx.toLocaleString()}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 900, color: 'var(--text)' }}>{totals.potensialSumma.toLocaleString()}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 900, color: '#10b981' }}>{totals.potensialFoyda.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
