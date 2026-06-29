'use client';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { S, OrderForm } from './formStyles';

interface Props {
  form: OrderForm;
  setForm: React.Dispatch<React.SetStateAction<OrderForm>>;
  servicesTotal: number;
  partsTotal: number;
  zarplataAdjusted: number;
  subTotal: number;
  finalTotal: number;
  onSave: () => void;
}

export default function SummarySection({
  form, setForm, servicesTotal, partsTotal, zarplataAdjusted, subTotal, finalTotal, onSave,
}: Props) {
  return (
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
            { label: 'Ustalar maoshi', val: zarplataAdjusted, color: '#f43f5e' },
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
          onClick={onSave}
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
  );
}
