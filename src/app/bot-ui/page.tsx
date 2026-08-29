'use client';
import toast from 'react-hot-toast';

import { useState, useEffect, useRef } from 'react';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import StepServices from '@/components/bot-ui/StepServices';
import StepParts from '@/components/bot-ui/StepParts';
import ReceiptPreview from '@/components/bot-ui/ReceiptPreview';
import { Loader2, Eye, RefreshCw, ChevronRight, Trophy, Package } from 'lucide-react';
import PhoneLogin from '@/components/bot-ui/PhoneLogin';
import AcceptForm from '@/components/bot-ui/AcceptForm';
import CarDetail from '@/components/bot-ui/CarDetail';
import BossMonitor from '@/components/bot-ui/BossMonitor';
import PointsView from '@/components/bot-ui/PointsView';
import SparePartsAdmin from '@/components/bot-ui/SparePartsAdmin';
import { resolveIdentity, fetchCars, stageMeta, fmtTime, Car } from '@/components/bot-ui/botClient';

type View = 'home' | 'detail' | 'complete' | 'boss' | 'points' | 'catalog';

export default function BotUIPage() {
  const [view, setView] = useState<View>('home');
  const [completeStep, setCompleteStep] = useState(1);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [catalogData, setCatalogData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [carsData, setCarsData] = useState<{ myCars: Car[]; allCars: Car[] | null; is_boss: boolean; name: string }>({
    myCars: [],
    allCars: null,
    is_boss: false,
    name: '',
  });
  const [loadingCars, setLoadingCars] = useState(false);
  const store = useBotOrderStore();
  const webAppRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bot_auth_user');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p && p.phone) setAuthUser(p);
        else localStorage.removeItem('bot_auth_user');
      } catch {
        localStorage.removeItem('bot_auth_user');
      }
    }
    setLoading(false);

    (async () => {
      try {
        const mod = await import('@twa-dev/sdk');
        const WebApp = mod?.default || mod;
        webAppRef.current = WebApp;
        if (WebApp && typeof WebApp.ready === 'function') {
          WebApp.ready();
          WebApp.expand();
          WebApp.setHeaderColor('bg_color');
        }
      } catch {
        console.warn('Telegram WebApp API is not available locally.');
      }

      try {
        const res = await fetch(`/api/bot-ui/catalog?t=${Date.now()}`);
        const data = await res.json();
        if (data.error) setError(data.error);
        setCatalogData(data);
      } catch (err: any) {
        setError(err.message);
        setCatalogData({ brands: ['Chevrolet', 'Kia', 'Hyundai', 'BYD', 'Lada'], catalog: {} });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isInsideTelegram =
    typeof window !== 'undefined' &&
    ((window as any).Telegram?.WebApp?.initData?.length > 0 ||
      window.location.hash.includes('tgWebAppData') ||
      window.location.hash.includes('tgWebAppVersion'));
  const hasPhoneParam =
    typeof window !== 'undefined' && !!new URLSearchParams(window.location.search).get('phone');
  const authed = isInsideTelegram || hasPhoneParam || !!authUser;

  const loadCars = async () => {
    setLoadingCars(true);
    try {
      const identity = resolveIdentity(authUser);
      const res = await fetchCars(identity);
      if (res.ok) {
        setCarsData({
          myCars: res.myCars || [],
          allCars: res.allCars || null,
          is_boss: !!res.worker?.is_boss,
          name: res.worker?.ism || '',
        });
      }
    } catch {
      /* jim */
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => {
    if (!loading && authed) loadCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, authed, authUser]);

  const handleLogout = () => {
    localStorage.removeItem('bot_auth_user');
    setAuthUser(null);
    setView('home');
  };

  // Har qanday amaldan keyin — ro'yxatni yangilab, bosh ekranга qaytamiz.
  const finishHome = async () => {
    await loadCars();
    setView('home');
  };

  const startComplete = (car: Car) => {
    store.reset();
    const brands: string[] = catalogData?.brands || [];
    const found = brands.find((b) => car.mashina?.toLowerCase().startsWith(b.toLowerCase()));
    if (found) store.setCarInfo({ brand: found, model: car.mashina.slice(found.length).trim() });
    store.setCarInfo({ plateNumber: car.raqam || '' });
    setSelectedCar(car);
    setCompleteStep(1);
    setView('complete');
  };

  const handleComplete = async () => {
    if (!selectedCar) return;
    setIsSubmitting(true);
    try {
      const identity = resolveIdentity(authUser);
      const payload = {
        orderId: selectedCar.id,
        brand: store.brand,
        model: store.model,
        probeg: store.probeg,
        plateNumber: store.plateNumber,
        services: store.services,
        parts: store.parts,
        workerPhone: identity.workerPhone,
        mechanicChatId: identity.mechanicChatId,
      };
      const res = await fetch('/api/bot-ui/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || `Server xatosi: ${res.status}`);
      toast.success(`Chek chiqdi ✅ Mashina "tayyor" — endi topshirishingiz mumkin. Chek #${j.id}`);
      store.reset();
      setSelectedCar(null);
      await finishHome();
    } catch (e: any) {
      toast.error('XATOLIK: ' + (e.message || 'Xatolik yuz berdi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="tg-scope flex bg-gray-900 text-white min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="tg-scope min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <PhoneLogin
          onAuth={(user) => {
            setAuthUser(user);
            localStorage.setItem('bot_auth_user', JSON.stringify(user));
          }}
        />
      </div>
    );
  }

  const displayName = authUser?.name || carsData.name;

  return (
    <div className="tg-scope min-h-screen bg-gray-900 text-gray-100 font-sans" style={{ colorScheme: 'dark' }}>
      <div className="max-w-md mx-auto px-4 py-5 pb-28">
        {/* ── Header ── */}
        <header className="mb-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-950/40">
                AA
              </div>
              <div>
                <h1 className="text-base font-extrabold leading-tight">Asia Auto Service</h1>
                {displayName && (
                  <p className="text-xs text-gray-400 leading-tight">
                    {displayName}
                    {carsData.is_boss && <span className="ml-1.5 text-amber-400 font-semibold">· Boshliq</span>}
                  </p>
                )}
              </div>
            </div>
            {authUser && (
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-600 rounded-xl px-3 py-1.5 transition-colors shrink-0"
              >
                Chiqish
              </button>
            )}
          </div>
          {error && (
            <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-300">
              ⚠️ {error}
            </div>
          )}
        </header>

        <main>
          {/* ══ BOSH EKRAN — qabul formasi + tugallanmagan ishlar ══ */}
          {view === 'home' && (
            <div className="space-y-6 slide-in">
              {/* Yangi mashina qabul qilish (yuqorida) */}
              <AcceptForm catalog={catalogData} identity={resolveIdentity(authUser)} onDone={finishHome} />

              {/* Mening ballarim */}
              <button
                onClick={() => setView('points')}
                className="w-full flex items-center justify-between gap-2 bg-gray-800 border border-gray-700 hover:border-amber-500/40 rounded-xl p-4 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="font-bold">Mening ballarim</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>

              {/* Tugallanmagan ishlar (qator-qator) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Tugallanmagan ishlarim ({carsData.myCars.length})
                  </h2>
                  <button onClick={loadCars} className="text-gray-400 hover:text-white p-1" title="Yangilash">
                    <RefreshCw className={`w-4 h-4 ${loadingCars ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {carsData.myCars.length === 0 && !loadingCars && (
                  <div className="text-gray-500 text-center py-8 text-sm bg-gray-800/50 border border-gray-700 rounded-xl">
                    Hozircha tugallanmagan ish yo'q
                  </div>
                )}

                <div className="space-y-2.5">
                  {carsData.myCars.map((c) => {
                    const meta = stageMeta(c.bosqich);
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCar(c);
                          setView('detail');
                        }}
                        className="w-full text-left bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-4 flex items-center justify-between gap-2 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-bold truncate">
                            {c.mashina} {c.raqam && <span className="text-gray-400 font-normal">· {c.raqam}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                              style={{ background: meta.color + '22', color: meta.color }}
                            >
                              {meta.emoji} {meta.label}
                            </span>
                            <span className="text-xs text-gray-500">{fmtTime(c.qabul_vaqti)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Boshliq — barcha mashinalar kuzatuvi + zapchast katalogi (alohida) */}
              {carsData.is_boss && (
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      loadCars();
                      setView('boss');
                    }}
                    className="w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-[0.98] bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/40"
                  >
                    <Eye className="w-5 h-5" /> Barcha mashinalar (kuzatuv)
                  </button>
                  <button
                    onClick={() => setView('catalog')}
                    className="w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-[0.98] bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white"
                  >
                    <Package className="w-5 h-5 text-blue-400" /> Zapchastlar katalogi
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ MASHINA KARTASI — holat o'zgartirish / topshirish ══ */}
          {view === 'detail' && selectedCar && (
            <CarDetail
              car={selectedCar}
              identity={resolveIdentity(authUser)}
              onDone={finishHome}
              onComplete={() => startComplete(selectedCar)}
              onBack={() => setView('home')}
            />
          )}

          {/* ══ BOSHLIQ KUZATUVI ══ */}
          {view === 'boss' && <BossMonitor cars={carsData.allCars || []} onBack={() => setView('home')} />}

          {/* ══ ZAPCHASTLAR KATALOGI (faqat boshliq) ══ */}
          {view === 'catalog' && (
            <SparePartsAdmin
              identity={resolveIdentity(authUser)}
              catalog={catalogData}
              onBack={() => setView('home')}
            />
          )}

          {/* ══ MENING BALLARIM ══ */}
          {view === 'points' && <PointsView identity={resolveIdentity(authUser)} onBack={() => setView('home')} />}

          {/* ══ TOPSHIRISH ══ */}
          {view === 'complete' && (
            <div className="slide-in">
              <div className="mb-4 text-sm text-gray-400">
                🚗 {selectedCar?.mashina} {selectedCar?.raqam ? `· ${selectedCar.raqam}` : ''} — chek chiqarish
              </div>
              {completeStep === 1 && (
                <StepServices catalog={catalogData} onNext={() => setCompleteStep(2)} onPrev={() => setView('detail')} />
              )}
              {completeStep === 2 && (
                <StepParts catalog={catalogData} onNext={() => setCompleteStep(3)} onPrev={() => setCompleteStep(1)} />
              )}
              {completeStep === 3 && (
                <ReceiptPreview onPrev={() => setCompleteStep(2)} onSubmit={handleComplete} isSubmitting={isSubmitting} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
