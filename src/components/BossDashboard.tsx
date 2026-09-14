'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { computeDailyReport } from '@/lib/dailyReport';
import { isCancelledHolat } from '@/lib/stock';
import AiForecast from '@/components/AiForecast';
import { ClipboardList, Wallet, TrendingUp, TrendingDown, CreditCard, Receipt } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Boshliq uchun ixcham bosh sahifa. Oddiy Dashboard (page.tsx) o'rniga ko'rsatiladi
// (rol='boshliq' bo'lsa) — huquqi to'liq (istalgan sahifaga o'tishi mumkin), lekin
// birinchi ekranda faqat hisob-kitob, buyurtmalar va eng muhim narsalar (qarzdorlik,
// bugungi foyda, oyma-oy tahlil) ko'rinadi — mayda-chuyda boshqaruv (xizmat/mijoz/
// zapchast qo'shish, xodim CRUD) chiqarib tashlangan (bular Sidebar'da ham yashirin).
//
// Moliyaviy hisob-kitob mavjud tekshirilgan funksiyalardan olinadi (yangi formula
// yozilmagan): kunlik — computeDailyReport (dailyReport.ts, testlangan), oyma-oy
// tendensiya — AiForecast (compareMonthToDate, testlangan). Faqat qarzdorlik va
// faol buyurtmalar sanog'i shu yerda hisoblanadi (oddiy yig'indi, xatolik xavfi yo'q).
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

export default function BossDashboard() {
  const { buyurtmalar, xodimlar, ishxonaOperatsiyalar, kassa } = useStore();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const daily = useMemo(
    () => computeDailyReport(buyurtmalar, ishxonaOperatsiyalar, xodimlar, today),
    [buyurtmalar, ishxonaOperatsiyalar, xodimlar, today],
  );

  const { activeCount, qarzJami, qarzdorlar, recentOrders } = useMemo(() => {
    let qarzJami = 0;
    let activeCount = 0;
    const qarzdorlar: { id: number; ism: string; mashina: string; qarz: number }[] = [];
    for (const b of buyurtmalar) {
      // 'bekor' (bot-ui) va 'bekor qilingan' (dashboard) — ikkalasi ham bekor qilingan.
      if (isCancelledHolat(b.holat)) continue;
      if (b.holat !== 'tulangan') activeCount++;
      const qarz = (b.final || 0) - (b.paid || 0);
      if (b.holat !== 'tulangan' && qarz > 0) {
        qarzJami += qarz;
        qarzdorlar.push({ id: Number(b.id), ism: b.ism, mashina: b.mashina, qarz });
      }
    }
    qarzdorlar.sort((a, b) => b.qarz - a.qarz);
    const recentOrders = [...buyurtmalar].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 6);
    return { activeCount, qarzJami, qarzdorlar: qarzdorlar.slice(0, 6), recentOrders };
  }, [buyurtmalar]);

  const isLoss = daily.sofFoyda < 0;

  const kpis: { label: string; value: number; icon: typeof Wallet; color: string; href: string; isCount?: boolean }[] = [
    { label: 'Bugungi sof foyda', value: daily.sofFoyda, icon: isLoss ? TrendingDown : TrendingUp, color: isLoss ? 'var(--red)' : 'var(--green)', href: '/reports/daily' },
    { label: 'Kassa jami', value: kassa.naqd + kassa.karta, icon: Wallet, color: 'var(--accent)', href: '/reports/business' },
    { label: 'Faol buyurtmalar', value: activeCount, icon: ClipboardList, color: 'var(--cyan)', href: '/orders', isCount: true },
    { label: 'Qarzdorlik jami', value: qarzJami, icon: CreditCard, color: 'var(--orange)', href: '/orders?status=tulanmagan' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col gap-6 lg:gap-8">

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {kpis.map((k, i) => (
            <Link key={i} href={k.href} className="stat-card" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <k.icon size={18} color={k.color} />
                </div>
              </div>
              <div className="text-[10px] lg:text-[13px] font-bold text-[var(--text3)] mb-1 uppercase tracking-wider">{k.label}</div>
              <div className="text-[15px] lg:text-[22px] font-black text-white">
                {k.isCount ? k.value : fmt(k.value)}
                {!k.isCount && <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}> so&apos;m</span>}
              </div>
            </Link>
          ))}
        </div>

        {/* Bugungi hisob-kitob + oyma-oy tahlil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden p-0!">
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
              <h3 className="m-0 text-[14px] lg:text-[15px] font-extrabold text-white flex items-center gap-2">
                <Receipt size={16} color="var(--accent)" /> Bugungi hisob-kitob
              </h3>
              <Link href="/reports/daily" className="text-[11px] font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-lg no-underline transition-colors hover:bg-accent/20">
                To&apos;liq hisobot
              </Link>
            </div>
            <div style={{ padding: '10px 24px 20px' }}>
              {[
                { label: 'Xizmatlardan yalpi foyda', hint: `${daily.ordersCount} ta to'langan buyurtma`, value: daily.yalpiFoyda, sign: '+', color: '#10b981' },
                { label: 'Ishxona xarajatlari', hint: `${daily.xarajatCount} ta xarajat`, value: daily.xarajat, sign: '−', color: '#fb7185' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{r.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{r.hint}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: r.color, whiteSpace: 'nowrap' }}>{r.sign} {fmt(r.value)}</div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 4px' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Ishxona foydasi (bugun)</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: isLoss ? 'var(--red)' : 'var(--green)', whiteSpace: 'nowrap' }}>
                  {fmt(daily.ishxonaFoyda)} <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>so&apos;m</span>
                </div>
              </div>
            </div>
          </div>

          <AiForecast />
        </div>

        {/* Qarzdorlar + Oxirgi buyurtmalar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="glass-card flex flex-col overflow-hidden p-0!">
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
              <h3 className="m-0 text-[14px] font-extrabold text-white flex items-center gap-2">
                <CreditCard size={16} color="var(--orange)" /> Eng katta qarzdorlar
              </h3>
              <Link href="/orders?status=tulanmagan" className="text-[11px] font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-lg no-underline transition-colors hover:bg-accent/20">
                Hammasi
              </Link>
            </div>
            {qarzdorlar.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Qarzdorlik yo&apos;q 🎉</div>
            ) : (
              <div style={{ padding: '2px 24px' }}>
                {qarzdorlar.map((q) => (
                  <Link key={q.id} href={`/orders?ism=${encodeURIComponent(q.ism)}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{q.ism}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{q.mashina} · #{q.id}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--red)', whiteSpace: 'nowrap' }}>{fmt(q.qarz)} so&apos;m</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card flex flex-col overflow-hidden p-0!">
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
              <h3 className="m-0 text-[14px] font-extrabold text-white flex items-center gap-2">
                <ClipboardList size={16} color="var(--cyan)" /> Oxirgi buyurtmalar
              </h3>
              <Link href="/orders" className="text-[11px] font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-lg no-underline transition-colors hover:bg-accent/20">
                Hammasi
              </Link>
            </div>
            <div style={{ padding: '2px 24px' }}>
              {recentOrders.map((o) => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{o.mashina} <span className="badge-outline text-[10px]" style={{ marginLeft: 6 }}>{o.raqam}</span></div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, textTransform: 'capitalize' }}>{o.holat}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--green)', whiteSpace: 'nowrap' }}>{fmt(o.final)} so&apos;m</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
