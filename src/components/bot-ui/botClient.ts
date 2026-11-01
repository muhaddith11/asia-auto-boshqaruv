// Bot-ui klient tomoni: xodim identifikatsiyasi, API chaqiruvlari va bosqich meta.

// Xodim bu token bilan tanib olinadi (u /api/bot-ui/session'dan keladi).
export interface Identity {
  token: string;
}

// localStorage'da saqlanadigan kirish ma'lumoti.
export interface BotAuthUser {
  token: string;
  id: number;
  phone: string;
  name: string;
}

// Mashinaga qilingan bitta rasxod (xarajat) — buyurtma zaps ichidan ajratilgan.
export interface RasxodLine {
  nom: string;
  summa: number;
  vaqt?: string | null;
  xodim_nomi?: string | null;
}

// ICE = oddiy dvigatel. HYBRID = benzin+elektr birga (motor yog'i HAM kerak).
// ELECTRIC = to'liq elektromobil (motor yog'i yo'q, faqat reduktor).
export type VehicleType = 'ICE' | 'HYBRID' | 'ELECTRIC';

// Yog' bo'limi: qabul paytida rasmdan AI o'qigan tavsiya (buyurtmaga saqlanadi).
export interface OilRecommendationSnapshot {
  vin?: string;
  vehicleType: VehicleType;
  motorYogTuri: string | null;
  motorLitr: number | null;
  korobkaYogTuri: string | null;
  korobkaLitr: number | null;
  reduktorYogTuri: string | null;
  reduktorLitr: number | null;
  izoh?: string;
}

export interface Car {
  id: number;
  ism: string;
  mashina: string;
  raqam: string;
  tel: string;
  bosqich: string;
  holat: string | null; // 'jarayonda' | 'tulanmagan' | 'tulangan' ...
  bolim: string | null; // 'ustaxona' | 'yog' (null → ustaxona)
  qabul_xodim_id: number;
  qabul_xodim_nomi: string;
  qabul_vaqti: string | null;
  zapchast_nomi: string | null;
  zapchast_vaqti: string | null;
  tayyor_vaqti: string | null;
  topshirilgan_vaqti: string | null;
  created_at: string;
  ish_daqiqa: number; // yopilgan sessiyalar yig'indisi
  ish_boshlandi: string | null; // shu xodimning ochiq sessiyasi (bo'lsa)
  rasxodlar: RasxodLine[]; // shu mashinaga kiritilgan rasxodlar
  rasxod_jami: number; // rasxodlar yig'indisi (kassadan ayirilgan)
  oil_recommendation: OilRecommendationSnapshot | null; // qabulda AI skanerlagan yog' tavsiyasi (bo'lsa)
  services?: { id?: number; nom: string; narx: number; narxsiz?: boolean }[]; // chek uchun xizmatlar
  zap?: number; // zapchastlar jami (narx kutayotgan buyurtmalarda ko'rsatiladi)
}

export function resolveIdentity(authUser: BotAuthUser | null): Identity {
  return { token: authUser?.token || '' };
}

// Token eskirgan yoki bekor bo'lgan bo'lsa, sahifa kirish oynasiga qaytadi.
async function botFetch(identity: Identity, url: string, init: RequestInit = {}) {
  const res = await fetch(url, { ...init, headers: { ...init.headers, 'x-bot-token': identity.token } });
  if (res.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new Event('bot-auth-lost'));
  return res;
}

const postJson = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// Telegram ichida: imzolangan initData token'ga almashtiriladi.
export async function createTelegramSession(initData: string) {
  const res = await fetch('/api/bot-ui/session', postJson({ initData }));
  return res.json();
}

// Brauzerda: kod Telegram'ga yuboriladi, keyin raqam + kod token'ga almashtiriladi.
export async function requestLoginCode(phone: string) {
  await fetch('/api/bot-ui/login-code', postJson({ phone }));
}

export async function loginWithCode(phone: string, code: string) {
  const res = await fetch('/api/bot-ui/session', postJson({ phone, code }));
  return res.json();
}

