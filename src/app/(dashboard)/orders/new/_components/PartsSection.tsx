'use client';
import React from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { normalize } from '@/lib/normalize';
import { Zapchast } from '@/types';
import { S, PartRow } from './formStyles';

interface Props {
  partRows: PartRow[];
  setPartRows: React.Dispatch<React.SetStateAction<PartRow[]>>;
  zapchastlar: Zapchast[];
  mashina: string;
}

export default function PartsSection({ partRows, setPartRows, zapchastlar, mashina }: Props) {
  const addRow = () => setPartRows([...partRows, { id: Date.now(), partId: '', qty: 1 }]);

  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={16} color="#10b981" />
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Zapchastlar
          </span>
        </div>
        <button
          onClick={addRow}
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
              <label style={S.label}>Zapchast</label>
              <select
                style={S.select}
                value={row.partId}
                onChange={e => setPartRows(partRows.map(x => x.id === row.id ? { ...x, partId: e.target.value } : x))}
              >
                <option value="">— Zapchast tanlang —</option>
                {zapchastlar
                  .filter(p => {
                    const car = normalize(mashina);
                    const partCar = normalize(p.mashina || 'UMUMIY');
                    if (!car) return partCar === 'UMUMIY';
                    return partCar === 'UMUMIY' || partCar === car;
                  })
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nom} {p.mashina !== 'UMUMIY' ? `(${p.mashina})` : ''} (balans: {p.balance ?? '?'})
                    </option>
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
          onClick={addRow}
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
  );
}
