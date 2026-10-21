'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Wifi, WifiOff, Smartphone, EyeOff, Eye, Copy, AlertCircle, Send } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { ONLINE_MS, isRandomMac, tashkentHM, type AttendanceRow, type DayView } from '@/lib/attendance';

// Davomat — xodim telefoni ishxona WiFi'iga ulanganini skaner (davomat-skaner/)
// aniqlaydi. Bu sahifada: kun holati, telefonni xodimga bog'lash, sozlamalar.

interface Device {
  mac: string;
  worker_id: number | null;
  ignored: boolean;
  label: string | null;
  ip: string | null;
  first_seen: string;
  last_seen: string;
}

interface Settings {
  work_start: string;
  report_time: string;
  notify: boolean;
  scanner_key: string;
}

interface Data {
  day: string;
  today: string;
  view: DayView;
  reportSentAt: string | null;
  scannerLast: string | null;
  devices: Device[];
  workers: { id: number; ism: string }[];
  settings: Settings;
  preview: string | null;
}

type DeviceTab = 'new' | 'linked' | 'ignored';

const S = {
  input: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 12,
    color: 'var(--text)',
    outline: 'none',
  } as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text3)',
    padding: '12px 14px',
    borderBottom: '1px solid var(--border)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '11px 14px',
    fontSize: 12,
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  card: { background: 'var(--surface)', border: '1px solid var(--border)' } as React.CSSProperties,
  h2: { fontSize: 14, fontWeight: 800, color: 'var(--text)' } as React.CSSProperties,
};

const isOnline = (iso: string | null) => !!iso && Date.now() - new Date(iso).getTime() < ONLINE_MS;

function ago(iso: string | null): string {
  if (!iso) return '—';
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'hozirgina';
  if (min < 60) return `${min} daq oldin`;
  const d = new Date(iso);
  const sameDay = new Date().toDateString() === d.toDateString();
  return sameDay
    ? tashkentHM(iso)
    : `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} ${tashkentHM(iso)}`;
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', minWidth: 110 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || 'var(--text)', marginTop: 3 }}>{value}</div>
    </div>
  );
}

function StatusCell({ r, isToday }: { r: AttendanceRow; isToday: boolean }) {
  if (!r.arrivedAt) return <span style={{ color: '#f87171', fontWeight: 700 }}>Kelmadi</span>;
  if (isToday && isOnline(r.lastSeenAt)) return <span style={{ color: '#34d399', fontWeight: 700 }}>Ishxonada</span>;
  return <span style={{ color: 'var(--text3)', fontWeight: 700 }}>{isToday ? 'Ketgan' : 'Kelgan'}</span>;
}

