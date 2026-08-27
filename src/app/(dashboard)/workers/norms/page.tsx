'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Timer, Search, Trash2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

// Xizmat vaqt normalari — tezlik bali shu normaga qarab beriladi.
// Normasi yo'q xizmat umuman baholanmaydi (na bonus, na jarima).

interface NormRow {
  id: number;
  nom_norm: string;
  nom_asl: string | null;
  brand: string | null;
  car_model: string | null;
  norma_daqiqa: number;
  izoh: string | null;
}

interface ServiceRow {
  nom_norm: string;
  nom_asl: string;
  marta: number;
  norma_daqiqa: number | null;
}

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

// Daqiqani odam o'qiydigan ko'rinishga: 90 → "1 soat 30 daqiqa", 2160 → "3 ish kuni"
function humanMinutes(min: number, workHoursPerDay = 12): string {
  if (min < 60) return `${min} daqiqa`;
  const hours = min / 60;
  if (hours < workHoursPerDay) {
    const h = Math.floor(hours);
    const m = Math.round(min - h * 60);
    return m ? `${h} soat ${m} daqiqa` : `${h} soat`;
  }
  const days = hours / workHoursPerDay;
  return `≈ ${Math.round(days * 10) / 10} ish kuni (${Math.round(hours)} soat)`;
}