export function submitOrder(identity: Identity, order: Record<string, unknown>) {
  return botFetch(identity, '/api/bot-ui/submit', postJson(order));
}

export async function fetchCars(identity: Identity) {
  const res = await botFetch(identity, `/api/bot-ui/cars?t=${Date.now()}`);
  return res.json();
}

export async function fetchPoints(identity: Identity) {
  const res = await botFetch(identity, `/api/bot-ui/points?t=${Date.now()}`);
  return res.json();
}

export async function acceptCar(
  identity: Identity,
  data: {
    brand: string;
    model: string;
    plateNumber: string;
    customerPhone: string;
    oilRecommendation?: OilRecommendationSnapshot | null;
  }
) {
  const res = await botFetch(identity, '/api/bot-ui/accept', postJson({ ...data }));
  return res.json();
}

export async function updateStage(
  identity: Identity,
  orderId: number,
  action: 'zapchast_kerak' | 'zapchast_keldi' | 'tayyor' | 'topshirildi' | 'bekor',
  zapchastNomi?: string
) {
  const res = await botFetch(identity, '/api/bot-ui/stage', postJson({ orderId, action, zapchastNomi }));
  return res.json();
}

// Mashinaga rasxod (xarajat) kiritish — summa darrov kassadan (naqd) ayiriladi
// va buyurtmaga (chek/tafsilot) qo'shiladi.
export async function addRasxod(
  identity: Identity,
  orderId: number,
  items: { nom: string; summa: number }[]
) {
  const res = await botFetch(identity, '/api/bot-ui/rasxod', postJson({ orderId, items }));
  return res.json();
}

// Admin yoki boshliq: narxsiz xizmatlarga narx qo'yib, chekni chiqaradi (printerga ketadi).
export async function setServicePrices(
  identity: Identity,
  orderId: number,
  prices: { index: number; narx: number }[]
) {
  const res = await botFetch(identity, '/api/bot-ui/price', postJson({ orderId, prices }));
  return res.json();
}

// Ish vaqtini o'lchash — tezlik bali aynan shunga qarab beriladi.
export async function toggleWorkSession(identity: Identity, orderId: number, action: 'start' | 'stop') {
  const res = await botFetch(identity, '/api/bot-ui/work-session', postJson({ orderId, action }));
  return res.json();
}

// ── Zapchastlar katalogi (faqat boshliq) ─────────────────────────────────────
export interface SparePart {
  id: number;
  nom: string;
  artikul: string | null;
  brand: string | null;
  mashina: string | null;
  rasmlar: string[];
  izoh: string | null;
  narx: number | null;
  bolim?: string | null; // 'ustaxona' | 'yog' (null → ustaxona)
  created_at?: string;
}

export async function fetchSpareParts(identity: Identity) {
  const res = await botFetch(identity, `/api/bot-ui/spare-parts?t=${Date.now()}`);
  return res.json();
}

// id berilsa tahrirlaydi, aks holda yangi qo'shadi.
export async function saveSparePart(identity: Identity, part: Partial<SparePart>, id?: number) {
  const url = id ? `/api/bot-ui/spare-parts/${id}` : '/api/bot-ui/spare-parts';
  const res = await botFetch(identity, url, postJson({ ...part }));
  return res.json();
}

