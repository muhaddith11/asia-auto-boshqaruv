// Bot-ui klient tomoni: xodim identifikatsiyasi, API chaqiruvlari va bosqich meta.

export interface Identity {
  workerPhone: string;
  mechanicChatId: string | number | undefined;
}

// Mashinaga qilingan bitta rasxod (xarajat) — buyurtma zaps ichidan ajratilgan.
export interface RasxodLine {
  nom: string;
  summa: number;
  vaqt?: string | null;
  xodim_nomi?: string | null;
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
}

// URL (?phone=), Telegram foydalanuvchi id, yoki brauzer login — shu tartibda.
export function resolveIdentity(authUser: any): Identity {
  let workerPhone = '';
  let mechanicChatId: string | number | undefined;
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search).get('phone');
    if (p) workerPhone = p;
    const tgId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (tgId) mechanicChatId = tgId;
  }
  if (!workerPhone) workerPhone = authUser?.phone || '';
  if (!mechanicChatId) mechanicChatId = authUser?.telegram || undefined;
  return { workerPhone, mechanicChatId };
}

function idBody(identity: Identity) {
  return { workerPhone: identity.workerPhone, mechanicChatId: identity.mechanicChatId };
}

export async function fetchCars(identity: Identity) {
  const params = new URLSearchParams();
  if (identity.workerPhone) params.set('phone', identity.workerPhone);
  if (identity.mechanicChatId) params.set('tg', String(identity.mechanicChatId));
  params.set('t', String(Date.now()));
  const res = await fetch(`/api/bot-ui/cars?${params.toString()}`);
  return res.json();
}

export async function fetchPoints(identity: Identity) {
  const params = new URLSearchParams();
  if (identity.workerPhone) params.set('phone', identity.workerPhone);
  if (identity.mechanicChatId) params.set('tg', String(identity.mechanicChatId));
  params.set('t', String(Date.now()));
  const res = await fetch(`/api/bot-ui/points?${params.toString()}`);
  return res.json();
}

export async function acceptCar(
  identity: Identity,
  data: { brand: string; model: string; plateNumber: string; customerPhone: string }
) {
  const res = await fetch('/api/bot-ui/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, ...idBody(identity) }),
  });
  return res.json();
}

export async function updateStage(
  identity: Identity,
  orderId: number,
  action: 'zapchast_kerak' | 'zapchast_keldi' | 'tayyor' | 'topshirildi' | 'bekor',
  zapchastNomi?: string
) {
  const res = await fetch('/api/bot-ui/stage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, action, zapchastNomi, ...idBody(identity) }),
  });
  return res.json();
}

// Mashinaga rasxod (xarajat) kiritish — summa darrov kassadan (naqd) ayiriladi
// va buyurtmaga (chek/tafsilot) qo'shiladi.
export async function addRasxod(
  identity: Identity,
  orderId: number,
  items: { nom: string; summa: number }[]
) {
  const res = await fetch('/api/bot-ui/rasxod', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, items, ...idBody(identity) }),
  });
  return res.json();
}

// Ish vaqtini o'lchash — tezlik bali aynan shunga qarab beriladi.
export async function toggleWorkSession(identity: Identity, orderId: number, action: 'start' | 'stop') {
  const res = await fetch('/api/bot-ui/work-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, action, ...idBody(identity) }),
  });
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
  created_at?: string;
}

function identityQuery(identity: Identity) {
  const params = new URLSearchParams();
  if (identity.workerPhone) params.set('phone', identity.workerPhone);
  if (identity.mechanicChatId) params.set('tg', String(identity.mechanicChatId));
  return params;
}

export async function fetchSpareParts(identity: Identity) {
  const params = identityQuery(identity);
  params.set('t', String(Date.now()));
  const res = await fetch(`/api/bot-ui/spare-parts?${params.toString()}`);
  return res.json();
}

// id berilsa tahrirlaydi, aks holda yangi qo'shadi.
export async function saveSparePart(identity: Identity, part: Partial<SparePart>, id?: number) {
  const url = id ? `/api/bot-ui/spare-parts/${id}` : '/api/bot-ui/spare-parts';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...part, ...idBody(identity) }),
  });
  return res.json();
}

export async function deleteSparePartApi(identity: Identity, id: number) {
  const params = identityQuery(identity);
  const res = await fetch(`/api/bot-ui/spare-parts/${id}?${params.toString()}`, { method: 'DELETE' });
  return res.json();
}

export async function uploadSparePartImage(identity: Identity, dataUrl: string) {
  const res = await fetch('/api/bot-ui/spare-parts/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, ...idBody(identity) }),
  });
  return res.json();
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
  const res = await fetch('/api/bot-ui/stage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, action: 'tahrirlash', raqam: info.raqam, tel: info.tel, ...idBody(identity) }),
  });
  return res.json();
}

// ── Bosqich meta (nom, emoji, rang) ──────────────────────────────────────────
export const STAGES: Record<string, { label: string; emoji: string; color: string }> = {
  qabul_qilindi: { label: 'Qabul qilindi', emoji: '🟡', color: '#eab308' },
  tamirlanmoqda: { label: "Ta'mirlanmoqda", emoji: '🔧', color: '#3b82f6' },
  zapchast_kutilmoqda: { label: 'Zapchast kutilyapti', emoji: '📦', color: '#f97316' },
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
