'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BOLIMLAR, JAVON_TOMONLAR, JAVON_TURLARI, QAVATLAR,
  javonTavsif, javonTurInfo, partTur, qolSoni, qoldiq, sahnaInventari, sonniOqi, taxminTur,
  type JavonPart, type QolItem,
} from '@/lib/konteyner';

// 3D konteyner ombori: chapda three.js sahna (containerScene.js), o'ngda panel.
// Javonda ikki xil zapchast bor: ombordagilar (`parts`, javon raqami parts.javon da)
// va tashqaridan olib kelinib qo'lda qo'yilganlar (`konteyner_items`).

type SceneApi = {
  setInventory: (inv: unknown) => void;
  setSelected: (id: string | null) => void;
  setHighlights: (ids: string[]) => void;
  setMode: (m: 'walk' | 'top') => void;
  goToCell: (id: string) => void;
  goToDoor: () => void;
  dispose: () => void;
};

const JAMI_JAVON = JAVON_TOMONLAR.length * BOLIMLAR * QAVATLAR;

const C = {
  bg: '#0f1215', panel: '#15181d', card: '#1d2128', line: '#262b33', border: '#39414c',
  text: '#e9ecef', soft: '#c8ced5', muted: '#9aa3ad', accent: '#f2a33a', hit: '#ffe066', red: '#ff8a80',
};

const btn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 14px', borderRadius: 9,
  border: '1px solid transparent', font: "600 14px 'IBM Plex Sans', system-ui, sans-serif", cursor: 'pointer',
};
const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', height: 44, padding: '0 12px', borderRadius: 10,
  border: `1px solid ${C.border}`, background: C.bg, color: C.text, font: "15px 'IBM Plex Sans', system-ui, sans-serif",
};
const sectionTitle: React.CSSProperties = {
  font: "600 12px 'IBM Plex Sans', system-ui, sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted,
};
const mono = "'IBM Plex Mono', ui-monospace, monospace";

