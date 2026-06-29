// ─────────────────────────────────────────────────────────────────────────────
// Matn normalizatsiyasi — kirill/lotin "homoglif" chalkashligini bartaraf etadi.
//
// Muammoning ildizi: mashina/brend nomlari erkin matn sifatida kiritiladi va
// foydalanuvchilar kirill "С/о/р" bilan lotin "C/o/p" ni aralashtirib yuboradi
// ("СHEVROLET" vs "CHEVROLET"). Bu funksiya solishtirish va saqlash uchun
// matnni bitta kanonik (lotin, katta harf, ortiqcha belgilarsiz) ko'rinishga keltiradi.
//
// IDEAL yechim — kiritishda tayyor ro'yxatdan tanlash (free-text emas). Shu sababli
// bu funksiyani saqlash paytida ham qo'llaymiz (masalan, useStore.addMashina),
// токи baza kanonik ko'rinishda saqlansin va o'qishdagi tuzatishga kamroq tayanilsin.
// ─────────────────────────────────────────────────────────────────────────────

const HOMOGLYPHS: Record<string, string> = {
  'е': 'e', 'а': 'a', 'о': 'o', 'с': 'c', 'р': 'p', 'х': 'x', 'у': 'y', 'к': 'k', 'і': 'i', 'м': 'm', 'т': 't', 'в': 'v',
  'Е': 'E', 'А': 'A', 'О': 'O', 'С': 'C', 'Р': 'P', 'Х': 'X', 'У': 'Y', 'К': 'K', 'І': 'I', 'М': 'M', 'Т': 'T', 'В': 'V',
  'Н': 'H', 'Ь': '', 'ъ': ''
};

export const normalize = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[еаосрхукімтвЕАОСРХУКІМТВНЬъ]/g, m => HOMOGLYPHS[m] || m)
    .replace(/Chevolet/gi, 'Chevrolet')
    .replace(/[  ᠎ -​  　﻿]/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, '') // nuqta, vergul, chiziqchani olib tashlash — toza solishtirish uchun
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
};
