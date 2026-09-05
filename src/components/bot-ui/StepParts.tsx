'use client';
import { useState, useEffect, useMemo } from 'react';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import { ArrowRight, ArrowLeft, PlusCircle, Trash2, Package, Plus, PackageSearch, Loader2, Hash, Search, Filter, Check } from 'lucide-react';
import { Identity, SparePart, OilPrice, fetchSpareParts, fetchOilPrices } from '@/components/bot-ui/botClient';

interface StepPartsProps {
  catalog: any;
  identity: Identity;
  isBoss: boolean;
  bolim?: string; // 'ustaxona' | 'yog' — yog'chiga ustaxona ombori ko'rinmaydi
  onNext: () => void;
  onPrev: () => void;
}

export default function StepParts({ catalog, identity, isBoss, bolim, onNext, onPrev }: StepPartsProps) {
  const store = useBotOrderStore();
  const [partName, setPartName] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState('');

  const isYog = bolim === 'yog';

  // ── YOG' BO'LIMI: Filtr tanlash (yog' filtri / salon filtri) ────────────────
  const [filterOptions, setFilterOptions] = useState<OilPrice[]>([]);
  const [filterLoading, setFilterLoading] = useState(isYog);

  useEffect(() => {
    if (!isYog) { setFilterLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const res = await fetchOilPrices(identity);
        if (alive && res?.ok) {
          setFilterOptions((res.prices || []).filter((p: OilPrice) => p.turi === 'yog_filtri' || p.turi === 'salon_filtri'));
        }
      } catch {
        /* jim */
      } finally {
        if (alive) setFilterLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYog, identity?.workerPhone, identity?.mechanicChatId]);

  const isFilterSelected = (id: number) => store.parts.some((p) => p.source === 'oil_prices' && p.id === id);
  const toggleFilter = (f: OilPrice) => {
    const idx = store.parts.findIndex((p) => p.source === 'oil_prices' && p.id === f.id);
    if (idx >= 0) {
      store.removePart(idx);
    } else {
      store.addPart({ name: f.nom, quantity: 1, price: Number(f.narx) || 0, id: f.id, source: 'oil_prices' });
    }
  };

  const yogFiltrlari = filterOptions.filter((f) => f.turi === 'yog_filtri');
  const salonFiltrlari = filterOptions.filter((f) => f.turi === 'salon_filtri');

  const renderFilterGroup = (title: string, items: OilPrice[]) => (
    <div className="mb-4 last:mb-0">
      <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{title}</h4>
      {items.length === 0 ? (
        <p className="text-gray-500 text-xs">Hali qo'shilmagan</p>
      ) : (
        <div className="space-y-2">
          {items.map((f) => {
            const selected = isFilterSelected(f.id);
            return (
              <div
                key={f.id}
                onClick={() => toggleFilter(f)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selected ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${selected ? 'bg-amber-500 border-none' : 'border-gray-600'}`}>
                    {selected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <h3 className="text-gray-200 text-sm font-medium">{f.nom}</h3>
                </div>
                <p className="text-amber-400 text-xs font-semibold shrink-0">{Number(f.narx).toLocaleString()} UZS</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Rasmli katalog (spare_parts) — FAQAT BOSHLIQQA ko'rinadi (server ham tekshiradi).
  //    Bir bosishda chekka qo'shiladi (isCustom: qo'lda qo'shish bilan bir xil).
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [spLoading, setSpLoading] = useState(true);
  const [catSearch, setCatSearch] = useState('');

  useEffect(() => {
    if (!isBoss) { setSpLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const res = await fetchSpareParts(identity);
        if (alive && res?.ok) {
          setSpareParts((res.parts || []).map((p: any) => ({ ...p, rasmlar: Array.isArray(p.rasmlar) ? p.rasmlar : [] })));
        }
      } catch {
        /* jim — katalog bo'lmasa oddiy qo'lda kiritish qoladi */
      } finally {
        if (alive) setSpLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [identity, isBoss]);

  const catFiltered = useMemo(() => {
    const s = catSearch.trim().toLowerCase();
    if (!s) return spareParts;
    return spareParts.filter(
      (p) => (p.nom || '').toLowerCase().includes(s) || (p.artikul || '').toLowerCase().includes(s)
    );
  }, [spareParts, catSearch]);

  const handleSelectSparePart = (p: SparePart) => {
    store.addPart({
      name: p.nom,
      quantity: 1,
      price: Number(p.narx) || 0,
      isCustom: true,
    });
  };

  // Saytdan kiritilgan zapchastlar ro'yxati (source='site') — bot katalogidan keladi
  const sitePartsAll: { id: number; name: string; price: number; mashina: string }[] = catalog?.parts || [];
  const siteParts = sitePartsAll.slice(0, 50);

  // Saytdagi zapchastni to'g'ridan-to'g'ri qo'shish (isCustom: false — qayta bazaga yozilmaydi).
  // id+source yuboriladi — server (submit) shu orqali omborni kamaytiradi VA
  // haqiqiy tannarxni (sebestoimost) bazadan o'qiydi (klient narxiga ishonmaydi).
  const handleSelectSitePart = (p: { id: number; name: string; price: number }) => {
    store.addPart({
      name: p.name,
      quantity: 1,
      price: Number(p.price) || 0,
      isCustom: false,
      id: p.id,
      source: 'site',
    });
  };

  // Qo'lda yangi zapchast qo'shish (isCustom: true — bazaga source='bot' bilan tushadi)
  const handleAddCustomPart = () => {
    if (!partName || !partPrice || partQty < 1) return;
    store.addPart({
      name: partName,
      quantity: Number(partQty),
      price: Number(partPrice),
      isCustom: true,
    });
    setPartName('');
    setPartQty(1);
    setPartPrice('');
  };

  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-xl font-semibold mb-2">{isYog ? 'Filtr tanlash' : 'Ehtiyot Qismlar (Zapchast)'}</h2>

      {/* Tanlangan zapchastlar ro'yxati */}
      <div className="space-y-3">
        {store.parts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Hali {isYog ? 'filtr' : 'zapchast'} qo'shilmadi</p>
        ) : (
          store.parts.map((part, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center transition-all">
              <div className="flex-1">
                <h3 className="font-medium text-gray-200">{part.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span>{part.quantity} dona</span>
                  <span className="text-gray-600">•</span>
                  {/* Narx miqdorga KO'PAYTIRILMAYDI — kiritilgan narx shundayligicha */}
                  <span className="text-blue-400 font-medium">{Number(part.price).toLocaleString()} UZS</span>
                </div>
              </div>
              <button
                onClick={() => store.removePart(i)}
                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
                title="O'chirish"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* YOG' BO'LIMI: Yog' filtri / Salon filtri — ikkalasi ham tanlanishi mumkin */}
      {isYog && (
        <div className="bg-gradient-to-b from-gray-800/60 to-gray-800/30 rounded-2xl p-4 border border-gray-700/50 shadow-lg shadow-black/10">
          <h3 className="text-xs font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" /> Filtr tanlash
          </h3>
          {filterLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
          ) : (
            <>
              {renderFilterGroup("Yog' filtri", yogFiltrlari)}
              {renderFilterGroup('Salon filtri', salonFiltrlari)}
            </>
          )}
        </div>
      )}

      {/* Rasmli katalogdan tanlash — FAQAT BOSHLIQQA (bir bosishda chekka qo'shiladi) */}
      {isBoss && (
      <div className="bg-gradient-to-b from-gray-800/60 to-gray-800/30 rounded-2xl p-4 border border-gray-700/50 mt-4 shadow-lg shadow-black/10">
        <h3 className="text-xs font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-400" /> Katalogdan tanlash (rasm bilan)
        </h3>

        {spLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
        ) : spareParts.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <PackageSearch className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-gray-500 text-xs">Katalogda zapchast yo'q</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-700/60 rounded-xl px-3 mb-3">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Nom yoki detal nomeri..."
                className="w-full bg-transparent py-2.5 text-white outline-none text-sm"
              />
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 -mr-1">
              {catFiltered.map((p) => {
                const img = p.rasmlar?.[0];
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectSparePart(p)}
                    className="w-full flex items-center gap-3 bg-gray-900/60 hover:bg-amber-600 active:scale-[0.98] text-left px-3 py-2.5 rounded-xl border border-gray-700/60 hover:border-amber-500 transition-all duration-150 group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-100 group-hover:text-white text-[13px] truncate">{p.nom || '—'}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.artikul && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-blue-300 group-hover:text-white">
                            <Hash className="w-2.5 h-2.5" />{p.artikul}
                          </span>
                        )}
                        {p.narx ? (
                          <span className="text-[11px] text-emerald-400 group-hover:text-amber-100 font-semibold">{Number(p.narx).toLocaleString()} UZS</span>
                        ) : (
                          <span className="text-[11px] text-gray-500 group-hover:text-amber-100">narx yo'q</span>
                        )}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-amber-500/15 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
                      <Plus className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                );
              })}
              {catFiltered.length === 0 && <p className="text-gray-500 text-xs text-center py-4">Topilmadi</p>}
            </div>
          </>
        )}
      </div>
      )}

      {/* Saytdagi zapchastlar ro'yxatidan tanlash — ustaxona ombori, yog'chiga ALOQASIZ (ko'rinmaydi) */}
      {!isYog && (
      <div className="bg-gradient-to-b from-gray-800/60 to-gray-800/30 rounded-2xl p-4 border border-gray-700/50 mt-4 shadow-lg shadow-black/10">
        <h3 className="text-xs font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-400" /> Ro'yxatdan tanlash
        </h3>

        {sitePartsAll.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <PackageSearch className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-gray-500 text-xs">Saytda zapchast qo'shilmagan</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 -mr-1">
            {siteParts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectSitePart(p)}
                className="w-full flex items-center gap-3 bg-gray-900/60 hover:bg-blue-600 active:scale-[0.98] text-left px-3 py-2.5 rounded-xl border border-gray-700/60 hover:border-blue-500 transition-all duration-150 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 group-hover:bg-white/15 flex items-center justify-center shrink-0 transition-colors">
                  <Package className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-100 group-hover:text-white text-[13px] truncate">{p.name}</div>
                  <div className="text-[11px] text-gray-500 group-hover:text-blue-100 mt-0.5 transition-colors">
                    {Number(p.price).toLocaleString()} UZS
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-500/15 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
                  <Plus className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Qo'lda yangi zapchast/filtr qo'shish */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mt-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-orange-400" /> {isYog ? "Ro'yxatda yo'q filtr qo'shish" : "Qo'lda Zapchast Qo'shish"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nomi</label>
            <input
              type="text"
              placeholder="Masalan: Moy filtri"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={partName}
              onChange={(e: any) => setPartName(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Soni</label>
              <input
                type="number"
                min="1"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={partQty}
                onChange={(e: any) => setPartQty(Number(e.target.value))}
              />
            </div>
            <div className="flex-[2]">
              <label className="text-xs text-gray-400 mb-1 block">Narxi</label>
              <input
                type="number"
                placeholder="UZS"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={partPrice}
                onChange={(e: any) => setPartPrice(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleAddCustomPart}
            disabled={!partName || !partPrice || partQty < 1}
            className="w-full mt-2 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30 font-medium py-3 rounded-xl transition-all disabled:opacity-50"
          >
            + Ro'yxatga Qo'shish
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onPrev}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold flex items-center justify-center gap-2 py-4 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Orqaga
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-950/40 text-white font-semibold flex items-center justify-center gap-2 py-4 rounded-xl transition-all active:scale-[0.98]"
        >
          Keyingi <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