export default function AttendancePage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState('');
  const [tab, setTab] = useState<DeviceTab>('new');
  const [form, setForm] = useState({ work_start: '09:00', report_time: '09:30' });
  const [showKey, setShowKey] = useState(false);

  const load = useCallback(async (d: string, quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await fetch(`/api/attendance?${d ? `day=${d}&` : ''}t=${Date.now()}`);
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Yuklashda xatolik');
      setData(j);
      if (!d) setDay(j.day);
      setForm({ work_start: j.settings.work_start, report_time: j.settings.report_time });
    } catch (e) {
      if (!quiet) toast.error(e instanceof Error ? e.message : 'Yuklashda xatolik');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(day);
    // Bugungi kunda har daqiqada yangilanadi — skaner ham shu tezlikda yuboradi.
    const t = setInterval(() => load(day, true), 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  const patchDevice = async (mac: string, patch: Record<string, unknown>, msg: string) => {
    try {
      const res = await fetch('/api/attendance/devices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac, ...patch }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Xatolik');
      toast.success(msg);
      await load(day, true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const saveSettings = async (patch: Record<string, unknown>, msg: string) => {
    try {
      const res = await fetch('/api/attendance/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Xatolik');
      toast.success(msg);
      await load(day, true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const view = data?.view;
  const isToday = !!data && data.day === data.today;
  const scannerOn = isOnline(data?.scannerLast ?? null);
  const workerName = new Map((data?.workers || []).map((w) => [w.id, w.ism.trim()]));

  const devices = (data?.devices || []).filter((d) =>
    tab === 'new' ? !d.worker_id && !d.ignored : tab === 'linked' ? !!d.worker_id : d.ignored,
  );
  const counts = {
    new: (data?.devices || []).filter((d) => !d.worker_id && !d.ignored).length,
    linked: (data?.devices || []).filter((d) => !!d.worker_id).length,
    ignored: (data?.devices || []).filter((d) => d.ignored).length,
  };

  return (
    <PageLayout
      title="Davomat"
      subtitle="Xodim telefoni ishxona WiFi'iga ulanganda avtomatik belgilanadi"
      headerActions={
        <button
          onClick={() => load(day)}
          style={{
            background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Yangilash
        </button>
      }
      filterPanel={
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="date"
              value={day}
              max={data?.today}
              onChange={(e) => e.target.value && setDay(e.target.value)}
              style={{ ...S.input, colorScheme: 'dark' }}
            />
            <span
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                fontSize: 12, fontWeight: 700,
                background: scannerOn ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                border: `1px solid ${scannerOn ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                color: scannerOn ? '#34d399' : '#f87171',
              }}
              title="Skaner har daqiqada ma'lumot yuboradi"
            >
              {scannerOn ? <Wifi size={14} /> : <WifiOff size={14} />}
              Skaner {scannerOn ? 'ishlayapti' : "o'chiq"} · {ago(data?.scannerLast ?? null)}
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <StatCard label="Keldi" value={view?.present.length ?? 0} color="#34d399" />
            <StatCard label="Kelmadi" value={view?.absent.length ?? 0} color="#f87171" />
            <StatCard label="Kechikdi" value={view?.present.filter((r) => r.late).length ?? 0} color="#fbbf24" />
          </div>
        </div>
      }
    >
      <div style={{ padding: '0 40px 40px' }} className="flex flex-col gap-6">
        {/* ── Kun holati ── */}
        <section className="rounded-2xl overflow-hidden" style={S.card}>
          <div className="px-4 py-3" style={{ ...S.h2, borderBottom: '1px solid var(--border)' }}>
            Xodimlar · {data?.day ? data.day.split('-').reverse().join('.') : ''}
            {view?.scannerFirst && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginLeft: 10 }}>
                skaner {tashkentHM(view.scannerFirst)} da yoqilgan
              </span>
            )}
          </div>
          {loading && !data ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, padding: 32, textAlign: 'center' }}>Yuklanmoqda...</div>
          ) : !view || view.rows.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, padding: 32, textAlign: 'center' }}>
              Hali hech bir telefon xodimga bog'lanmagan.
              <div style={{ fontSize: 12, marginTop: 6 }}>Pastdagi "Qurilmalar" ro'yxatidan har xodimning telefonini tanlang.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={S.th}>Xodim</th>
                    <th style={S.th}>Keldi</th>
                    <th style={S.th}>{isToday ? 'Oxirgi ko\'rinish' : 'Ketdi'}</th>
                    <th style={S.th}>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {[...view.present, ...view.absent].map((r) => (
                    <tr key={r.workerId}>
                      <td style={{ ...S.td, fontWeight: 700 }}>{r.ism}</td>
                      <td style={S.td}>
                        {r.arrivedAt ? (
                          <span style={{ fontWeight: 700, color: r.late ? '#fbbf24' : 'var(--text)' }}>
                            {r.approx ? `${tashkentHM(r.arrivedAt)} gacha` : tashkentHM(r.arrivedAt)}
                            {r.late && ' · kechikdi'}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ ...S.td, color: 'var(--text2)' }}>{r.lastSeenAt ? tashkentHM(r.lastSeenAt) : '—'}</td>
                      <td style={S.td}><StatusCell r={r} isToday={isToday} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Qurilmalar ── */}
        <section className="rounded-2xl overflow-hidden" style={S.card}>
          <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
            <span style={S.h2}>Qurilmalar</span>
            <div className="flex gap-1.5">
              {([
                ['new', "Bog'lanmagan"],
                ['linked', "Bog'langan"],
                ['ignored', "E'tiborsiz"],
              ] as [DeviceTab, string][]).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    background: tab === k ? '#4f46e5' : 'var(--surface2)',
                    color: tab === k ? '#fff' : 'var(--text2)',
                    border: `1px solid ${tab === k ? '#4f46e5' : 'var(--border)'}`,
                  }}
                >
                  {label} ({counts[k]})
                </button>
              ))}
            </div>
          </div>

          {tab === 'new' && (
            <div className="flex items-start gap-2.5 m-4 rounded-xl p-3.5" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <AlertCircle size={16} color="#818cf8" style={{ marginTop: 1, flexShrink: 0 }} />
              <div className="text-[12px]" style={{ color: 'var(--text2)', lineHeight: 1.6 }}>
                Qaysi qurilma kimniki? Xodimning telefonida WiFi manzilini oching va oxirgi belgilarini
                shu ro'yxatdagi bilan solishtiring:<br />
                <b>iPhone:</b> Sozlamalar → Wi-Fi → <i>asia_auto_service</i> yonidagi (i) → «Wi-Fi manzili».
                <b> Android:</b> Sozlamalar → Wi-Fi → ulangan tarmoq → «MAC-manzil» (yoki «Qo'shimcha»).<br />
                Yoki xodim WiFi'ni o'chirib-yoqsin: ro'yxatda «hozirgina» bo'lib chiqqan — uniki. Printer, TV,
                kameralarni «E'tiborsiz» qiling.
              </div>
            </div>
          )}

          {devices.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, padding: 28, textAlign: 'center' }}>
              {tab === 'new' ? "Yangi qurilma yo'q." : "Ro'yxat bo'sh."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={S.th}>Qurilma</th>
                    <th style={S.th}>IP</th>
                    <th style={S.th}>Oxirgi ko'rinish</th>
                    <th style={S.th}>Xodim</th>
                    <th style={{ ...S.th, width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => {
                    const online = isOnline(d.last_seen);
                    return (
                      <tr key={d.mac}>
                        <td style={S.td}>
                          <div className="flex items-center gap-2.5">
                            <span style={{ width: 8, height: 8, borderRadius: 4, background: online ? '#34d399' : 'var(--border)', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
                                <span style={{ color: 'var(--text3)' }}>{d.mac.slice(0, 9).toUpperCase()}</span>
                                <b>{d.mac.slice(9).toUpperCase()}</b>
                              </div>
                              {isRandomMac(d.mac) && (
                                <div className="inline-flex items-center gap-1" style={{ fontSize: 10, color: '#818cf8', marginTop: 2 }}>
                                  <Smartphone size={10} /> telefon bo'lishi mumkin
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...S.td, color: 'var(--text2)' }}>{d.ip || '—'}</td>
                        <td style={{ ...S.td, color: online ? '#34d399' : 'var(--text2)', fontWeight: online ? 700 : 400 }}>
                          {ago(d.last_seen)}
                        </td>
                        <td style={S.td}>
                          <select
                            value={d.worker_id ?? ''}
                            onChange={(e) => {
                              const id = e.target.value ? Number(e.target.value) : null;
                              patchDevice(d.mac, { worker_id: id }, id ? `${workerName.get(id)} ga bog'landi` : 'Uzildi');
                            }}
                            style={{ ...S.input, minWidth: 160 }}
                          >
                            <option value="">— tanlang —</option>
                            {(data?.workers || []).map((w) => (
                              <option key={w.id} value={w.id}>{w.ism.trim()}</option>
                            ))}
                          </select>
                        </td>
                        <td style={S.td}>
                          <button
                            onClick={() =>
                              patchDevice(d.mac, { ignored: !d.ignored }, d.ignored ? "Ro'yxatga qaytarildi" : "E'tiborsiz qilindi")
                            }
                            title={d.ignored ? "Ro'yxatga qaytarish" : "E'tiborsiz (printer, TV, kamera)"}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4 }}
                          >
                            {d.ignored ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Sozlamalar ── */}
        {data && (
          <section className="rounded-2xl p-4 flex flex-col gap-4" style={S.card}>
            <span style={S.h2}>Boshliqqa xabar</span>
            <div className="flex items-end gap-3 flex-wrap">
              <label className="flex flex-col gap-1" style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>
                Ish boshlanishi
                <input type="time" value={form.work_start} onChange={(e) => setForm({ ...form, work_start: e.target.value })} style={{ ...S.input, colorScheme: 'dark' }} />
              </label>
              <label className="flex flex-col gap-1" style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>
                Hisobot vaqti
                <input type="time" value={form.report_time} onChange={(e) => setForm({ ...form, report_time: e.target.value })} style={{ ...S.input, colorScheme: 'dark' }} />
              </label>
              <button
                onClick={() => saveSettings(form, 'Vaqtlar saqlandi')}
                style={{ background: '#4f46e5', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
              >
                Saqlash
              </button>
              <button
                onClick={() =>
                  saveSettings(
                    { notify: !data.settings.notify },
                    data.settings.notify ? "Boshliqqa yuborish o'chirildi" : 'Boshliqqa yuborish yoqildi',
                  )
                }
                className="inline-flex items-center gap-2"
                style={{
                  borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: data.settings.notify ? 'rgba(52,211,153,0.12)' : 'var(--surface2)',
                  color: data.settings.notify ? '#34d399' : 'var(--text2)',
                  border: `1px solid ${data.settings.notify ? 'rgba(52,211,153,0.35)' : 'var(--border)'}`,
                }}
              >
                <Send size={13} /> {data.settings.notify ? 'Yuborish yoqilgan' : "Yuborish o'chiq"}
              </button>
            </div>
            <div className="text-[12px]" style={{ color: 'var(--text2)', lineHeight: 1.6 }}>
              Har kuni <b>{data.settings.report_time}</b> da boshliqqa Telegram'da kim keldi/kelmadi ro'yxati boradi,
              undan keyin kelganlar alohida xabar bo'lib boradi. Faqat telefoni bog'langan xodimlar hisobga olinadi.
              {data.reportSentAt && <> Bugungi hisobot <b>{tashkentHM(data.reportSentAt)}</b> da yuborilgan.</>}
              {!data.settings.notify && <> Hozir <b>o'chiq</b> — telefonlarni bog'lab bo'lgach yoqing.</>}
            </div>
            {data.preview && (
              <pre
                className="rounded-xl p-3.5"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}
              >
                {data.preview}
              </pre>
            )}
            <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: 11, color: 'var(--text3)' }}>
              Skaner kaliti:
              <code style={{ fontSize: 11, color: 'var(--text2)' }}>
                {showKey ? data.settings.scanner_key : '•'.repeat(16)}
              </code>
              <button onClick={() => setShowKey(!showKey)} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 11 }}>
                {showKey ? 'yashirish' : "ko'rsatish"}
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(data.settings.scanner_key).then(() => toast.success('Nusxalandi'))}
                className="inline-flex items-center gap-1"
                style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 11 }}
              >
                <Copy size={11} /> nusxalash
              </button>
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}
