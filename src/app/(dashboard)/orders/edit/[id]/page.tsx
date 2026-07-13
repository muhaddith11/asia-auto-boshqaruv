'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useMemo, use } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Wrench,
  Package,
  User,
  CheckCircle2,
  Save,
  ArrowLeft
} from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { normalizePhone } from '@/lib/phone';
import { normalize } from '@/store/useStore';

const STATUS_TABS = [
  { key: 'yaratildi', label: 'Yaratildi', color: '#64748b' },
  { key: 'tamirlanmoqda', label: 'Tamirlanmoqda', color: '#6366f1' },
  { key: 'ehtiyot qism kutilyapti', label: 'Ehtiyot qism kutilyapti', color: '#06b6d4' },
  { key: 'tulanmagan', label: "To'lanmagan", color: '#f97316' },
  { key: 'tulangan', label: "To'langan", color: '#10b981' },
  { key: 'bekor qilingan', label: 'Bekor qilingan', color: '#f43f5e' },
];

const S = {
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 },
  input: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s' },
  select: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text)', outline: 'none', cursor: 'pointer' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' as const, marginBottom: 20 },
  cardHeader: { padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' },
  cardBody: { padding: 24 },
};

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = Number(resolvedParams.id);
  const router = useRouter();
  const {
    buyurtmalar, mijozlar, xodimlar, xizmatlar, zapchastlar, mashinalar,
    updateBuyurtma, updateMijoz, addMashina, loadInitialData
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [partRows, setPartRows] = useState<any[]>([]);
  const [mijozSearch, setMijozSearch] = useState('');
  const [showMijozList, setShowMijozList] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    // form !== null bo'lsa — foydalanuvchi tahrirlayapti, qayta yozma!
    if (form !== null) return;
    const order = buyurtmalar.find(b => b.id === orderId);
    if (!order || xizmatlar.length === 0) return;

    if (order) {
      setForm({
        ism: order.ism,
        tel: normalizePhone(order.tel || ''),
        mashina: order.mashina,
        raqam: order.raqam,
        yil: order.yil || '',
        vin: order.vin || '',
        muammo: order.muammo || '',
        holat: order.holat,
        chegirma: order.chegirma || 0,
        subTotal: order.total || 0
      });

      // Load assignments from services
      // Match service: 1) by ID, 2) by name+car, 3) by name only (fallback)
      const orderCarNorm = normalize(order.mashina || '');
      setAssignments(order.services.map((s, idx) => {
        const sName = s.nom || s.name || '';
        // 1. Exact ID match
        let catalogService = s.id ? xizmatlar.find(x => String(x.id) === String(s.id)) : null;
        if (!catalogService && sName) {
          // 2. Name + car model match (prefer same car or UMUMIY)
          catalogService = xizmatlar.find(x => {
            if (x.nom !== sName) return false;
            const xCar = normalize(x.mashina || 'UMUMIY');
            return xCar === 'UMUMIY' || xCar === orderCarNorm || orderCarNorm.includes(xCar) || xCar.includes(orderCarNorm);
          });
          // 3. Name-only fallback
          if (!catalogService) catalogService = xizmatlar.find(x => x.nom === sName);
        }
        return {
          id: idx,
          workerId: s.workerId?.toString() || '',
          serviceId: catalogService?.id?.toString() || '',
          customNom: catalogService ? '' : sName,
          customNarx: s.narx?.toString() || s.price?.toString() || ''
        };
      }));

      // Load parts
      setPartRows(order.zaps.map((z, idx) => {
        const catalogPart = zapchastlar.find(x => String(x.id) === String(z.id) || x.nom === (z.nom || z.name));
        return {
          id: idx,
          partId: catalogPart?.id?.toString() || '',
          customNom: catalogPart ? '' : (z.nom || z.name),
          customNarx: z.narx?.toString() || z.price?.toString() || '',
          qty: Number(z.qty || z.quantity || 1),
          // Kassaga tushadimi — default false (belgilanmagan)
          kassaga: z.kassaga === true
        };
      }));
    }
  }, [orderId, form, buyurtmalar, xizmatlar, zapchastlar]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter services by selected car — must be BEFORE early return (Rules of Hooks)
  const filteredXizmatlar = useMemo(() => {
    const selectedCar = normalize(form?.mashina || '');
    return xizmatlar.filter(s => {
      const serviceCar = normalize(s.mashina || 'UMUMIY');
      if (serviceCar === 'UMUMIY') return true;
      if (!selectedCar) return true;
      if (serviceCar === selectedCar) return true;
      if (selectedCar.includes(serviceCar)) return true;
      if (serviceCar.includes(selectedCar)) return true;
      return false;
    });
  }, [xizmatlar, form?.mashina]);

  if (!mounted || !form) return null;

  // ── Helpers ─────────────────────────────────────────────────
  const formatRaqam = (val: string) => {
    let raw = val.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8);
    if (raw.length <= 2) return raw;
    if (/^\d{2}[A-Z]/.test(raw)) {
      let res = raw.slice(0, 2) + ' ' + raw.slice(2, 3);
      if (raw.length > 3) res += ' ' + raw.slice(3, 6);
      if (raw.length > 6) res += ' ' + raw.slice(6, 8);
      return res.trim();
    } else if (/^\d{5}/.test(raw)) {
      let res = raw.slice(0, 2) + ' ' + raw.slice(2, 5);
      if (raw.length > 5) res += ' ' + raw.slice(5, 8);
      return res.trim();
    }
    if (/^\d{3,}/.test(raw)) {
      return raw.slice(0, 2) + ' ' + raw.slice(2, 5) + (raw.length > 5 ? ' ' + raw.slice(5, 8) : '');
    }
    return raw;
  };

  const getServiceNarx = (serviceId: string | number) => xizmatlar.find(x => String(x.id) === String(serviceId))?.narx || 0;
  const getPartNarx = (partId: string | number) => zapchastlar.find(x => String(x.id) === String(partId))?.narx || 0;

  // ── Calculations ─────────────────────────────────────────────
  const servicesTotal = assignments.reduce((sum, a) => {
    if (!a.serviceId && !a.customNom) return sum;
    const base = a.customNarx ? parseFloat(a.customNarx) : getServiceNarx(a.serviceId);
    return sum + (isNaN(base) ? 0 : base);
  }, 0);

  const zarplataTotal = assignments.reduce((sum, a) => {
    if (!a.workerId || (!a.serviceId && !a.customNom)) return sum;
    const worker = xodimlar.find(x => String(x.id) === String(a.workerId));
    const foiz = worker?.foiz || 0;
    const baseRaw = a.customNarx ? parseFloat(a.customNarx) : getServiceNarx(a.serviceId);
    const base = isNaN(baseRaw) ? 0 : baseRaw;
    return sum + (base * foiz / 100);
  }, 0);

  // Chegirma usta ulushiga ham proporsional ta'sir qiladi
  // Misol: 1mln xizmat, 500k chegirma → usta 500k dan hisoblaydi (50% kamayadi)
  const chegirmaRatio = servicesTotal > 0
    ? Math.max(0, servicesTotal - (form.chegirma || 0)) / servicesTotal
    : 1;
  const zarplataAdjusted = Math.round(zarplataTotal * chegirmaRatio);

  const partsTotal = partRows.reduce((sum, r) => {
    if (!r.partId && !r.customNom) return sum;
    const base = r.customNarx ? parseFloat(r.customNarx) : getPartNarx(r.partId);
    const narx = isNaN(base) ? 0 : base;
    return sum + narx * (r.qty || 1);
  }, 0);

  const subTotal = servicesTotal + partsTotal;
  const finalTotal = Math.max(0, subTotal - (form.chegirma || 0));

  const handleUpdate = () => {
    const updatedServices = assignments
      .filter(a => a.workerId && (a.serviceId || a.customNom))
      .map(a => {
        const s = xizmatlar.find(x => String(x.id) === String(a.serviceId));
        const worker = xodimlar.find(x => String(x.id) === String(a.workerId));
        const rawNarx = a.customNarx ? parseFloat(a.customNarx) : (s?.narx || 0);
        const narx = isNaN(rawNarx) ? 0 : rawNarx;
        const foiz = worker?.foiz || 0;
        return {
          id: s?.id || null,
          nom: s?.nom || a.customNom,
          narx,
          workerId: Number(a.workerId),
          zarplata: Math.round(narx * foiz / 100),
        };
      });

    const updatedParts = partRows
      .filter(r => r.partId || r.customNom)
      .map(r => {
        const p = zapchastlar.find(x => String(x.id) === String(r.partId));
        const rawNarx = r.customNarx ? parseFloat(r.customNarx) : (p?.narx || 0);
        const narx = isNaN(rawNarx) ? 0 : rawNarx;
        return {
          id: p?.id || null,
          nom: p?.nom || r.customNom,
          narx: narx,
          qty: r.qty || 1,
          kassaga: r.kassaga === true
        };
      });

    updateBuyurtma(orderId, {
      ...form,
      services: updatedServices,
      zaps: updatedParts,
      srv: servicesTotal,
      zap: partsTotal,
      total: subTotal,
      final: finalTotal,
      zarplata: zarplataAdjusted,
      // pribil = chegirmadan keyingi xizmat summasi − ustalar maoshi
      pribil: Math.max(0, servicesTotal - (form.chegirma || 0) - zarplataAdjusted)
    });

    router.push('/orders');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[16px] font-black text-white uppercase tracking-tight">Buyurtmani Tahrirlash #{orderId}</h1>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{form.ism} | {form.mashina}</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* SECTION 1: Asosiy ma'lumotlar */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} color="var(--accent)" />
                <span className="text-[12px] font-black text-white uppercase tracking-wider">Mijoz va Mashina</span>
              </div>
            </div>
            <div style={{ ...S.cardBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* ── Mijoz tanlash ── */}
              <div style={{ position: 'relative' }}>
                <label style={S.label}>Ism Familiya *</label>
                <input
                  style={S.input}
                  value={showMijozList ? mijozSearch : form.ism}
                  placeholder="Mijozni qidiring yoki tanlang..."
                  onFocus={() => { setShowMijozList(true); setMijozSearch(''); }}
                  onBlur={() => setTimeout(() => setShowMijozList(false), 150)}
                  onChange={e => {
                    setMijozSearch(e.target.value);
                    setForm({ ...form, ism: e.target.value });
                  }}
                />
                {showMijozList && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, marginTop: 4, maxHeight: 220, overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}>
                    {mijozlar
                      .filter(m => !mijozSearch || m.ism.toLowerCase().includes(mijozSearch.toLowerCase()))
                      .slice(0, 30)
                      .map(m => (
                        <div
                          key={m.id}
                          onMouseDown={() => {
                            setForm({ ...form, ism: m.ism, tel: m.tel || form.tel });
                            setMijozSearch('');
                            setShowMijozList(false);
                          }}
                          style={{
                            padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                            borderBottom: '1px solid var(--border)',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{m.ism}</span>
                          {m.tel && <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>{m.tel}</span>}
                        </div>
                      ))}
                    {mijozlar.filter(m => !mijozSearch || m.ism.toLowerCase().includes(mijozSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text3)' }}>Mijoz topilmadi</div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label style={S.label}>Mashina *</label>
                <select style={S.select} value={form.mashina} onChange={e => setForm({ ...form, mashina: e.target.value })}>
                  {/* Always include the order's current car even if not in mashinalar list */}
                  {form.mashina && !mashinalar.includes(form.mashina) && (
                    <option value={form.mashina}>{form.mashina}</option>
                  )}
                  {mashinalar.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Telefon</label>
                <PhoneInput style={S.input} value={form.tel} onChange={(v) => setForm({ ...form, tel: v })} />
              </div>
              <div>
                <label style={S.label}>Davlat Raqami</label>
                <input
                  style={S.input}
                  value={form.raqam}
                  placeholder="01 A 000 AA"
                  onChange={e => setForm({ ...form, raqam: formatRaqam(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 8 }}>
              {STATUS_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setForm({ ...form, holat: tab.key })}
                  style={{
                    flex: 1, padding: '9px 4px', borderRadius: 8, border: 'none',
                    cursor: 'pointer', fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                    background: form.holat === tab.key ? tab.color : 'var(--surface2)',
                    color: form.holat === tab.key ? 'white' : 'var(--text3)',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: Xizmatlar */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={16} color="#6366f1" />
                <span className="text-[12px] font-black text-white uppercase tracking-wider">Xizmatlar</span>
              </div>
              <button onClick={() => setAssignments([...assignments, { id: Date.now(), workerId: '', serviceId: '', customNarx: '' }])} className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300">
                + Xizmat qo'shish
              </button>
            </div>
            <div style={S.cardBody}>
              {assignments.map((a, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 mb-4 grid grid-cols-[1fr_1fr_120px_40px] gap-4 items-end">
                  <div>
                    <label style={S.label}>Usta</label>
                    <select style={S.select} value={a.workerId} onChange={e => setAssignments(assignments.map(x => x.id === a.id ? { ...x, workerId: e.target.value } : x))}>
                      <option value="">— Tanlang —</option>
                      {xodimlar.map(x => <option key={x.id} value={x.id}>{x.ism}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Xizmat</label>
                    <select style={S.select} value={a.serviceId} onChange={e => {
                      const sId = e.target.value;
                      const s = xizmatlar.find(x => String(x.id) === String(sId));
                      setAssignments(assignments.map(x => x.id === a.id ? { ...x, serviceId: sId, customNom: '', customNarx: s?.narx?.toString() || '' } : x));
                    }}>
                      <option value="">{a.customNom ? `[Maxsus] ${a.customNom}` : '— Tanlang —'}</option>
                      {/* Always show the currently assigned service even if filtered out */}
                      {a.serviceId && !filteredXizmatlar.some(s => String(s.id) === String(a.serviceId)) && (() => {
                        const cur = xizmatlar.find(x => String(x.id) === String(a.serviceId));
                        return cur ? <option key={`cur-${cur.id}`} value={cur.id}>{cur.nom} — {cur.narx.toLocaleString()} so'm</option> : null;
                      })()}
                      {filteredXizmatlar.map(s => (
                        <option key={s.id} value={s.id}>{s.nom} — {s.narx.toLocaleString()} so'm</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Narx</label>
                    <input style={S.input} type="number" value={a.customNarx || getServiceNarx(a.serviceId) || ''} onChange={e => setAssignments(assignments.map(x => x.id === a.id ? { ...x, customNarx: e.target.value } : x))} />
                  </div>
                  <button onClick={() => setAssignments(assignments.filter(x => x.id !== a.id))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Zapchastlar */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={16} color="#10b981" />
                <span className="text-[12px] font-black text-white uppercase tracking-wider">Ehtiyot qismlar</span>
              </div>
              <button onClick={() => setPartRows([...partRows, { id: Date.now(), partId: '', qty: 1 }])} className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300">
                + Zapchast qo'shish
              </button>
            </div>
            <div style={S.cardBody}>
              {partRows.length > 0 && (
                <div className="grid grid-cols-[64px_1fr_120px_100px_40px] gap-4 mb-2 px-1">
                  <span style={S.label} title="Belgilansa — bu zapchast puli kassaga tushadi">Kassaga</span>
                  <span style={S.label}>Zapchast</span>
                  <span style={S.label} className="text-right">Summa</span>
                  <span style={S.label}>Soni</span>
                  <span></span>
                </div>
              )}
              {partRows.map((r, idx) => (
                <div key={idx} className="grid grid-cols-[64px_1fr_120px_100px_40px] gap-4 mb-4 items-center">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setPartRows(partRows.map(x => x.id === r.id ? { ...x, kassaga: !x.kassaga } : x))}
                      title={r.kassaga ? 'Kassaga tushadi (bosib olib tashlang)' : "Kassaga tushmaydi (bosib belgilang)"}
                      style={{
                        width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${r.kassaga ? '#10b981' : 'var(--border)'}`,
                        background: r.kassaga ? '#10b981' : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      {r.kassaga && <CheckCircle2 size={16} color="#fff" />}
                    </button>
                  </div>
                  <div>
                    <select style={S.select} value={r.partId} onChange={e => setPartRows(partRows.map(x => x.id === r.id ? { ...x, partId: e.target.value, customNom: '' } : x))}>
                      <option value="">{r.customNom ? `[Maxsus] ${r.customNom}` : '— Tanlang —'}</option>
                      {zapchastlar.map(p => <option key={p.id} value={p.id}>{p.nom} ({p.balance})</option>)}
                    </select>
                  </div>
                  <div className="text-[13px] font-bold text-emerald-400 py-2.5 px-4 bg-white/5 rounded-xl text-right">
                    {((r.customNarx ? parseFloat(r.customNarx) : getPartNarx(r.partId)) * r.qty).toLocaleString()} sum
                  </div>
                  <input style={S.input} type="number" value={r.qty} onChange={e => setPartRows(partRows.map(x => x.id === r.id ? { ...x, qty: parseInt(e.target.value) || 1 } : x))} />
                  <button onClick={() => setPartRows(partRows.filter(x => x.id !== r.id))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-[#1f222d] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Jami to'lov</span>
              <div className="text-[28px] font-black text-white">{finalTotal.toLocaleString()} <span className="text-[14px] text-slate-500">sum</span></div>
            </div>
            <button
              onClick={handleUpdate}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 py-4 rounded-xl text-[14px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-2"
            >
              <Save size={20} /> O'zgarishlarni saqlash
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