export async function deleteSparePartApi(identity: Identity, id: number) {
  const res = await botFetch(identity, `/api/bot-ui/spare-parts/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function uploadSparePartImage(identity: Identity, dataUrl: string) {
  const res = await botFetch(identity, '/api/bot-ui/spare-parts/upload', postJson({ dataUrl }));
  return res.json();
}

// ── Yog' narxlari (yog' bo'limi: narx VA tannarx, "xizmat"siz foyda) ─────────
export interface OilPrice {
  id: number;
  turi: 'yog' | 'yog_filtri' | 'salon_filtri';
  nom: string;
  mashina: string | null;
  narx: number;    // sotish narxi
  tannarx: number; // sotib olish narxi (sebestoimost)
  created_at?: string;
}

export async function fetchOilPrices(identity: Identity) {
  const res = await botFetch(identity, `/api/bot-ui/oil-prices?t=${Date.now()}`);
  return res.json();
}

// id berilsa tahrirlaydi, aks holda yangi qo'shadi.
export async function saveOilPrice(identity: Identity, price: Partial<OilPrice>, id?: number) {
  const url = id ? `/api/bot-ui/oil-prices/${id}` : '/api/bot-ui/oil-prices';
  const res = await botFetch(identity, url, postJson({ ...price }));
  return res.json();
}

export async function deleteOilPriceApi(identity: Identity, id: number) {
  const res = await botFetch(identity, `/api/bot-ui/oil-prices/${id}`, { method: 'DELETE' });
  return res.json();
}

// ── Yog' bo'limi: texpasport/birka rasmidan AI tanish + yog' tavsiyasi ──────
export interface OilScanRecognized {
  brand: string;
  model: string;
  plateNumber: string;
  vin: string;
  vehicleType: VehicleType;
  found: boolean;
}

export interface OilScanRecommendation {
  motorYogTuri: string | null;
  motorLitr: number | null;
  korobkaYogTuri: string | null;
  korobkaLitr: number | null;
  reduktorYogTuri: string | null;
  reduktorLitr: number | null;
  izoh: string;
}

export async function scanOilCar(identity: Identity, dataUrl: string) {
  const res = await botFetch(identity, '/api/bot-ui/oil-scan', postJson({ dataUrl }));
  return res.json() as Promise<{
    ok: boolean;
    error?: string;
    recognized?: OilScanRecognized;
    recommendation?: OilScanRecommendation;
    fromCache?: boolean;
  }>;
}

// Rasmni brauzerda siqib JPEG data URL qaytaradi (yuklashni tez qiladi).
export function compressImageFile(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas mavjud emas'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error("Rasm o'qib bo'lmadi"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Fayl o'qib bo'lmadi"));
    reader.readAsDataURL(file);
  });
}

// Daqiqani qisqa ko'rinishga: 95 → "1 s 35 daq"
export function fmtDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} daq`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} s ${rest} daq` : `${h} s`;
}

// Qabul qilingan mashina ma'lumotini (raqam / mijoz tel) tahrirlash. Bosqich o'zgarmaydi.
export async function updateCarInfo(
  identity: Identity,
  orderId: number,
  info: { raqam: string; tel: string }
) {
  const res = await botFetch(identity, '/api/bot-ui/stage', postJson({ orderId, action: 'tahrirlash', raqam: info.raqam, tel: info.tel }));
  return res.json();
}

// ── Bosqich meta (nom, emoji, rang) ──────────────────────────────────────────
export const STAGES: Record<string, { label: string; emoji: string; color: string }> = {
  qabul_qilindi: { label: 'Qabul qilindi', emoji: '🟡', color: '#eab308' },
  tamirlanmoqda: { label: "Ta'mirlanmoqda", emoji: '🔧', color: '#3b82f6' },
  zapchast_kutilmoqda: { label: 'Zapchast kutilyapti', emoji: '📦', color: '#f97316' },
  narx_kutilmoqda: { label: 'Narx kutilyapti', emoji: '💲', color: '#94a3b8' },
  tayyor: { label: 'Tayyor', emoji: '✅', color: '#22c55e' },
  topshirildi: { label: 'Topshirildi', emoji: '🚗', color: '#64748b' },
  bekor_qilindi: { label: 'Bekor qilindi', emoji: '❌', color: '#f43f5e' },
};

export function stageMeta(bosqich: string | null) {
  return (bosqich && STAGES[bosqich]) || { label: bosqich || '—', emoji: '•', color: '#94a3b8' };
}

// Toshkent vaqti — kun.oy soat:daqiqa
export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      timeZone: 'Asia/Tashkent',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}
