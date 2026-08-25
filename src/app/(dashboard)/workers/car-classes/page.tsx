'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Car, Check, Trash2, AlertCircle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

// Mashina klassi koeffitsienti — qimmat avtomobil va elektromobil ishi
// odatdagidan uzoqroq. Yakuniy norma = bazaviy norma x koeffitsient.

interface ClassRow {
  id: number;
  brand_norm: string;
  car_model_norm: string | null;
  brand_asl: string | null;
  car_model_asl: string | null;
  klass: string;
  koeffitsient: number;
  izoh: string | null;
}

interface MissingRow {
  brand_norm: string;
  brand_asl: string;
  marta: number;
}

const KLASS_RANG: Record<string, string> = {
  oddiy: '#64748b',
  orta: '#3b82f6',
  elektro: '#10b981',
  premium: '#f59e0b',
};

const KLASS_NOM: Record<string, string> = {
  oddiy: 'Oddiy',
  orta: "O'rta",
  elektro: 'Elektromobil',
  premium: 'Premium',
};

const S = {
  input: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    color: 'var(--text)',
    outline: 'none',
  } as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text3)',
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
  },
  td: {
    padding: '10px 12px',
    fontSize: 12,
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
  } as React.CSSProperties,
};

export default function CarClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [missing, setMissing] = useState<MissingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/car-classes?t=${Date.now()}`);
      const j = await res.json();
      if (j.ok) {
        setClasses(j.classes || []);
        setMissing(j.klasssiz || []);
      } else toast.error(j.error || 'Yuklashda xatolik');
    } catch {
      toast.error('Yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (row: ClassRow, koef: string) => {
    const n = Number(koef);
    if (!Number.isFinite(n) || n <= 0 || n > 5) {
      toast.error('Koeffitsient 0 dan 5 gacha bo\'lsin');
      return;
    }
    setSaving(row.id);
    try {
      const res = await fetch('/api/car-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_asl: row.brand_asl || row.brand_norm,
          car_model_asl: row.car_model_asl,
          klass: row.klass,
          koeffitsient: n,
        }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      toast.success(`${row.brand_asl} — ×${n}`);
      setDraft((d) => { const c = { ...d }; delete c[row.id]; return c; });
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Saqlashda xatolik');
    } finally {
      setSaving(null);
    }
  };

  const addMissing = async (m: MissingRow, klass: string, koef: number) => {
    try {
      const res = await fetch('/api/car-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_asl: m.brand_asl, klass, koeffitsient: koef }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      toast.success(`${m.brand_asl} qo'shildi`);
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Saqlashda xatolik');
    }
  };

  const remove = async (id: number) => {
    try {
      const res = await fetch(`/api/car-classes?id=${id}`, { method: 'DELETE' });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      toast.success('O\'chirildi');
      await load();
    } catch (e: any) {
      toast.error(e.message || 'O\'chirishda xatolik');
    }
  };

  const markalar = classes.filter((c) => !c.car_model_norm);
  const modellar = classes.filter((c) => c.car_model_norm);

  const jadval = (rows: ClassRow[], modelUstuni: boolean) => (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={S.th}>Marka</th>
            {modelUstuni && <th style={S.th}>Model</th>}
            <th style={S.th}>Klass</th>
            <th style={{ ...S.th, width: 150 }}>Koeffitsient</th>
            <th style={{ ...S.th, width: 190 }}>Misol: 1 soatlik ish</th>
            <th style={{ ...S.th, width: 50 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const value = draft[c.id] ?? String(c.koeffitsient);
            const changed = draft[c.id] != null && Number(draft[c.id]) !== Number(c.koeffitsient);
            return (
              <tr key={c.id}>
                <td style={{ ...S.td, fontWeight: 600 }}>{c.brand_asl || c.brand_norm}</td>
                {modelUstuni && <td style={S.td}>{c.car_model_asl || '—'}</td>}
                <td style={S.td}>
                  <span style={{
                    background: (KLASS_RANG[c.klass] || '#64748b') + '22',
                    color: KLASS_RANG[c.klass] || '#64748b',
                    padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  }}>
                    {KLASS_NOM[c.klass] || c.klass}
                  </span>
                </td>
                <td style={S.td}>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: 'var(--text3)' }}>×</span>
                    <input
                      style={{ ...S.input, width: 70 }}
                      type="number" step="0.05" min="0.1" max="5"
                      value={value}
                      onChange={(e) => setDraft((d) => ({ ...d, [c.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') save(c, value); }}
                    />
                    {changed && (
                      <button
                        onClick={() => save(c, value)}
                        disabled={saving === c.id}
                        title="Saqlash"
                        style={{ background: '#059669', border: 'none', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', display: 'flex' }}
                      >
                        <Check size={13} color="#fff" />
                      </button>
                    )}
                  </div>
                </td>
                <td style={{ ...S.td, color: 'var(--text2)' }}>
                  60 daq → <b>{Math.round(60 * Number(value || c.koeffitsient))} daq</b>
                </td>
                <td style={S.td}>
                  <button
                    onClick={() => remove(c.id)}
                    title="O'chirish"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
                  >
                    <Trash2 size={14} color="#f87171" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <PageLayout
      title="Mashina klasslari"
      subtitle="Qimmat avtomobil va elektromobil ishi uzoqroq — norma shu koeffitsientga ko'paytiriladi"
    >
      <div style={{ padding: '0 40px 40px' }}>
        <div
          className="flex items-start gap-2.5 rounded-xl p-3.5 mb-5"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}
        >
          <AlertCircle size={16} color="#3b82f6" style={{ marginTop: 1, flexShrink: 0 }} />
          <div className="text-[12px]" style={{ color: 'var(--text2)', lineHeight: 1.6 }}>
            <b>Yakuniy norma = bazaviy norma × koeffitsient.</b> Masalan diagnostika bazaviy normasi 30 daqiqa
            bo'lsa, BYD uchun 60 daqiqa, BMW uchun 90 daqiqa bo'ladi. Model uchun alohida qator qo'shilsa,
            u markadan ustun turadi (Kia benzin ×1.50, lekin Kia EV 6 ×2.00). Ro'yxatda yo'q marka ×1.00 bilan
            baholanadi.
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text3)', fontSize: 13, padding: 40, textAlign: 'center' }}>Yuklanmoqda...</div>
        ) : (
          <>
            {jadval(markalar, false)}

            {modellar.length > 0 && (
              <div className="mt-6">
                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase' }}>
                  Model istisnolari (markadan ustun)
                </h3>
                {jadval(modellar, true)}
              </div>
            )}

            {missing.length > 0 && (
              <div className="mt-6">
                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase' }}>
                  Klasssiz markalar (hozir ×1.00)
                </h3>
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={S.th}>Marka</th>
                        <th style={{ ...S.th, textAlign: 'right', width: 110 }}>Buyurtma</th>
                        <th style={{ ...S.th, width: 330 }}>Klass belgilash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missing.map((m) => (
                        <tr key={m.brand_norm}>
                          <td style={{ ...S.td, fontWeight: 600 }}>{m.brand_asl}</td>
                          <td style={{ ...S.td, textAlign: 'right', color: 'var(--text3)' }}>{m.marta}</td>
                          <td style={S.td}>
                            <div className="flex gap-1.5 flex-wrap">
                              {([['oddiy', 1.0], ['orta', 1.5], ['elektro', 2.0], ['premium', 3.0]] as const).map(([k, v]) => (
                                <button
                                  key={k}
                                  onClick={() => addMissing(m, k, v)}
                                  style={{
                                    background: (KLASS_RANG[k] || '#64748b') + '22',
                                    color: KLASS_RANG[k],
                                    border: `1px solid ${KLASS_RANG[k]}44`,
                                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                  }}
                                >
                                  {KLASS_NOM[k]} ×{v}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
