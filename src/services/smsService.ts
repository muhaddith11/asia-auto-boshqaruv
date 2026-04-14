// Mock SMS Service for AutoServis Pro
// In production, integrate with Eskiz.uz or Twilio

export const sendSMS = async (phone: string, message: string) => {
  console.log(`[SMS SERVICE] Sending to ${phone}: ${message}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Logic for production:
  /*
  const response = await fetch('https://api.eskiz.uz/v1/message/sms/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.ESKIZ_TOKEN}` },
    body: JSON.stringify({ mobile_phone: phone, message })
  });
  return response.json();
  */
  
  return { success: true, messageId: Math.random().toString(36).substring(7) };
};

export const getStatusMessage = (status: string, orderId: string, mashina: string) => {
  const templates: Record<string, string> = {
    'yaratildi': `Assalomu alaykum! Sizing #${orderId} raqamli buyurtmangiz qabul qilindi. Mashina: ${mashina}. AsiaAutoService.`,
    'tamirlanmoqda': `Hurmatli mijoz! Sizning #${orderId} buyurtmangiz bo'yicha ishlar boshlandi. Mashina: ${mashina}. AsiaAutoService.`,
    'tulangan': `Xushxabar! Sizning #${orderId} buyurtmangiz bo'yicha barcha ishlar yakunlandi. Mashina: ${mashina}. Uni olib ketishingiz mumkin. AsiaAutoService.`,
    'bekor qilingan': `Afsuski, sizing #${orderId} buyurtmangiz bekor qilindi. Batafsil ma'lumot uchun aloqaga chiqing. AsiaAutoService.`
  };
  
  return templates[status] || templates['yaratildi'];
};
