'use client';
import { useEffect, useMemo, useState } from 'react';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import { ArrowRight, ArrowLeft, Check, PlusCircle, Trash2, Loader2, Droplet } from 'lucide-react';
import { Identity, OilPrice, fetchOilPrices } from '@/components/bot-ui/botClient';

interface StepServicesProps {
  catalog: any;
  bolim?: string; // 'ustaxona' | 'yog' — yog'chiga avtoservis xizmatlari ko'rsatilmaydi
  identity?: Identity; // yog' bo'limida yog' narxlarini yuklash uchun kerak
  onNext: () => void;
  onPrev: () => void;
}

export default function StepServices({ catalog, bolim, identity, onNext, onPrev }: StepServicesProps) {
  const store = useBotOrderStore();
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  // Yog' bo'limida "xizmat" (ish haqi) tushunchasi yo'q — foyda faqat
  // yog'ning narx−tannarx farqidan olinadi. Shu bosqichda avtoservis
  // xizmatlari o'rniga aynan Yog' tanlanadi (keyingi bosqichda — filtr).
  const isYog = bolim === 'yog';

  const [oilOptions, setOilOptions] = useState<OilPrice[]>([]);
  const [oilLoading, setOilLoading] = useState(isYog);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');

  useEffect(() => {
    if (!isYog || !identity) { setOilLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const res = await fetchOilPrices(identity);
        if (alive && res?.ok) {
          setOilOptions((res.prices || []).filter((p: OilPrice) => p.turi === 'yog'));
        }
      } catch {
        /* jim — bo'lmasa qo'lda kiritish qoladi */
      } finally {
        if (alive) setOilLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYog, identity?.workerPhone, identity?.mechanicChatId]);

  const selectedOilId = useMemo(
    () => store.parts.find((p) => p.source === 'oil_prices')?.id ?? null,
    [store.parts]
  );

  const handleSelectOil = (o: OilPrice) => {
    const idx = store.parts.findIndex((p) => p.source === 'oil_prices' && p.id === o.id);
    if (idx >= 0) {
      store.removePart(idx);
      return;
    }
    // Faqat bitta yog' tanlanadi — avvalgisi (bo'lsa) almashtiriladi.
    const prevIdx = store.parts.findIndex((p) => p.source === 'oil_prices');
    if (prevIdx >= 0) store.removePart(prevIdx);
    store.addPart({ name: o.nom, quantity: 1, price: Number(o.narx) || 0, id: o.id, source: 'oil_prices' });
  };

  const handleAddManualOil = () => {
    if (!manualName || !manualPrice) return;
    store.addPart({ name: manualName, quantity: 1, price: Number(manualPrice), isCustom: true });
    setManualName('');
    setManualPrice('');
  };

  const umumiyServices = catalog?.catalog?.['Umumiy']?.['Umumiy'] || [];
  const carServices = catalog?.catalog[store.brand]?.[store.model] || [];
  // merge, deduplicate by name
  const seen = new Set<string>();
  const availableServices = [...umumiyServices, ...carServices].filter(s => {
    if (seen.has(s.name)) return false;
    seen.add(s.name);
    return true;
  });

  const handleToggleStandard = (svc: any) => {
    const exists = store.services.findIndex(s => s.name === svc.name);
    if (exists >= 0) {
      store.removeService(exists);
    } else {
      store.addService({ name: svc.name, price: svc.price, isCustom: false });
    }
  };

  const handleAddCustom = () => {
    if (!customName || !customPrice) return;
    store.addService({
      name: customName,
      price: Number(customPrice),
      isCustom: true
    });
    setCustomName('');
    setCustomPrice('');
  };

  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-xl font-semibold mb-2">{isYog ? "Yog' tanlash" : `Xizmatlar (${store.model})`}</h2>

      {/* YOG' BO'LIMI: avtoservis xizmatlari o'rniga yog' tanlanadi (narx−tannarx = foyda) */}
      {isYog ? (
        <div className="space-y-3">
          {oilLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
          ) : oilOptions.length === 0 ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 leading-relaxed">
              🛢️ Yog' narxlari hali kiritilmagan. Pastda qo'lda qo'shing yoki boshliqqa murojaat qiling.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 pb-2">
              {oilOptions.map((o) => {
                const isSelected = selectedOilId === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => handleSelectOil(o)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${isSelected ? 'bg-amber-500 border-none' : 'border-gray-600'}`}>
                        {isSelected ? <Check className="w-4 h-4 text-white" /> : <Droplet className="w-3.5 h-3.5 text-gray-600" />}
                      </div>
                      <div>
                        <h3 className="text-gray-200 text-sm font-medium">{o.nom}</h3>
                        {o.mashina && o.mashina !== 'UMUMIY' && (
                          <p className="text-gray-500 text-xs">{o.mashina}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-amber-400 text-xs font-semibold shrink-0">{Number(o.narx).toLocaleString()} UZS</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ro'yxatda yo'q yog' — qo'lda qo'shish (tannarx kuzatilmaydi) */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" /> Ro'yxatda yo'q yog' qo'shish
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Yog' nomi"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={manualName}
                onChange={(e: any) => setManualName(e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Narxi (UZS)"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                />
                <button
                  onClick={handleAddManualOil}
                  disabled={!manualName || !manualPrice}
                  className="bg-amber-600 hover:bg-amber-500 text-white p-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Qo'shish
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-3 text-xs text-gray-400 leading-relaxed">
            Filtrni (yog' filtri / salon filtri) <b>keyingi bosqichda</b> tanlaysiz.
            Qo'shimcha xizmat (masalan ish haqi) bo'lsa pastda yozing, aks holda "Davom etish" bosing.
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 pb-2">
          {availableServices.length === 0 && <p className="text-gray-400">Standart xizmat topilmadi</p>}
          {availableServices.map((svc: any) => {
            const isSelected = store.services.some(s => s.name === svc.name);
            return (
              <div
                key={svc.id || svc.name}
                onClick={() => handleToggleStandard(svc)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${isSelected ? 'bg-blue-500 border-none' : 'border-gray-600'}`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-gray-200 text-sm font-medium">{svc.name}</h3>
                    <p className="text-blue-400 text-xs mt-1">{Number(svc.price).toLocaleString()} UZS</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Selected Custom Services */}
      {store.services.filter(s => s.isCustom).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Qo'shimcha Xizmatlar:</h3>
          <div className="space-y-2">
            {store.services.map((svc, i) => svc.isCustom && (
              <div key={i} className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700">
                <div>
                  <p className="text-sm">{svc.name}</p>
                  <p className="text-xs text-blue-400">{Number(svc.price).toLocaleString()} UZS</p>
                </div>
                <button
                  onClick={() => store.removeService(i)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Service Adder */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-blue-400" /> Boshqa xizmat qo'shish
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Xizmat nomi"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={customName}
            onChange={(e: any) => setCustomName(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Narxi (UZS)"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={customPrice}
              onChange={e => setCustomPrice(e.target.value)}
            />
            <button
              onClick={handleAddCustom}
              disabled={!customName || !customPrice}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-950/40 text-white p-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
            >
              Qo'shish
            </button>
          </div>
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
          Davom etish <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
