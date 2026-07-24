'use client';
import { useEffect } from 'react';

export default function PWAAux() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    // Bot-ui — Telegram mini app; SW kerak emas va yangilanishlarга (kesh) xalaqit
    // beradi. Shu sahifada mavjud SW'larni o'chiramiz va ro'yxatdan o'tkazmaymiz.
    if (window.location.pathname.startsWith('/bot-ui')) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }, []);
  return null;
}
