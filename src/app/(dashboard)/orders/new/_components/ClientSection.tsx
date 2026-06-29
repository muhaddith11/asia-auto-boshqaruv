'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, User } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { normalizePhone } from '@/lib/phone';
import { normalize } from '@/lib/normalize';
import { Mijoz, Xizmat } from '@/types';
import { S, STATUS_TABS, OrderForm, Assignment } from './formStyles';

interface Props {
  form: OrderForm;
  setForm: React.Dispatch<React.SetStateAction<OrderForm>>;
  mijozlar: Mijoz[];
  mashinalar: string[];
  xizmatlar: Xizmat[];
  selectedClientId: number | null;
  setSelectedClientId: (id: number | null) => void;
  addMashina: (m: string) => void;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}

export default function ClientSection({
  form, setForm, mijozlar, mashinalar, xizmatlar,
  selectedClientId, setSelectedClientId, addMashina, setAssignments,
}: Props) {
  const [isAddingMashina, setIsAddingMashina] = useState(false);
  const [newCar, setNewCar] = useState({ brand: '', model: '' });

  const handleAddMashina = () => {
    if (newCar.brand.trim() && newCar.model.trim()) {
      const brand = newCar.brand.trim().toUpperCase();
      const model = newCar.model.trim().toUpperCase();
      const fullName = `${brand} ${model}`;

      if (!mashinalar.includes(fullName)) {
        addMashina(fullName);
      }
      setForm(prev => ({ ...prev, mashina: fullName }));
      setNewCar({ brand: '', model: '' });
      setIsAddingMashina(false);
    } else {
      toast.error("Brend va Modelni kiriting!");
    }
  };

  const formatRaqam = (val: string) => val.replace(/\s/g, '').toUpperCase();

  return (
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
                style={{ ...S.input, width: 130, padding: '6px 10px' }}
                placeholder="BREND (MASALAN: BMW)"
                value={newCar.brand}
                onChange={e => setNewCar({ ...newCar, brand: e.target.value.toUpperCase() })}
                autoFocus
              />
              <input
                style={{ ...S.input, width: 130, padding: '6px 10px' }}
                placeholder="MODEL (MASALAN: X5)"
                value={newCar.model}
                onChange={e => setNewCar({ ...newCar, model: e.target.value.toUpperCase() })}
              />
              <button
                onClick={handleAddMashina}
                style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
              >SAQLASH</button>
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
              const normNew = normalize(newMashina);
              setForm({ ...form, mashina: newMashina });
              // Only reset if the new mashina is fundamentally different
              setAssignments(prev => prev.map(a => {
                if (!a.serviceId) return a;
                const s = xizmatlar.find(x => String(x.id) === String(a.serviceId));
                if (!s) return a;
                const serviceCar = normalize(s.mashina || 'UMUMIY');
                if (serviceCar === 'UMUMIY') return a;

                // If the new car still "contains" the service car or vice versa, don't reset
                if (normNew.includes(serviceCar) || serviceCar.includes(normNew)) return a;

                return { ...a, serviceId: '', customNarx: '' };
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
            placeholder="01A000AA"
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
  );
}
