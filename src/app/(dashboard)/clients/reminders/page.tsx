'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { sendSMS, getDebtReminderMessage, getServiceReminderMessage } from '@/services/smsService';
import { Bell, Send, AlertTriangle, CalendarClock, Loader2 } from 'lucide-react';

interface ReminderTarget {
  key: string;
  ism: string;
  tel?: string;
  mashina?: string;
  amount: number;      // qarz summasi (debt rejimida)
  lastVisit?: string;  // oxirgi tashrif (service rejimida)
  message: string;
}

const SERVICE_INTERVAL_DAYS = 90; // shu kundan ko'p o'tgan bo'lsa TO eslatmasi

export default function RemindersPage() {
  const { buyurtmalar, loadInitialData } = useStore();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'debt' | 'service'>('debt');
  const [sending, setSending] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  useEffect(() => { setMounted(true); loadInitialData(); /* eslint-disable-next-line */ }, []);

  // Qarzdor mijozlar — to'lanmagan qoldig'i bor buyurtmalardan
  const debtors = useMemo<ReminderTarget[]>(() => {
    const map = new Map<string, ReminderTarget>();
    buyurtmalar.forEach(b => {
      if (b.holat === 'bekor qilingan') return;
      const outstanding = (b.final || 0) - (b.paid || 0);
      if (outstanding <= 0) return;
      const key = (b.tel || b.ism || String(b.id)).trim();
      const prev = map.get(key);
      const amount = (prev?.amount || 0) + outstanding;
      map.set(key, {
        key,
        ism: b.ism,
        tel: b.tel,
        mashina: b.mashina,
        amount,
        message: getDebtReminderMessage(b.ism, amount),
      });
    });
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [buyurtmalar]);

  // TO eslatmasi — har bir mijozning oxirgi tashrifi SERVICE_INTERVAL_DAYS dan oldin
  const serviceTargets = useMemo<ReminderTarget[]>(() => {
    const last = new Map<string, { date: number; b: any }>();
    buyurtmalar.forEach(b => {
      if (b.holat === 'bekor qilingan') return;
      const key = (b.tel || b.ism || String(b.id)).trim();
      const t = new Date(b.createdAt || b.sana || 0).getTime();
      const prev = last.get(key);
      if (!prev || t > prev.date) last.set(key, { date: t, b });
    });
    const now = Date.now();
    const cutoff = SERVICE_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
    const out: ReminderTarget[] = [];
    last.forEach(({ date, b }, key) => {
      if (!date || now - date < cutoff) return;
      out.push({
        key,
        ism: b.ism,
        tel: b.tel,
        mashina: b.mashina,
        amount: 0,
        lastVisit: new Date(date).toLocaleDateString('ru-RU'),
        message: getServiceReminderMessage(b.ism, b.mashina),
      });
    });
    return out.sort((a, b) => new Date(a.lastVisit || 0).getTime() - new Date(b.lastVisit || 0).getTime());
  }, [buyurtmalar]);

  const list = tab === 'debt' ? debtors : serviceTargets;

  const sendOne = async (t: ReminderTarget) => {
    if (!t.tel) { toast.error(`${t.ism}: telefon raqami yo'q`); return; }
    setSending(t.key);
    try {
      await sendSMS(t.tel, t.message);
      toast.success(`${t.ism}ga eslatma yuborildi`);
    } catch (err: any) {
      toast.error(`${t.ism}: ${err.message || 'SMS yuborilmadi'}`);
    } finally {
      setSending(null);
    }
  };

  const sendAll = async () => {
    const targets = list.filter(t => t.tel);
    if (targets.length === 0) { toast.error('Telefon raqamli mijoz yo\'q'); return; }
    if (!confirm(`${targets.length} ta mijozga SMS yuborilsinmi?`)) return;
    setBulkSending(true);
    let ok = 0, fail = 0;
    for (const t of targets) {
      try { await sendSMS(t.tel!, t.message); ok++; }
      catch { fail++; }
    }
    setBulkSending(false);
    toast.success(`Yuborildi: ${ok} ta${fail ? `, xatolik: ${fail} ta` : ''}`);
  };

  if (!mounted) return null;

  const totalDebt = debtors.reduce((s, d) => s + d.amount, 0);

  return (
    <div style={{ flex: 1, padding: '28px', background: 'var(--bg)', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(99,102,241,0.12)', color: 'var(--accent)' }}>
            <Bell size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Eslatmalar</h1>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '4px 0 0' }}>
              Mijozlarga SMS orqali qarz va texnik xizmat eslatmalari
            </p>
          </div>
        </div>
        <button
          onClick={sendAll}
          disabled={bulkSending || list.length === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--accent)', color: 'white', border: 'none',
            borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700,
            cursor: bulkSending || list.length === 0 ? 'not-allowed' : 'pointer',
            opacity: bulkSending || list.length === 0 ? 0.5 : 1,
          }}
        >
          {bulkSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          Hammasiga yuborish ({list.filter(t => t.tel).length})
        </button>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('debt')} style={tabStyle(tab === 'debt')}>
          <AlertTriangle size={14} /> Qarzdorlar ({debtors.length})
        </button>
        <button onClick={() => setTab('service')} style={tabStyle(tab === 'service')}>
          <CalendarClock size={14} /> TO eslatmasi ({serviceTargets.length})
        </button>
      </div>

      {tab === 'debt' && (
        <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text2)' }}>
          Umumiy qarzdorlik: <strong style={{ color: 'var(--red)' }}>{totalDebt.toLocaleString()} so'm</strong>
        </div>
      )}

      {/* LIST */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {list.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
            {tab === 'debt' ? 'Qarzdor mijozlar yo\'q 🎉' : 'Eslatma yuboriladigan mijoz yo\'q'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface2)', textAlign: 'left' }}>
                {['Mijoz', 'Telefon', 'Mashina', tab === 'debt' ? 'Qarz' : 'Oxirgi tashrif', ''].map(h => (
                  <th key={h} style={{ padding: '12px 18px', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(t => (
                <tr key={t.key} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text)' }}>{t.ism}</td>
                  <td style={{ padding: '12px 18px', color: t.tel ? 'var(--text2)' : 'var(--red)' }}>{t.tel || 'yo\'q'}</td>
                  <td style={{ padding: '12px 18px', color: 'var(--text3)' }}>{t.mashina || '—'}</td>
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: tab === 'debt' ? 'var(--red)' : 'var(--text2)' }}>
                    {tab === 'debt' ? `${t.amount.toLocaleString()} so'm` : t.lastVisit}
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => sendOne(t)}
                      disabled={sending === t.key || !t.tel}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(16,185,129,0.1)', color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8,
                        padding: '6px 14px', fontSize: 12, fontWeight: 700,
                        cursor: sending === t.key || !t.tel ? 'not-allowed' : 'pointer',
                        opacity: !t.tel ? 0.4 : 1,
                      }}
                    >
                      {sending === t.key ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      SMS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    background: active ? 'var(--accent)' : 'var(--surface)',
    color: active ? 'white' : 'var(--text2)',
    border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
  };
}
