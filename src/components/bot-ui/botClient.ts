// Bot-ui klient tomoni: xodim identifikatsiyasi, API chaqiruvlari va bosqich meta.

export interface Identity {
  workerPhone: string;
  mechanicChatId: string | number | undefined;
}

export interface Car {
  id: number;
  ism: string;
  mashina: string;
  raqam: string;
  tel: string;
  bosqich: string;
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

// Ish vaqtini o'lchash — tezlik bali aynan shunga qarab beriladi.
export async function toggleWorkSession(identity: Identity, orderId: number, action: 'start' | 'stop') {
  const res = await fetch('/api/bot-ui/work-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, action, ...idBody(identity) }),
  });
  return res.json();
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
