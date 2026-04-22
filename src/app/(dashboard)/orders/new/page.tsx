'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useStore, normalize } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Wrench,
  Package,
  User,
  CheckCircle2,
  Save
} from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { normalizePhone } from '@/lib/phone';

const STATUS_TABS = [
  { key: 'yaratildi', label: 'Yaratildi', color: '#64748b' },
  { key: 'tamirlanmoqda', label: 'Tamirlanmoqda', color: '#6366f1' },
  { key: 'ehtiyot qism kutilyapti', label: 'Ehtiyot qism kutilyapti', color: '#06b6d4' },
  { key: 'tulanmagan', label: "To'lanmagan", color: '#f97316' },
  { key: 'tulangan', label: "To'langan", color: '#10b981' },
  { key: 'bekor qilingan', label: 'Bekor qilingan', color: '#f43f5e' },
];

/* ── styles ── */
const S = {
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: 6,
  } as React.CSSProperties,
  input: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  select: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: 'var(--text)',
    outline: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    overflow: 'hidden' as const,
    marginBottom: 20,
  } as React.CSSProperties,
  cardHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.02)',
  } as React.CSSProperties,
  cardBody: {
    padding: 24,
  } as React.CSSProperties,
};

export default function NewOrderPage() {
  const router = useRouter();
  const {
    mijozlar, xodimlar, xizmatlar, zapchastlar, mashinalar,
    addBuyurtma, updateMijoz, updateZapchast, addMashina
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const [form, setForm] = useState({
    ism: 'Kunlik Mijoz',
    tel: '',
    mashina: '',
    raqam: '',
    yil: '',
    vin: '',
    muammo: '',
    holat: 'yaratildi' as string,
    chegirma: 0,
    chegirmaFoiz: 0,
  });

  const [assignments, setAssignments] = useState<any[]>([
    { id: Date.now(), workerId: '', serviceId: '', customNarx: '' }
  ]);

  const [partRows, setPartRows] = useState<any[]>([
    { id: Date.now(), partId: '', qty: 1 }
  ]);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllParts, setShowAllParts] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const [isAddingMashina, setIsAddingMashina] = useState(false);
  const [newMashinaName, setNewMashinaName] = useState('');

  const handleAddMashina = () => {
    if (newMashinaName && newMashinaName.trim()) {
      const upperName = newMashinaName.trim().toUpperCase();
      if (!mashinalar.includes(upperName)) {
        addMashina(upperName);
      }
      setForm(prev => ({ ...prev, mashina: upperName }));
      setNewMashinaName('');
      setIsAddingMashina(false);
    }
  };

  if (!mounted) return null;

  // ── Helpers ─────────────────────────────────────────────────
  const formatRaqam = (val: string) => {
    const raw = val.replace(/\s/g, '').toUpperCase();
    if (raw.length <= 2) return raw;
    if (/^\d{2}[A-Z]/.test(raw)) {
      // Format: 01 A 000 AA
      let res = raw.slice(0, 2) + ' ' + raw.slice(2, 3);
      if (raw.length > 3) res += ' ' + raw.slice(3, 6);
      if (raw.length > 6) res += ' ' + raw.slice(6, 8);
      return res.trim();
    } else if (/^\d{5}/.test(raw) || /^\d{2}\s?\d{3}/.test(raw)) {
      // Format: 01 000 AAA
      let res = raw.slice(0, 2) + ' ' + raw.slice(2, 5);
      if (raw.length > 5) res += ' ' + raw.slice(5, 8);
      return res.trim();
    }
    return raw;
  };

  const getServiceNarx = (serviceId: string | number) => {
    const s = xizmatlar.find(x => String(x.id) === String(serviceId));
    return s?.narx || 0;
  };
  const getPartNarx = (partId: string | number) => {
    const p = zapchastlar.find(x => x.id === Number(partId));
    return p?.narx || 0;
  };

  // ── Calculations ─────────────────────────────────────────────
  const servicesTotal = assignments.reduce((sum, a) => {
    if (!a.serviceId) return sum;
    const base = a.customNarx ? parseFloat(a.customNarx) : getServiceNarx(a.serviceId);
    return sum + (isNaN(base) ? 0 : base);
  }, 0);

  const zarplataTotal = assignments.reduce((sum, a) => {
    if (!a.workerId || !a.serviceId) return sum;
    const worker = xodimlar.find(x => Number(x.id) === Number(a.workerId));
    const foiz = worker?.foiz || 0;
    const base = a.customNarx ? parseFloat(a.customNarx) : getServiceNarx(a.serviceId);
    return sum + (isNaN(base) ? 0 : base * foiz / 100);
  }, 0);

  const partsTotal = partRows.reduce((sum, r) => {
    if (!r.partId) return sum;
    return sum + getPartNarx(r.partId) * (r.qty || 1);
  }, 0);

  const subTotal = servicesTotal + partsTotal;
  const finalTotal = Math.max(0, subTotal - (form.chegirma || 0));
  const partsCost = partRows.reduce((sum, r) => {
    if (!r.partId) return sum;
    const p = zapchastlar.find(x => x.id === Number(r.partId));
    return sum + (p?.sebestoimost || 0) * (r.qty || 1);
  }, 0);
  const netProfit = finalTotal - zarplataTotal - partsCost;

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.ism || !form.mashina || !form.raqam) {
      alert('Ism, mashina va davlat raqamini kiriting!');
      return;
    }

    const orderServices = assignments
      .filter(a => a.workerId && a.serviceId)
      .map(a => {
        const s = xizmatlar.find(x => String(x.id) === String(a.serviceId));
        const worker = xodimlar.find(x => String(x.id) === String(a.workerId));
        const rawNarx = a.customNarx ? parseFloat(a.customNarx) : (s?.narx || 0);
        const narx = isNaN(rawNarx) ? 0 : rawNarx;
        const foiz = worker?.foiz || 0;
        return {
          ...s,
          narx,
          workerId: Number(a.workerId),
          zarplata: Math.round(narx * foiz / 100),
        };
      });

    const orderParts = partRows
      .filter(r => r.partId)
      .map(r => {
        const p = zapchastlar.find(x => String(x.id) === String(r.partId));
        return { ...p, qty: r.qty || 1 };
      });

    const newOrder = {
      ...form,
      sana: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      services: orderServices,
      zaps: orderParts,
      srv: servicesTotal,
      zap: partsTotal,
      total: subTotal,
      final: finalTotal,
      zarplata: zarplataTotal,
      pribil: netProfit,
    };

    addBuyurtma(newOrder as any);

    if (selectedClientId) {
      const mijoz = mijozlar.find(m => m.id === selectedClientId);
      if (mijoz) {
        updateMijoz(selectedClientId, {
          tashriflar: (mijoz.tashriflar || 0) + 1,
          jami: (mijoz.jami || 0) + finalTotal,
          raqam: form.raqam, mashina: form.mashina, vin: form.vin,
        });
      }
    }

    orderParts.forEach(p => {
      if (p.id) updateZapchast(p.id, { balance: (p.balance || 0) - (p.qty || 1) });
    });

    router.push('/orders');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* SECTION 1: Asosiy ma'lumotlar */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} color="var(--accent)" />
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Asosiy ma'lumotlar
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isAddingMashina ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      style={{ ...S.input, width: 180, padding: '6px 10px' }}
                      placeholder="MARKANI KIRITING..."
                      value={newMashinaName}
                      onChange={e => setNewMashinaName(e.target.value.toUpperCase())}
                      autoFocus
                    />
                    <button
                      onClick={handleAddMashina}
                      style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
                    >OK</button>
                    <button
                      onClick={() => setIsAddingMashina(false)}
                      style={{ background: 'var(--surface2)', color: 'var(--text3)', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
                    >X</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingMashina(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)',
                      border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 8,
                      padding: '6px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}
                  >
                    <Plus size={13} /> Mashina qo'shish
                  </button>
                )}
              </div>
            </div>
            <div style={{ ...S.cardBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={S.label}>Mijoz *</label>
                <select
                  style={S.select}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'retail') {
                      setSelectedClientId(null);
                      setForm({ ...form, ism: 'Kunlik Mijoz', tel: '' });
                    } else {
                      const id = parseInt(val);
                      setSelectedClientId(id || null);
                      const m = mijozlar.find(x => x.id === id);
                      if (m) setForm({ ...form, ism: m.ism, tel: normalizePhone(m.tel || '') });
                    }
                  }}
                >
                  <option value="">— Mijozni tanlang —</option>
                  <option value="retail">🛍️ KUNLIK MIJOZ</option>
                  {mijozlar.map(m => <option key={m.id} value={m.id}>{m.ism}</option>)}
                </select>
              </div>

              <div>
                <label style={S.label}>Mashina *</label>
                <select
                  style={S.select}
                  value={form.mashina}
                  onChange={e => {
                    const newMashina = e.target.value;
                    setForm({ ...form, mashina: newMashina });
                    // Reset service IDs if they don't belong to the new car
                    setAssignments(prev => prev.map(a => {
                      const s = xizmatlar.find(x => x.id === Number(a.serviceId));
                      if (s && s.mashina !== 'UMUMIY' && s.mashina !== newMashina) {
                        return { ...a, serviceId: '', customNarx: '' };
                      }
                      return a;
                    }));
                  }}
                >
                  <option value="">— Mashinani tanlang —</option>
                  {mashinalar.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label style={S.label}>Probeg (KM)</label>
                <input
                  style={S.input} type="number" value={form.yil} placeholder="0"
                  onChange={e => setForm({ ...form, yil: e.target.value })}
                />
              </div>

              <div>
                <label style={S.label}>Telefon raqami</label>
                <PhoneInput
                  style={S.input}
                  value={form.tel}
                  onChange={(v) => setForm({ ...form, tel: v })}
                  placeholder="+998"
                />
              </div>

              <div>
                <label style={S.label}>Davlat raqami *</label>
                <input
                  style={{ ...S.input, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  type="text" 
                  value={form.raqam} 
                  placeholder="01 A 000 AA"
                  onChange={e => setForm({ ...form, raqam: formatRaqam(e.target.value) })}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>VIN kod</label>
                <input
                  style={{ ...S.input, fontFamily: 'monospace', letterSpacing: '0.1em' }}
                  type="text" value={form.vin} placeholder="VIN NOMER"
                  onChange={e => setForm({ ...form, vin: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Muammo tavsifi</label>
                <textarea
                  style={{ ...S.input, minHeight: 90, resize: 'none' } as React.CSSProperties}
                  value={form.muammo} placeholder="Muammoni batafsil yozing..."
                  onChange={e => setForm({ ...form, muammo: e.target.value })}
                />
              </div>
            </div>

            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 8 }}>
              {STATUS_TABS.map(tab => {
                const active = form.holat === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setForm({ ...form, holat: tab.key })}
                    style={{
                      flex: 1, padding: '9px 4px', borderRadius: 8, border: 'none',
                      cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      background: active ? tab.color : 'var(--surface2)',
                      color: active ? 'white' : 'var(--text3)',
                      transition: 'all 0.2s',
                      boxShadow: active ? `0 4px 12px ${tab.color}40` : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Ustalar va xizmatlar */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={16} color="#06b6d4" />
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Ustalar va xizmatlar
                </span>
              </div>
              <button
                onClick={() => {
                  const lastWorkerId = assignments[assignments.length - 1]?.workerId || '';
                  setAssignments([...assignments, { id: Date.now(), workerId: lastWorkerId, serviceId: '', customNarx: '' }]);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(6,182,212,0.1)', color: '#06b6d4',
                  border: '1px solid rgba(6,182,212,0.25)', borderRadius: 8,
                  padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Plus size={13} /> Usta/Xizmat qo'shish
              </button>
            </div>
            <div style={S.cardBody}>
              {assignments.map((a, idx) => {
                const worker = xodimlar.find(x => x.id === Number(a.workerId));
                const service = xizmatlar.find(x => x.id === Number(a.serviceId));
                const narx = a.customNarx ? parseFloat(a.customNarx) : (service?.narx || 0);
                const earned = Math.round(narx * (worker?.foiz || 0) / 100);

                return (
                  <div key={a.id} style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 10, marginBottom: 12, overflow: 'hidden',
                  }}>
                    <div style={{
                      padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...S.label, marginBottom: 4 }}>Usta *</label>
                        <select
                          style={{ ...S.select, background: 'var(--surface3)' }}
                          value={a.workerId}
                          onChange={e => setAssignments(assignments.map(x => x.id === a.id ? { ...x, workerId: e.target.value } : x))}
                        >
                          <option value="">— Ustani tanlang —</option>
                          {xodimlar.map(x => <option key={x.id} value={x.id}>{x.ism} ({x.foiz}%)</option>)}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <label style={{ ...S.label, marginBottom: 0 }}>Xizmat *</label>
                          <label style={{ fontSize: 10, color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <input type="checkbox" checked={showAllServices} onChange={e => setShowAllServices(e.target.checked)} />
                            Barchasi
                          </label>
                        </div>
                        <select
                          style={{ ...S.select, background: 'var(--surface3)' }}
                          value={a.serviceId}
                          onChange={e => {
                            const sId = e.target.value;
                            const sObj = xizmatlar.find(x => String(x.id) === String(sId));
                            setAssignments(assignments.map(x => x.id === a.id ? { ...x, serviceId: sId, customNarx: sObj ? sObj.narx.toString() : '' } : x));
                          }}
                        >
                          <option value="">— Xizmatni tanlang —</option>
                          {xizmatlar
                            .filter(s => {
                              if (showAllServices || !form.mashina) return true;
                              const car = normalize(form.mashina);
                              const serviceCar = normalize(s.mashina || 'UMUMIY');
                              
                              if (serviceCar === 'UMUMIY') return true;
                              if (car === serviceCar) return true;
                              if (car.includes(serviceCar)) return true;
                              if (serviceCar.includes(car)) return true;
                              
                              return false;
                            })
                            .map(s => (
                              <option key={s.id} value={s.id}>{s.nom} — {s.narx.toLocaleString()} so'm</option>
                            ))}
                        </select>
                      </div>
                      <div style={{ minWidth: 120 }}>
                        <label style={{ ...S.label, marginBottom: 4 }}>Narxi</label>
                        <input
                          style={{ ...S.input, background: 'var(--surface3)', textAlign: 'right', fontWeight: 700 }}
                          type="number"
                          value={a.customNarx || (a.serviceId ? getServiceNarx(a.serviceId) : '')}
                          placeholder="0"
                          onChange={e => setAssignments(assignments.map(x => x.id === a.id ? { ...x, customNarx: e.target.value } : x))}
                        />
                      </div>
                      <button
                        onClick={() => setAssignments(assignments.filter(x => x.id !== a.id))}
                        style={{ padding: 8, background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 20 }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {a.workerId && a.serviceId && (
                      <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text3)' }}>
                          {worker?.ism} — {worker?.foiz}% stavka
                        </span>
                        <span style={{ color: 'var(--text)', fontWeight: 700 }}>
                          Maosh: <span style={{ color: '#10b981' }}>{earned.toLocaleString()} so'm</span>
                          &nbsp;&nbsp;| Xizmat: <span style={{ color: '#06b6d4' }}>{narx.toLocaleString()} so'm</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => {
                  const lastWorkerId = assignments[assignments.length - 1]?.workerId || '';
                  setAssignments([...assignments, { id: Date.now(), workerId: lastWorkerId, serviceId: '', customNarx: '' }]);
                }}
                style={{
                  width: '100%', padding: '10px 0', marginTop: 4,
                  border: '1px dashed var(--border)', borderRadius: 10,
                  background: 'transparent', color: 'var(--text3)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Plus size={13} /> Xizmat qo'shish
              </button>

              <div style={{
                marginTop: 16, padding: '12px 16px',
                background: 'var(--surface2)', borderRadius: 10,
                display: 'flex', justifyContent: 'space-between', fontSize: 13,
              }}>
                <span style={{ color: 'var(--text3)' }}>Ustalar maoshi:</span>
                <span style={{ fontWeight: 700, color: '#f43f5e' }}>{Math.round(zarplataTotal).toLocaleString()} so'm</span>
                <span style={{ color: 'var(--text3)' }}>Xizmatlar summasi:</span>
                <span style={{ fontWeight: 700, color: '#06b6d4' }}>{servicesTotal.toLocaleString()} so'm</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Zapchastlar */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={16} color="#10b981" />
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Zapchastlar
                </span>
              </div>
              <button
                onClick={() => setPartRows([...partRows, { id: Date.now(), partId: '', qty: 1 }])}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(16,185,129,0.1)', color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8,
                  padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Plus size={13} /> Zapchast qo'shish
              </button>
            </div>
            <div style={S.cardBody}>
              {partRows.map((row, idx) => (
                <div key={row.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                  gap: 12, alignItems: 'end', marginBottom: 12,
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      {idx === 0 && <label style={{ ...S.label, marginBottom: 0 }}>Zapchast</label>}
                      {idx === 0 && (
                        <label style={{ fontSize: 10, color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input type="checkbox" checked={showAllParts} onChange={e => setShowAllParts(e.target.checked)} />
                          Barchasi
                        </label>
                      )}
                    </div>
                    <select
                      style={S.select}
                      value={row.partId}
                      onChange={e => setPartRows(partRows.map(x => x.id === row.id ? { ...x, partId: e.target.value } : x))}
                    >
                      <option value="">— Zapchast tanlang —</option>
                      {zapchastlar
                        .filter(p => {
                          if (showAllParts || !form.mashina) return true;
                          const car = normalize(form.mashina);
                          const partCar = normalize(p.mashina || 'UMUMIY');
                          
                          if (partCar === 'UMUMIY') return true;
                          if (car === partCar) return true;
                          if (car.includes(partCar)) return true;
                          if (partCar.includes(car)) return true;
                          
                          return false;
                        })
                        .map(p => (
                          <option key={p.id} value={p.id}>{p.nom} (balans: {p.balance ?? '?'})</option>
                        ))}
                    </select>
                  </div>

                  <div style={{ minWidth: 120 }}>
                    {idx === 0 && <label style={S.label}>Narxi</label>}
                    <div style={{
                      ...S.input, display: 'flex', alignItems: 'center',
                      justifyContent: 'flex-end', color: '#10b981', fontWeight: 700,
                      background: 'var(--surface2)',
                    }}>
                      {row.partId ? Number(zapchastlar.find(z => Number(z.id) === Number(row.partId))?.narx || 0).toLocaleString() : '0'} so'm
                    </div>
                  </div>

                  <div style={{ minWidth: 100 }}>
                    {idx === 0 && <label style={S.label}>Miqdori</label>}
                    <input
                      style={{ ...S.input, textAlign: 'center', fontWeight: 700 }}
                      type="number" min={1} value={row.qty}
                      onChange={e => setPartRows(partRows.map(x => x.id === row.id ? { ...x, qty: Math.max(1, parseInt(e.target.value) || 1) } : x))}
                    />
                  </div>

                  <div>
                    {idx === 0 && <div style={{ height: 23 }} />}
                    <button
                      onClick={() => setPartRows(partRows.filter(x => x.id !== row.id))}
                      style={{ padding: '10px 12px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setPartRows([...partRows, { id: Date.now(), partId: '', qty: 1 }])}
                style={{
                  width: '100%', padding: '10px 0', marginTop: 8,
                  border: '1px dashed var(--border)', borderRadius: 10,
                  background: 'transparent', color: 'var(--text3)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Plus size={13} /> Zapchast qo'shish
              </button>
            </div>
          </div>

          {/* SECTION 4: Yakun summasi */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Yakuniy summa
              </span>
            </div>
            <div style={S.cardBody}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Xizmatlar summasi', val: servicesTotal, color: '#06b6d4' },
                  { label: 'Zapchastlar summasi', val: partsTotal, color: '#10b981' },
                  { label: 'Ustalar maoshi', val: Math.round(zarplataTotal), color: '#f43f5e' },
                  { label: 'Chegirma', val: form.chegirma || 0, color: '#f97316' },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '14px 16px',
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>{item.label}:</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>
                      {item.val.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text3)' }}>so'm</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={S.label}>Chegirma foizda</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...S.input, paddingRight: 36 }}
                      type="number" min={0} max={100} value={form.chegirmaFoiz}
                      onChange={e => {
                        const p = parseInt(e.target.value) || 0;
                        setForm({ ...form, chegirmaFoiz: p, chegirma: Math.round(subTotal * p / 100) });
                      }}
                    />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#f97316', fontWeight: 700 }}>%</span>
                  </div>
                </div>
                <div>
                  <label style={S.label}>Chegirma summada</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...S.input, paddingRight: 46 }}
                      type="number" min={0} value={form.chegirma}
                      onChange={e => {
                        const s = parseInt(e.target.value) || 0;
                        setForm({ ...form, chegirma: s, chegirmaFoiz: subTotal > 0 ? Math.round(s / subTotal * 100) : 0 });
                      }}
                    />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontWeight: 600, fontSize: 12 }}>so'm</span>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, var(--surface2), var(--surface3))',
                border: '1px solid var(--border)', borderRadius: 12,
                padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text2)' }}>Umumiy summa:</span>
                <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em' }}>
                  {finalTotal.toLocaleString()} <span style={{ fontSize: 16, fontWeight: 500 }}>so'm</span>
                </span>
              </div>

              <button
                onClick={handleSave}
                style={{
                  width: '100%', marginTop: 16, padding: '14px 0',
                  background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none',
                  borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 10px 25px -5px rgba(16,185,129,0.3)',
                }}
              >
                <CheckCircle2 size={18} /> Buyurtmani saqlash
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
