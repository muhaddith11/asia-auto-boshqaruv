'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollText, RefreshCcw, Loader2 } from 'lucide-react';

interface AuditRow {
  id: number;
  action: string;
  entity: string;
  entity_id: string | null;
  user_role: string | null;
  user_name: string | null;
  details: any;
  created_at: string;
}

const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  create:   { label: 'Yaratildi',  color: '#10b981' },
  update:   { label: "O'zgartirildi", color: '#3b82f6' },
  delete:   { label: "O'chirildi", color: '#f43f5e' },
  payment:  { label: "To'lov",     color: '#22d3ee' },
  transfer: { label: "O'tkazma",   color: '#a78bfa' },
  salary:   { label: 'Maosh',      color: '#f59e0b' },
};

const ENTITY_LABEL: Record<string, string> = {
  order: 'Buyurtma', operation: 'Operatsiya', salary: 'Maosh', client: 'Mijoz',
};

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const LIMIT = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (entity) params.set('entity', entity);
      if (action) params.set('action', action);
      const res = await fetch(`/api/audit?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setRows(json.data || []);
      setTotalPages(json.totalPages || 1);
      setTotal(json.total || 0);
    } catch (err: any) {
      console.error('Audit yuklashda xatolik:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, from, to, entity, action]);

  useEffect(() => { load(); }, [load]);
  // Filtr o'zgarsa 1-betga qaytamiz
  useEffect(() => { setPage(1); }, [from, to, entity, action]);

  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '8px 12px', fontSize: 12, color: 'var(--text)', outline: 'none',
  };

  return (
    <div style={{ flex: 1, padding: '28px', background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 10, borderRadius: 12, background: 'rgba(99,102,241,0.12)', color: 'var(--accent)' }}>
          <ScrollText size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Audit jurnali</h1>
          <p style={{ fontSize: 12, color: 'var(--text3)', margin: '4px 0 0' }}>Kim, qachon, nimani o'zgartirgani — {total} ta yozuv</p>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
        <div>
          <label style={lblStyle}>Sana (dan)</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={lblStyle}>Sana (gacha)</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={lblStyle}>Bo'lim</label>
          <select value={entity} onChange={e => setEntity(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Barchasi</option>
            <option value="order">Buyurtma</option>
            <option value="operation">Operatsiya</option>
            <option value="salary">Maosh</option>
          </select>
        </div>
        <div>
          <label style={lblStyle}>Amal</label>
          <select value={action} onChange={e => setAction(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Barchasi</option>
            {Object.entries(ACTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <button onClick={() => load()} style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCcw size={13} />} Yangilash
        </button>
      </div>

      {/* TABLE */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--surface2)', textAlign: 'left' }}>
              {['Sana', 'Foydalanuvchi', 'Amal', "Bo'lim", 'ID', 'Tafsilot'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
                {loading ? 'Yuklanmoqda...' : 'Yozuv topilmadi (jadval yaratilganini tekshiring: db/audit_log.sql)'}
              </td></tr>
            ) : rows.map(r => {
              const a = ACTION_LABEL[r.action] || { label: r.action, color: 'var(--text3)' };
              return (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 16px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmt(r.created_at)}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--text)' }}>
                    {r.user_name || '—'}
                    {r.user_role && <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase' }}>({r.user_role})</span>}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: `${a.color}1a`, color: a.color }}>{a.label}</span>
                  </td>
                  <td style={{ padding: '11px 16px', color: 'var(--text2)' }}>{ENTITY_LABEL[r.entity] || r.entity}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--accent)', fontWeight: 700 }}>{r.entity_id ? `#${r.entity_id}` : '—'}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--text3)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.details ? JSON.stringify(r.details) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION (serverside) */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={pgBtn(false, page === 1)}>← Oldingi</button>
          <span style={{ fontSize: 12, color: 'var(--text3)', padding: '0 8px' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={pgBtn(false, page === totalPages)}>Keyingi →</button>
        </div>
      )}
    </div>
  );
}

const lblStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase' };
function pgBtn(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    padding: '8px 16px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text2)', fontSize: 12, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
  };
}