export default function ServiceNormsPage() {
  const [norms, setNorms] = useState<NormRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [hisoblanmoqda, setHisoblanmoqda] = useState(false);

  // Ballarni qo'lda hisoblash — Vercel cron'iga bog'liq bo'lmaslik uchun.
  const hisobla = async () => {
    if (hisoblanmoqda) return;
    setHisoblanmoqda(true);
    const t = toast.loading('Ballar hisoblanmoqda...');
    try {
      const res = await fetch('/api/points/recalculate', { method: 'POST' });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Xatolik');
      toast.success(
        `Tayyor · tezlik ${j.speedRows} ta, sifat ${j.qualityRows} ta yozuv`,
        { id: t, duration: 6000 },
      );
    } catch (e: any) {
      toast.error(e.message || 'Hisoblashda xatolik', { id: t });
    } finally {
      setHisoblanmoqda(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/service-norms?t=${Date.now()}`);
      const j = await res.json();
      if (j.ok) {
        setNorms(j.norms || []);
        setServices(j.services || []);
      } else {
        toast.error(j.error || 'Yuklashda xatolik');
      }
    } catch {
      toast.error('Yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (nomAsl: string, minutes: string, brand?: string | null, model?: string | null) => {
    const n = Number(minutes);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('Norma 0 dan katta son bo\'lishi kerak');
      return;
    }
    setSaving(nomAsl);
    try {
      const res = await fetch('/api/service-norms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_asl: nomAsl, norma_daqiqa: n, brand: brand ?? null, car_model: model ?? null }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      toast.success(`"${nomAsl}" — ${humanMinutes(n)}`);
      setDraft((d) => { const c = { ...d }; delete c[nomAsl]; return c; });
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Saqlashda xatolik');
    } finally {
      setSaving(null);
    }
  };

  const remove = async (id: number) => {
    try {
      const res = await fetch(`/api/service-norms?id=${id}`, { method: 'DELETE' });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      toast.success('O\'chirildi');
      await load();
    } catch (e: any) {
      toast.error(e.message || 'O\'chirishda xatolik');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => !q || s.nom_asl.toLowerCase().includes(q));
  }, [services, search]);

  const belgilangan = services.filter((s) => s.norma_daqiqa != null).length;
  const istisnolar = norms.filter((n) => n.brand || n.car_model);

  return (
    <PageLayout
      title="Xizmat vaqt normalari"
      subtitle="Tezlik bali shu normaga qarab beriladi — normadan erta bajarilsa bonus, oshirib yuborilsa jarima"
      headerActions={
        <button
          onClick={hisobla}
          disabled={hisoblanmoqda}
          style={{
            background: '#059669', border: 'none', borderRadius: 10,
            padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#fff',
            cursor: hisoblanmoqda ? 'default' : 'pointer', opacity: hisoblanmoqda ? 0.6 : 1,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
          title="Ballarni hoziroq qayta hisoblash (cron'ni kutmasdan)"
        >
          <RefreshCw size={14} className={hisoblanmoqda ? 'animate-spin' : ''} />
          Ballarni hozir hisobla
        </button>
      }
      filterPanel={
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 240 }}>
            <Search size={14} color="var(--text3)" />
            <input
              style={{ ...S.input, flex: 1 }}
              placeholder="Xizmat nomi bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-[12px]" style={{ color: 'var(--text3)' }}>
            <span style={{ color: '#34d399', fontWeight: 700 }}>{belgilangan}</span> ta belgilangan ·{' '}
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>{services.length - belgilangan}</span> ta normasiz
          </div>
        </div>
      }
    >
      <div style={{ padding: '0 40px 40px' }}>
        {/* Normasiz xizmat baholanmasligi haqida ogohlantirish */}
        <div
          className="flex items-start gap-2.5 rounded-xl p-3.5 mb-5"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
        >
          <AlertCircle size={16} color="#fbbf24" style={{ marginTop: 1, flexShrink: 0 }} />
          <div className="text-[12px]" style={{ color: 'var(--text2)', lineHeight: 1.6 }}>
            Bu yerga <b>sof ish vaqtini</b> yozing — mashina hovlida turgan vaqtni emas. Xodim botda
            "Ishni boshladim / To'xtatdim" tugmalari bilan o'z vaqtini o'lchaydi, ball faqat shunga qarab beriladi.
            Normasi belgilanmagan xizmat <b>umuman baholanmaydi</b> (na bonus, na jarima), vaqti o'lchanmagan
            buyurtma ham baholanmaydi. Normadan <b>30%</b> gacha oshsa hali jarima yo'q.
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text3)', fontSize: 13, padding: 40, textAlign: 'center' }}>Yuklanmoqda...</div>
        ) : (
          <>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={S.th}>Xizmat</th>
                    <th style={{ ...S.th, textAlign: 'right', width: 110 }}>Ishlatilgan</th>
                    <th style={{ ...S.th, width: 150 }}>Norma (daqiqa)</th>
                    <th style={{ ...S.th, width: 200 }}>Ko'rinishi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const value = draft[s.nom_asl] ?? (s.norma_daqiqa != null ? String(s.norma_daqiqa) : '');
                    const changed = draft[s.nom_asl] != null && Number(draft[s.nom_asl]) !== s.norma_daqiqa;
                    return (
                      <tr key={s.nom_norm}>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600 }}>{s.nom_asl}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{s.nom_norm}</div>
                        </td>
                        <td style={{ ...S.td, textAlign: 'right', color: 'var(--text3)' }}>{s.marta} marta</td>
                        <td style={S.td}>
                          <div className="flex items-center gap-1.5">
                            <input
                              style={{ ...S.input, width: 80 }}
                              type="number"
                              min={1}
                              placeholder="—"
                              value={value}
                              onChange={(e) => setDraft((d) => ({ ...d, [s.nom_asl]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === 'Enter') save(s.nom_asl, value); }}
                            />
                            {changed && (
                              <button
                                onClick={() => save(s.nom_asl, value)}
                                disabled={saving === s.nom_asl}
                                title="Saqlash"
                                style={{
                                  background: '#059669', border: 'none', borderRadius: 8,
                                  padding: '7px 9px', cursor: 'pointer', display: 'flex',
                                }}
                              >
                                <Check size={13} color="#fff" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td style={{ ...S.td, color: s.norma_daqiqa ? 'var(--text2)' : 'var(--text3)' }}>
                          {s.norma_daqiqa ? humanMinutes(s.norma_daqiqa) : 'baholanmaydi'}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td style={{ ...S.td, textAlign: 'center', color: 'var(--text3)', padding: 30 }} colSpan={4}>
                        Xizmat topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Marka/model bo'yicha istisnolar */}
            {istisnolar.length > 0 && (
              <div className="mt-6">
                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase' }}>
                  Marka/model istisnolari
                </h3>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={S.th}>Xizmat</th>
                        <th style={S.th}>Marka</th>
                        <th style={S.th}>Model</th>
                        <th style={{ ...S.th, width: 140 }}>Norma</th>
                        <th style={{ ...S.th, width: 50 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {istisnolar.map((n) => (
                        <tr key={n.id}>
                          <td style={S.td}>{n.nom_asl || n.nom_norm}</td>
                          <td style={S.td}>{n.brand || '—'}</td>
                          <td style={S.td}>{n.car_model || '—'}</td>
                          <td style={S.td}>{humanMinutes(n.norma_daqiqa)}</td>
                          <td style={S.td}>
                            <button
                              onClick={() => remove(n.id)}
                              title="O'chirish"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
                            >
                              <Trash2 size={14} color="#f87171" />
                            </button>
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
