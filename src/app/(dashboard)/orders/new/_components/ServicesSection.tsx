'use client';
import React from 'react';
import { Plus, Trash2, Wrench } from 'lucide-react';
import { normalize } from '@/lib/normalize';
import { Xodim, Xizmat } from '@/types';
import { S, Assignment } from './formStyles';

interface Props {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  xodimlar: Xodim[];
  xizmatlar: Xizmat[];
  mashina: string;
  zarplataAdjusted: number;
  servicesTotal: number;
}

export default function ServicesSection({
  assignments, setAssignments, xodimlar, xizmatlar, mashina, zarplataAdjusted, servicesTotal,
}: Props) {
  const getServiceNarx = (serviceId: string | number) => {
    const s = xizmatlar.find(x => String(x.id) === String(serviceId));
    return s?.narx || 0;
  };

  const addRow = () => {
    const lastWorkerId = assignments[assignments.length - 1]?.workerId || '';
    setAssignments([...assignments, { id: Date.now(), workerId: lastWorkerId, serviceId: '', customNarx: '' }]);
  };

  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wrench size={16} color="#06b6d4" />
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Ustalar va xizmatlar
          </span>
        </div>
        <button
          onClick={addRow}
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
        {assignments.map((a) => {
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
                  <label style={{ ...S.label, marginBottom: 4 }}>Xizmat *</label>
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
                        const selectedCar = normalize(mashina);
                        const serviceCar = normalize(s.mashina || 'UMUMIY');

                        if (serviceCar === 'UMUMIY') return true;
                        if (!selectedCar) return true; // Mashina tanlanmagan bo'lsa hamma xizmatni ko'rsatish

                        // Flexible matching:
                        // 1. Exact match
                        if (serviceCar === selectedCar) return true;
                        // 2. Service car is part of selected car (e.g. "CHEVROLET" matches "CHEVROLET NEXIA")
                        if (selectedCar.includes(serviceCar)) return true;
                        // 3. Selected car is part of service car (e.g. "NEXIA" matches "CHEVROLET NEXIA")
                        if (serviceCar.includes(selectedCar)) return true;

                        return false;
                      })
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nom} {s.mashina !== 'UMUMIY' ? `(${s.mashina})` : ''} — {s.narx.toLocaleString()} so'm
                        </option>
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
          onClick={addRow}
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
          <span style={{ fontWeight: 700, color: '#f43f5e' }}>{zarplataAdjusted.toLocaleString()} so'm</span>
          <span style={{ color: 'var(--text3)' }}>Xizmatlar summasi:</span>
          <span style={{ fontWeight: 700, color: '#06b6d4' }}>{servicesTotal.toLocaleString()} so'm</span>
        </div>
      </div>
    </div>
  );
}