function fmt(n: number) {
  return Number.isInteger(n) ? n.toLocaleString('ru-RU') : n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

const fieldLabel: React.CSSProperties = { fontSize: 13, color: C.soft };

type QolForm = { nom: string; narx: string; soni: string; ogirlik: string; izoh: string; javon_tur: string };
const BOSH_FORMA: QolForm = { nom: '', narx: '', soni: '1', ogirlik: '', izoh: '', javon_tur: '' };

// Qidiruv natijasi qatori — ombor zapchasti ham, qo'lda qo'yilgani ham
type Hit = { key: string; javon: string; nom: string; sub: string; qty: string };

function sonOrNull(v: QolItem['narx']): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function KonteynerOmbor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<SceneApi | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneErr, setSceneErr] = useState(false);
  const [mode, setMode] = useState<'walk' | 'top'>('walk');

  const [parts, setParts] = useState<JavonPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [addQ, setAddQ] = useState('');
  // band qator kaliti: 'p12' — ombor zapchasti, 'q7' — qo'lda qo'yilgan
  const [busy, setBusy] = useState<string | null>(null);
  const [qol, setQol] = useState<QolItem[]>([]);
  const [addMode, setAddMode] = useState<'ombor' | 'qol'>('ombor');
  const [form, setForm] = useState<QolForm>(BOSH_FORMA);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);

  const loadParts = useCallback(async () => {
    setLoading(true);
    setLoadErr(false);
    try {
      const [res, qres] = await Promise.all([
        fetch('/api/parts', { cache: 'no-store' }),
        fetch('/api/konteyner-items', { cache: 'no-store' }),
      ]);
      if (!res.ok || !qres.ok) throw new Error(`${res.status}/${qres.status}`);
      const [data, qdata] = await Promise.all([res.json(), qres.json()]);
      setParts(Array.isArray(data) ? data : []);
      setQol(Array.isArray(qdata) ? qdata : []);
    } catch {
      setLoadErr(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadParts(); }, [loadParts]);

  // three.js faqat shu sahifada va faqat brauzerda yuklanadi
  useEffect(() => {
    let alive = true;
    let api: SceneApi | null = null;
    import('./containerScene')
      .then(({ ContainerScene }) => {
        if (!alive || !canvasRef.current) return;
        try {
          api = ContainerScene.create(canvasRef.current, {
            onSelect: (id: string) => setSel(id),
            onMode: (m: 'walk' | 'top') => setMode(m),
          }) as SceneApi;
          apiRef.current = api;
          setSceneReady(true);
        } catch (e) {
          console.error('3D sahna ishga tushmadi:', e);
          setSceneErr(true);
        }
      })
      .catch((e) => { console.error('3D sahna yuklanmadi:', e); if (alive) setSceneErr(true); });
    return () => {
      alive = false;
      if (api) { try { api.dispose(); } catch { /* */ } }
      apiRef.current = null;
    };
  }, []);

  const inventory = useMemo(() => sahnaInventari(parts, qol), [parts, qol]);

  const shelved = useMemo(() => {
    const by: Record<string, JavonPart[]> = {};
    for (const p of parts) if (p.javon) (by[p.javon] ||= []).push(p);
    for (const k of Object.keys(by)) by[k].sort((a, b) => a.nom.localeCompare(b.nom));
    return by;
  }, [parts]);

  const shelvedQol = useMemo(() => {
    const by: Record<string, QolItem[]> = {};
    for (const it of qol) (by[it.javon] ||= []).push(it);
    for (const k of Object.keys(by)) by[k].sort((a, b) => a.nom.localeCompare(b.nom));
    return by;
  }, [qol]);

  // Javon xaritasi uchun: har javonda nechta xil va jami dona (ombor + qo'lda)
  const cellSum = useMemo(() => {
    const m: Record<string, { xil: number; dona: number }> = {};
    for (const [id, arr] of Object.entries(shelved)) {
      const c = (m[id] ||= { xil: 0, dona: 0 });
      c.xil += arr.length; c.dona += arr.reduce((s, p) => s + qoldiq(p), 0);
    }
    for (const [id, arr] of Object.entries(shelvedQol)) {
      const c = (m[id] ||= { xil: 0, dona: 0 });
      c.xil += arr.length; c.dona += arr.reduce((s, it) => s + qolSoni(it), 0);
    }
    return m;
  }, [shelved, shelvedQol]);

  const stats = useMemo(() => {
    let types = qol.length, qty = qol.reduce((s, it) => s + qolSoni(it), 0), javonsiz = 0;
    for (const p of parts) {
      if (p.javon) { types++; qty += qoldiq(p); } else if (qoldiq(p) > 0) javonsiz++;
    }
    return { types, qty, cells: Object.keys(cellSum).length, javonsiz };
  }, [parts, qol, cellSum]);

  // Javondagi zapchastlar bo'yicha qidiruv — 3D da sariq bilan belgilanadi
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return { rows: [] as Hit[], cells: [] as string[] };
    const rows: Hit[] = [];
    for (const p of parts) {
      if (p.javon && `${p.nom} ${p.mashina || ''} ${p.javon} ${javonTurInfo(partTur(p)).label}`.toLowerCase().includes(s)) {
        rows.push({ key: `p${p.id}`, javon: p.javon, nom: p.nom, sub: p.mashina || '', qty: `${fmt(qoldiq(p))} ${p.bir || 'ta'}` });
      }
    }
    for (const it of qol) {
      if (`${it.nom} ${it.izoh || ''} ${it.javon} ${javonTurInfo(partTur(it)).label} qo'lda`.toLowerCase().includes(s)) {
        rows.push({ key: `q${it.id}`, javon: it.javon, nom: it.nom, sub: "qo'lda qo'yilgan", qty: `${fmt(qolSoni(it))} ta` });
      }
    }
    rows.sort((a, b) => a.javon.localeCompare(b.javon) || a.nom.localeCompare(b.nom));
    return { rows, cells: [...new Set(rows.map((r) => r.javon))] };
  }, [parts, qol, q]);

  // Ombordan javonga qo'shish uchun qidiruv — avval javonsiz va qoldig'i borlar
  const addResults = useMemo(() => {
    const s = addQ.trim().toLowerCase();
    if (!s) return [];
    return parts
      .filter((p) => p.javon !== sel && `${p.nom} ${p.mashina || ''}`.toLowerCase().includes(s))
      .sort((a, b) => (a.javon ? 1 : 0) - (b.javon ? 1 : 0) || (qoldiq(b) > 0 ? 1 : 0) - (qoldiq(a) > 0 ? 1 : 0) || a.nom.localeCompare(b.nom))
      .slice(0, 30);
  }, [parts, addQ, sel]);

  useEffect(() => { if (sceneReady) apiRef.current?.setInventory(inventory); }, [inventory, sceneReady]);
  useEffect(() => { if (sceneReady) apiRef.current?.setSelected(sel); }, [sel, sceneReady]);
  useEffect(() => { if (sceneReady) apiRef.current?.setHighlights(matches.cells); }, [matches.cells, sceneReady]);

  const goCell = (id: string) => {
    setSel(id);
    apiRef.current?.goToCell(id);
  };

  const patchJavon = async (p: JavonPart, body: { javon?: string | null; javon_tur?: string | null }, okMsg: string) => {
    setBusy(`p${p.id}`);
    try {
      const res = await fetch(`/api/parts/${p.id}/javon`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Saqlanmadi');
      setParts((prev) => prev.map((x) => (x.id === p.id ? { ...x, javon: data.javon, javon_tur: data.javon_tur } : x)));
      toast.success(okMsg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Saqlanmadi');
    } finally {
      setBusy(null);
    }
  };

  // Qo'lda (tashqaridan) olib kelingan zapchastni tanlangan javonga qo'shish
  const addQol = async () => {
    if (!sel) return;
    if (!form.nom.trim()) { setFormErr('Zapchast nomini yozing'); return; }
    const soni = sonniOqi(form.soni);
    if (soni === null || Number.isNaN(soni) || soni <= 0) { setFormErr("Sonini to'g'ri kiriting"); return; }
    if (Number.isNaN(sonniOqi(form.narx))) { setFormErr("Narxini faqat raqam bilan yozing"); return; }
    if (Number.isNaN(sonniOqi(form.ogirlik))) { setFormErr("Og'irligini faqat raqam bilan yozing (masalan 2,5)"); return; }
    setFormErr('');
    setSaving(true);
    try {
      const res = await fetch('/api/konteyner-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          javon: sel, nom: form.nom, soni: form.soni, narx: form.narx, ogirlik: form.ogirlik, izoh: form.izoh,
          javon_tur: form.javon_tur || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Saqlanmadi');
      setQol((prev) => [...prev, data as QolItem]);
      setForm(BOSH_FORMA);
      toast.success(`${data.nom} → ${sel}`);
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : 'Saqlanmadi');
    } finally {
      setSaving(false);
    }
  };

  const patchQol = async (it: QolItem, body: Record<string, unknown>, okMsg?: string) => {
    setBusy(`q${it.id}`);
    try {
      const res = await fetch(`/api/konteyner-items/${it.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Saqlanmadi');
      setQol((prev) => prev.map((x) => (x.id === it.id ? (data as QolItem) : x)));
      if (okMsg) toast.success(okMsg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Saqlanmadi');
    } finally {
      setBusy(null);
    }
  };

  const deleteQol = async (it: QolItem) => {
    if (delId !== it.id) { setDelId(it.id); return; }
    setBusy(`q${it.id}`);
    try {
      const res = await fetch(`/api/konteyner-items/${it.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "O'chmadi");
      setQol((prev) => prev.filter((x) => x.id !== it.id));
      toast.success(`${it.nom} o'chirildi`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "O'chmadi");
    } finally {
      setBusy(null);
      setDelId(null);
    }
  };

  const selItems = sel ? shelved[sel] || [] : [];
  const selQol = sel ? shelvedQol[sel] || [] : [];
  const selOgirlik = selQol.reduce((s, it) => s + (sonOrNull(it.ogirlik) ?? 0) * qolSoni(it), 0);
  const selQiymat = selQol.reduce((s, it) => s + (sonOrNull(it.narx) ?? 0) * qolSoni(it), 0);
  const walk = mode === 'walk';

  return (
    <div className="kz-root" style={{ display: 'flex', flexWrap: 'wrap', background: C.bg, color: C.text, fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .kz-root{height:calc(100dvh - 73px);min-height:560px}
        .kz-view{position:relative;flex:999 1 620px;min-width:0;height:100%;background:#c9d6e3;overflow:hidden}
        .kz-panel{flex:1 1 340px;min-width:0;max-width:100%;height:100%;overflow-y:auto;box-sizing:border-box;padding:20px;display:flex;flex-direction:column;gap:20px;background:${C.panel};border-left:1px solid ${C.line}}
        .kz-btn{transition:background .15s,border-color .15s}
        .kz-btn:hover:not(:disabled){border-color:${C.accent} !important}
        .kz-btn:disabled{opacity:.5;cursor:default}
        .kz-btn:focus-visible,.kz-in:focus-visible{outline:2px solid ${C.accent};outline-offset:2px}
        .kz-in::placeholder{color:#7d8792}
        @media (max-width:1023px){
          .kz-root{height:auto}
          .kz-view{height:62vh;min-height:380px;flex-basis:100%}
          .kz-panel{height:auto;overflow:visible;border-left:0;border-top:1px solid ${C.line}}
          .kz-hint-pc{display:none}
        }
      `}</style>

      <div className="kz-view">
        <canvas ref={canvasRef} aria-label="Konteyner omborining 3D ko'rinishi" style={{ display: 'block', width: '100%', height: '100%' }} />

        <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', flexWrap: 'wrap', gap: 8, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(15,18,21,0.88)', borderRadius: 12, pointerEvents: 'auto' }}>
            <button type="button" className="kz-btn" onClick={() => apiRef.current?.setMode('walk')}
              style={{ ...btn, background: walk ? C.accent : 'transparent', color: walk ? '#141414' : C.text }}>
              Ichkarida yurish
            </button>
            <button type="button" className="kz-btn" onClick={() => apiRef.current?.setMode('top')}
              style={{ ...btn, background: !walk ? C.accent : 'transparent', color: !walk ? '#141414' : C.text }}>
              Tepadan ko&apos;rish
            </button>
          </div>
          <button type="button" className="kz-btn" onClick={() => apiRef.current?.goToDoor()}
            style={{ ...btn, minHeight: 52, borderRadius: 12, border: `1px solid ${C.border}`, background: 'rgba(15,18,21,0.88)', color: C.text, pointerEvents: 'auto' }}>
            Eshik oldiga
          </button>
        </div>

        <div style={{ position: 'absolute', left: 14, bottom: 14, maxWidth: 440, padding: '10px 14px', borderRadius: 10, background: 'rgba(15,18,21,0.82)', fontSize: 13, lineHeight: 1.5, color: '#d5dae0', pointerEvents: 'none' }}>
          <div className="kz-hint-pc"><strong style={{ color: C.accent }}>Kompyuter:</strong> sichqoncha bilan torting — atrofga qarash, W A S D yoki strelkalar — yurish, Shift — tez yurish, g&apos;ildirak — oldinga/orqaga.</div>
          <div><strong style={{ color: C.accent }}>Telefon:</strong> chap tomonda barmoq — yurish, o&apos;ngda — qarash. Javonni bossangiz, ichidagilar panelda chiqadi.</div>
        </div>

        {walk && sceneReady && (
          <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: 6, height: 6, margin: '-3px 0 0 -3px', borderRadius: '50%', background: 'rgba(255,255,255,0.85)', boxShadow: '0 0 0 2px rgba(0,0,0,0.35)', pointerEvents: 'none' }} />
        )}
        {!sceneReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', background: '#c9d6e3', color: '#1d232b', fontSize: 16, fontWeight: 600 }}>
            {sceneErr ? "3D ko'rinish ochilmadi (brauzer WebGL'ni qo'llamayapti). Sahifani yangilab ko'ring." : '3D model yuklanmoqda…'}
          </div>
        )}
      </div>

      <aside className="kz-panel">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ font: `600 12px ${mono}`, letterSpacing: '0.08em', color: C.accent }}>SEGU 550123 6 · 45G1</div>
          <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.25, fontWeight: 700 }}>Zapchast ombori — 3D</h1>
          <div style={{ fontSize: 13, color: C.muted }}>40 fut High Cube · 12,03 × 2,35 × 2,69 m · 2 qator stelaj, 6 bo&apos;lim × 5 qavat</div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          <Stat value={fmt(stats.types)} label="xil zapchast" />
          <Stat value={fmt(stats.qty)} label="dona jami" />
          <Stat value={<>{stats.cells}<span style={{ fontSize: 13, color: C.muted }}>/{JAMI_JAVON}</span></>} label="javon band" />
        </div>

        {loading && <div style={{ fontSize: 14, color: C.muted }}>Ombor yuklanmoqda…</div>}
        {loadErr && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', borderRadius: 10, background: '#2a1618', border: '1px solid #5c2b2e', fontSize: 14, color: '#f4c7c3' }}>
            Ombor ro&apos;yxati yuklanmadi.
            <button type="button" className="kz-btn" onClick={loadParts} style={{ ...btn, alignSelf: 'flex-start', border: `1px solid ${C.red}`, background: 'transparent', color: C.red }}>Qayta urinish</button>
          </div>
        )}
        {!loading && !loadErr && stats.javonsiz > 0 && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: '#2a2316', border: '1px solid #5a4520', fontSize: 13, lineHeight: 1.45, color: '#f1e3c6' }}>
            Omborda qoldig&apos;i bor <strong>{stats.javonsiz} xil zapchast</strong>{' '}hali javonga qo&apos;yilmagan. Javonni tanlang va «Ombordan qo&apos;shish» orqali joylang.
          </div>
        )}

        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label htmlFor="kz-q" style={sectionTitle}>Javondan qidirish</label>
          <input id="kz-q" className="kz-in" type="search" placeholder="Masalan: filtr, svecha, B2…" value={q}
            onChange={(e) => setQ(e.target.value)} style={input} />
          {q.trim() && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 13, color: C.muted }}>
                {matches.rows.length ? `${matches.rows.length} ta topildi — bosing, 3D da o'sha javonga olib boradi` : 'Javonlarda topilmadi'}
              </div>
              {matches.rows.slice(0, 40).map((r) => (
                <button key={r.key} type="button" className="kz-btn" onClick={() => goCell(r.javon)}
                  style={{ ...btn, gap: 12, minHeight: 48, padding: '6px 12px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.text, textAlign: 'left', fontWeight: 400 }}>
                  <span style={{ flex: 'none', minWidth: 48, padding: '4px 6px', borderRadius: 6, background: C.hit, color: '#141414', font: `600 13px ${mono}`, textAlign: 'center' }}>{r.javon}</span>
                  <PartName nom={r.nom} sub={r.sub} />
                  <span style={{ flex: 'none', font: `600 14px ${mono}` }}>{r.qty}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 12, background: C.card, border: '1px solid #2b313a' }}>
          {!sel ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Javonni tanlang</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: '#b7bec6' }}>3D ko&apos;rinishda istalgan javonni bosing yoki pastdagi xaritadan tanlang — ichidagi zapchastlar shu yerda chiqadi va ombordan yoki qo&apos;lda yangisini qo&apos;shasiz.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 'none', whiteSpace: 'nowrap', padding: '6px 10px', borderRadius: 8, background: C.accent, color: '#141414', font: `600 20px ${mono}` }}>{sel}</div>
                <div style={{ fontSize: 14, lineHeight: 1.4, color: C.soft }}>
                  {javonTavsif(sel)}
                  {(selOgirlik > 0 || selQiymat > 0) && (
                    <div style={{ fontSize: 12, color: C.muted }}>
                      {[selOgirlik > 0 && `og'irlik ${fmt(selOgirlik)} kg`, selQiymat > 0 && `qo'lda qo'yilganlar ${fmt(selQiymat)} so'm`].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>

              {!selItems.length && !selQol.length && <div style={{ fontSize: 14, color: C.muted }}>Bu javon hozircha bo&apos;sh.</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selItems.map((p) => {
                  const tur = partTur(p);
                  const n = qoldiq(p);
                  return (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 10px 10px 12px', borderRadius: 10, background: C.panel }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ flex: 'none', width: 10, height: 10, borderRadius: 3, background: javonTurInfo(tur).color }} />
                        <PartName nom={p.nom} sub={[p.mashina, 'ombordan'].filter(Boolean).join(' · ')} />
                        <span style={{ flex: 'none', font: `600 14px ${mono}`, color: n ? C.text : C.red }}>{n ? `${fmt(n)} ${p.bir || 'ta'}` : 'tugagan'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select className="kz-in" aria-label={`${p.nom} — 3D ko'rinish turi`} value={tur} disabled={busy === `p${p.id}`}
                          onChange={(e) => patchJavon(p, { javon_tur: e.target.value }, 'Turi saqlandi')}
                          style={{ ...input, flex: 1, height: 40, fontSize: 14, padding: '0 8px' }}>
                          {JAVON_TURLARI.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                        <button type="button" className="kz-btn" disabled={busy === `p${p.id}`}
                          onClick={() => patchJavon(p, { javon: null }, `${p.nom} javondan olindi`)}
                          style={{ ...btn, minHeight: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #4a2c2c', background: 'transparent', color: C.red, fontSize: 13 }}>
                          Javondan olish
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selQol.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selQol.map((it) => {
                    const tur = partTur(it);
                    const n = qolSoni(it);
                    const narx = sonOrNull(it.narx), og = sonOrNull(it.ogirlik);
                    const band = busy === `q${it.id}`;
                    return (
                      <div key={`q${it.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, borderRadius: 10, background: C.panel, border: '1px solid rgba(242,163,58,.35)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ flex: 'none', width: 10, height: 10, borderRadius: 3, background: javonTurInfo(tur).color }} />
                          <PartName nom={it.nom} sub={"qo'lda qo'yilgan"} />
                          <span style={{ flex: 'none', font: `600 14px ${mono}` }}>{fmt(n)} ta</span>
                        </div>
                        {narx !== null && <Tafsilot label="Narxi" qiymat={narx} birlik="so'm" n={n} />}
                        {og !== null && <Tafsilot label="Og'irligi" qiymat={og} birlik="kg" n={n} />}
                        {it.izoh && <div style={{ fontSize: 13, lineHeight: 1.45, color: C.muted, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{it.izoh}</div>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          <select className="kz-in" aria-label={`${it.nom} — 3D ko'rinish turi`} value={tur} disabled={band}
                            onChange={(e) => patchQol(it, { javon_tur: e.target.value }, 'Turi saqlandi')}
                            style={{ ...input, flex: '1 1 140px', width: 'auto', height: 40, fontSize: 14, padding: '0 8px' }}>
                            {JAVON_TURLARI.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                          </select>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button type="button" className="kz-btn" aria-label="Kamaytirish" disabled={band || n <= 1}
                              onClick={() => patchQol(it, { soni: Math.max(1, n - 1) })}
                              style={{ ...btn, width: 40, minHeight: 40, padding: 0, justifyContent: 'center', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.text }}>−</button>
                            <button type="button" className="kz-btn" aria-label="Ko'paytirish" disabled={band}
                              onClick={() => patchQol(it, { soni: n + 1 })}
                              style={{ ...btn, width: 40, minHeight: 40, padding: 0, justifyContent: 'center', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.text }}>+</button>
                          </div>
                          <button type="button" className="kz-btn" disabled={band} onClick={() => deleteQol(it)} onBlur={() => setDelId(null)}
                            style={{ ...btn, minHeight: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #4a2c2c', background: delId === it.id ? '#4a2c2c' : 'transparent', color: C.red, fontSize: 13 }}>
                            {delId === it.id ? "Rostdan o'chirasizmi?" : "O'chirish"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12, borderTop: '1px solid #2b313a' }}>
                <div role="tablist" aria-label="Zapchast qo'shish usuli" style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, background: C.bg }}>
                  {([['ombor', 'Ombordan'], ['qol', 'Tashqaridan']] as const).map(([k, label]) => (
                    <button key={k} type="button" role="tab" aria-selected={addMode === k} className="kz-btn" onClick={() => setAddMode(k)}
                      style={{ ...btn, flex: 1, justifyContent: 'center', minHeight: 40, padding: '0 8px', borderRadius: 8, fontSize: 13, background: addMode === k ? C.accent : 'transparent', color: addMode === k ? '#141414' : C.soft }}>
                      {label}
                    </button>
                  ))}
                </div>

                {addMode === 'ombor' ? (
                  <>
                    <label htmlFor="kz-add" style={fieldLabel}>Ombordagi zapchastni qidiring</label>
                    <input id="kz-add" className="kz-in" type="search" placeholder="Zapchast nomi yoki mashina…" value={addQ}
                      onChange={(e) => setAddQ(e.target.value)} style={input} />
                    {addQ.trim() && !addResults.length && <div style={{ fontSize: 13, color: C.muted }}>Omborda topilmadi yoki allaqachon shu javonda. Tashqaridan olib kelingan bo&apos;lsa — «Tashqaridan» bo&apos;limidan qo&apos;shing.</div>}
                    {addResults.map((p) => {
                      const n = qoldiq(p);
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px 8px 12px', borderRadius: 10, background: C.panel }}>
                          <PartName nom={p.nom} sub={[p.mashina, p.javon && `hozir ${p.javon} da`].filter(Boolean).join(' · ')} />
                          <span style={{ flex: 'none', font: `600 13px ${mono}`, color: n ? C.soft : C.red }}>{n ? fmt(n) : '0'}</span>
                          <button type="button" className="kz-btn" disabled={busy === `p${p.id}`}
                            onClick={() => patchJavon(p, { javon: sel }, `${p.nom} → ${sel}`)}
                            style={{ ...btn, flex: 'none', minHeight: 40, padding: '0 12px', borderRadius: 8, border: `1px solid ${C.accent}`, background: p.javon ? 'transparent' : C.accent, color: p.javon ? C.accent : '#141414', fontSize: 13 }}>
                            {p.javon ? `${sel} ga ko'chirish` : `+ ${sel}`}
                          </button>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); addQol(); }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.45, color: C.muted }}>Ombordan emas, tashqaridan olib kelingan zapchast. Ombor qoldig&apos;i va kassaga ta&apos;sir qilmaydi.</div>
                    <label htmlFor="kz-nom" style={fieldLabel}>Nomi *</label>
                    <input id="kz-nom" className="kz-in" type="text" placeholder="Masalan: Nexia 3 old kolodka" value={form.nom}
                      onChange={(e) => { setForm({ ...form, nom: e.target.value }); setFormErr(''); }} style={input} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label htmlFor="kz-narx" style={fieldLabel}>Narxi (1 dona, so&apos;m)</label>
                        <input id="kz-narx" className="kz-in" type="text" inputMode="numeric" placeholder="150 000" value={form.narx}
                          onChange={(e) => { setForm({ ...form, narx: e.target.value }); setFormErr(''); }} style={{ ...input, fontFamily: mono }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label htmlFor="kz-soni" style={fieldLabel}>Soni *</label>
                        <input id="kz-soni" className="kz-in" type="text" inputMode="decimal" value={form.soni}
                          onChange={(e) => { setForm({ ...form, soni: e.target.value }); setFormErr(''); }} style={{ ...input, fontFamily: mono }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label htmlFor="kz-og" style={fieldLabel}>Og&apos;irligi (1 dona, kg)</label>
                        <input id="kz-og" className="kz-in" type="text" inputMode="decimal" placeholder="2,5" value={form.ogirlik}
                          onChange={(e) => { setForm({ ...form, ogirlik: e.target.value }); setFormErr(''); }} style={{ ...input, fontFamily: mono }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label htmlFor="kz-tur" style={fieldLabel}>3D ko&apos;rinishi</label>
                        <select id="kz-tur" className="kz-in" value={form.javon_tur}
                          onChange={(e) => setForm({ ...form, javon_tur: e.target.value })} style={{ ...input, padding: '0 8px', fontSize: 14 }}>
                          <option value="">Avto: {javonTurInfo(taxminTur(form.nom)).label}</option>
                          {JAVON_TURLARI.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <label htmlFor="kz-izoh" style={fieldLabel}>Izoh</label>
                    <textarea id="kz-izoh" className="kz-in" rows={2} placeholder="Qayerdan olindi, qaysi mashinaga, holati…" value={form.izoh}
                      onChange={(e) => setForm({ ...form, izoh: e.target.value })}
                      style={{ ...input, height: 'auto', minHeight: 64, padding: '10px 12px', resize: 'vertical', lineHeight: 1.4 }} />
                    {formErr && <div role="alert" style={{ fontSize: 13, color: C.red }}>{formErr}</div>}
                    <button type="submit" className="kz-btn" disabled={saving}
                      style={{ ...btn, justifyContent: 'center', borderRadius: 10, border: `1px solid ${C.accent}`, background: C.accent, color: '#141414', fontSize: 15, fontWeight: 700 }}>
                      {saving ? 'Saqlanmoqda…' : `+ ${sel} ga qo'shish`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={sectionTitle}>Javonlar xaritasi</div>
          {JAVON_TOMONLAR.map((sd) => (
            <div key={sd} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.soft }}>
                <span style={{ fontWeight: 600 }}>{sd === 'A' ? 'A — chap tomon' : "B — o'ng tomon"}</span>
                <span style={{ color: C.muted }}>eshik ← 1 … {BOLIMLAR} → orqa</span>
              </div>
              {Array.from({ length: QAVATLAR }, (_, i) => QAVATLAR - i).map((lvl) => (
                <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ flex: 'none', width: 18, font: `500 11px ${mono}`, color: C.muted }}>{lvl}</span>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${BOLIMLAR}, minmax(0, 1fr))`, gap: 4 }}>
                    {Array.from({ length: BOLIMLAR }, (_, j) => j + 1).map((sec) => {
                      const id = `${sd}${sec}-${lvl}`;
                      const { xil, dona: n } = cellSum[id] || { xil: 0, dona: 0 };
                      const isSel = sel === id, isHit = matches.cells.includes(id);
                      const filled = xil > 0;
                      return (
                        <button key={id} type="button" className="kz-btn" onClick={() => goCell(id)}
                          aria-label={`${id}, ${filled ? `${xil} xil, ${fmt(n)} dona` : "bo'sh"}`}
                          style={{
                            height: 40, padding: 0, borderRadius: 6, cursor: 'pointer',
                            border: `2px solid ${isSel ? C.accent : isHit ? C.hit : filled ? '#3d5a80' : '#2e353f'}`,
                            background: isHit ? C.hit : filled ? '#3d5a80' : '#1f242b',
                            color: isHit ? '#141414' : filled ? '#ffffff' : '#7d8792',
                            font: `600 12px ${mono}`,
                          }}>
                          {filled ? fmt(n) : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: C.muted }}>
            <Legend swatch={{ background: '#3d5a80' }} text="band (son — jami dona)" />
            <Legend swatch={{ border: `2px solid ${C.accent}`, boxSizing: 'border-box' }} text="tanlangan" />
            <Legend swatch={{ background: C.hit }} text="qidiruv natijasi" />
          </div>
        </section>

        <footer style={{ paddingTop: 14, borderTop: `1px solid ${C.line}`, fontSize: 13, lineHeight: 1.5, color: C.muted }}>
          Ombor zapchastlari va qoldig&apos;i ombordan olinadi, qo&apos;lda qo&apos;yilganlar alohida yuritiladi (ombor va kassaga ta&apos;sir qilmaydi). Hammasi bazada saqlanadi — hamma qurilmada bir xil ko&apos;rinadi.
        </footer>
      </aside>
    </div>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div style={{ padding: 10, borderRadius: 10, background: C.card }}>
      <div style={{ font: `600 20px ${mono}` }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
    </div>
  );
}

function PartName({ nom, sub }: { nom: string; sub?: string }) {
  return (
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nom}</span>
      {sub && <span style={{ display: 'block', fontSize: 12, color: C.muted }}>{sub}</span>}
    </span>
  );
}

// "Narxi: 4 500 000 so'm × 2 = 9 000 000 so'm" — raqamlar o'rtasidan bo'linmaydi.
function Tafsilot({ label, qiymat, birlik, n }: { label: string; qiymat: number; birlik: string; n: number }) {
  const nw: React.CSSProperties = { whiteSpace: 'nowrap', fontFamily: mono };
  return (
    <div style={{ fontSize: 13, lineHeight: 1.5, color: C.muted }}>
      {label}:{' '}
      <span style={{ ...nw, color: C.soft }}>{fmt(qiymat)} {birlik}</span>
      {n > 1 && (
        <>
          {' '}<span style={nw}>× {fmt(n)} =</span>{' '}
          <span style={{ ...nw, color: C.text, fontWeight: 600 }}>{fmt(qiymat * n)} {birlik}</span>
        </>
      )}
    </div>
  );
}

function Legend({ swatch, text }: { swatch: React.CSSProperties; text: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, ...swatch }} />{text}
    </span>
  );
}
