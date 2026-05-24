// SMS Service — Eskiz.uz orqali haqiqiy SMS yuboradi
// Server tomoni: /api/send-sms/route.ts

export const sendSMS = async (phone: string, message: string) => {
  const res = await fetch('/api/send-sms', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ phone, message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'SMS yuborishda xatolik yuz berdi');
  }

  return res.json();
};

export const getStatusMessage = (status: string, orderId: string, mashina: string) => {
  const templates: Record<string, string> = {
    'yaratildi':
      `Assalomu alaykum! Sizning #${orderId} raqamli buyurtmangiz qabul qilindi. Mashina: ${mashina}. AsiaAutoService.`,
    'tamirlanmoqda':
      `Hurmatli mijoz! #${orderId} buyurtmangiz bo'yicha ishlar boshlandi. Mashina: ${mashina}. AsiaAutoService.`,
    'tulangan':
      `Xushxabar! #${orderId} buyurtmangiz yakunlandi. Mashinangizni olib ketishingiz mumkin. AsiaAutoService.`,
    'bekor qilingan':
      `Afsuski, #${orderId} buyurtmangiz bekor qilindi. Batafsil ma'lumot uchun biz bilan bog'laning. AsiaAutoService.`,
  };

  return templates[status] || templates['yaratildi'];
};
