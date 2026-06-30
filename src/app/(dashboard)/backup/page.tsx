'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { exportToCSV } from '@/lib/export';
import { Database, Download, FileSpreadsheet, Loader2, ShieldCheck } from 'lucide-react';

export default function BackupPage() {
  const { mijozlar, buyurtmalar, ishxonaOperatsiyalar, tashqariOperatsiyalar, loadInitialData } = useStore();
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { setMounted(true); loadInitialData(); /* eslint-disable-next-line */ }, []);
  if (!mounted) return null;

  const downloadBackup = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/backup', { cache: 'no-store' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Xatolik: ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asia-auto-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Zaxira nusxa yuklab olindi');
    } catch (err: any) {
      toast.error(err.message || 'Zaxira olishda xatolik');
    } finally {
      setDownloading(false);
    }
  };

  const exportClients = () => {
    exportToCSV('mijozlar', mijozlar, [
      { key: 'id', label: 'ID' },
      { key: 'ism', label: 'Ism' },
      { key: 'tel', label: 'Telefon' },
      { key: 'mashina', label: 'Mashina' },
      { key: 'raqam', label: 'Raqam' },
      { key: 'qarzdorlik', label: 'Qarzdorlik' },
      { key: 'jami', label: 'Jami sarflagan' },
      { key: 'tashriflar', label: 'Tashriflar' },
    ]);
    toast.success('Mijozlar Excel ga eksport qilindi');
  };

  const exportOrders = () => {
    exportToCSV('buyurtmalar', buyurtmalar, [
      { key: 'id', label: 'ID' },
      { key: 'ism', label: 'Mijoz' },
      { key: 'tel', label: 'Telefon' },
      { key: 'mashina', label: 'Mashina' },
      { key: 'raqam', label: 'Raqam' },
      { key: 'holat', label: 'Holat' },
      { key: 'srv', label: 'Xizmatlar' },
      { key: 'zap', label: 'Zapchast' },
      { key: 'final', label: "To'lov" },
      { key: 'paid', label: "To'langan" },
      { key: 'pribil', label: 'Foyda' },
      { key: 'sana', label: 'Sana' },
    ]);
    toast.success('Buyurtmalar Excel ga eksport qilindi');
  };

  const exportOperations = () => {
    const all = [...ishxonaOperatsiyalar, ...tashqariOperatsiyalar];
    exportToCSV('operatsiyalar', all, [
      { key: 'id', label: 'ID' },
      { key: 'date', label: 'Sana' },
      { key: 'type', label: 'Turi' },
      { key: 'category', label: 'Kategoriya' },
      { key: 'amount', label: 'Summa' },
      { key: 'method', label: 'Usul' },
      { key: 'comment', label: 'Izoh' },
      { key: 'source', label: 'Manba' },
    ]);
    toast.success('Operatsiyalar Excel ga eksport qilindi');
  };

  const exportCards: { label: string; count: number; onClick: () => void }[] = [
    { label: 'Mijozlar', count: mijozlar.length, onClick: exportClients },
    { label: 'Buyurtmalar', count: buyurtmalar.length, onClick: exportOrders },
    { label: 'Operatsiyalar', count: ishxonaOperatsiyalar.length + tashqariOperatsiyalar.length, onClick: exportOperations },
  ];

  return (
    <div style={{ flex: 1, padding: '28px', background: 'var(--bg)', minHeight: '100vh', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ padding: 10, borderRadius: 12, background: 'rgba(99,102,241,0.12)', color: 'var(--accent)' }}>
          <Database size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Zaxira va Eksport</h1>
          <p style={{ fontSize: 12, color: 'var(--text3)', margin: '4px 0 0' }}>Ma'lumotlarni xavfsiz saqlash va Excel uchun yuklab olish</p>
        </div>
      </div>

      {/* FULL BACKUP */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <ShieldCheck size={18} color="#10b981" />
          <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0 }}>To'liq zaxira nusxa (JSON)</h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text3)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Barcha jadvallar (mijozlar, buyurtmalar, xizmatlar, zapchastlar, operatsiyalar, maoshlar va h.k.)
          bitta faylga yuklab olinadi. Tavsiya: haftada bir marta saqlab boring.
        </p>
        <button
          onClick={downloadBackup}
          disabled={downloading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#10b981', color: 'white', border: 'none', borderRadius: 10,
            padding: '11px 22px', fontSize: 13, fontWeight: 700, cursor: downloading ? 'wait' : 'pointer',
            opacity: downloading ? 0.6 : 1,
          }}
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Zaxira nusxani yuklab olish
        </button>
      </div>

      {/* CSV EXPORT */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FileSpreadsheet size={18} color="var(--accent)" />
          <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Excel eksport</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {exportCards.map(c => (
            <button key={c.label} onClick={c.onClick}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
              }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{c.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{c.count} ta yozuv</div>
              </div>
              <Download size={18} color="var(--accent)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
