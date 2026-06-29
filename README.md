# Asia Auto Service — Boshqaruv tizimi

Avtoservis uchun boshqaruv tizimi: mijozlar (CRM), buyurtmalar, xizmatlar, zapchastlar
ombori, xodimlar va maosh, kassa/moliya, hisobotlar, audit jurnali hamda Telegram bot
orqali buyurtma qabul qilish.

## Texnologiyalar

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Supabase** (PostgreSQL) — ma'lumotlar bazasi
- **Zustand** — holat boshqaruvi (client-side store)
- **Telegraf** — Telegram bot
- **Eskiz.uz** — SMS yuborish
- **react-hot-toast** — bildirishnomalar

## O'rnatish

```bash
# 1. Paketlarni o'rnatish
npm install

# 2. .env faylini sozlash (.env.example dan nusxa oling)
cp .env.example .env
#  → ichini o'z qiymatlaringiz bilan to'ldiring

# 3. Ma'lumotlar bazasini tayyorlash
#  Supabase SQL Editor'da db/ papkadagi skriptlarni ishga tushiring,
#  jumladan: db/audit_log.sql (audit jurnali jadvali)

# 4. Dasturni ishga tushirish
npm run dev
# → http://localhost:3000
```

## Skriptlar

| Buyruq | Vazifasi |
|--------|----------|
| `npm run dev` | Lokal server (development) |
| `npm run build` | Production build |
| `npm run start` | Production serverni ishga tushirish |
| `npm run lint` | ESLint tekshiruvi |
| `npm run bot:poll` | Telegram bot pollerini ishga tushirish |

## Rollar (kirish huquqlari)

Tizimda 3 rol bor (`src/lib/auth.ts` da sozlanadi):

| Rol | Huquqlar |
|------|----------|
| **egasi** | Hamma bo'lim (audit, zaxira, xodimlar, hisobotlar) |
| **sherik** | Buyurtma, mijoz, xizmat, zapchast, hisobot, eslatma |
| **xodim** | Faqat operatsion bo'limlar (moliyasiz) |

> ⚠️ Akkaunt parollari hozircha `src/lib/auth.ts` ichida. Ishlatishdan oldin
> ularni o'zgartiring. To'liq xavfsiz auth (parol hash + server session) — keyingi bosqich.

## Loyiha tuzilishi

```
src/
  app/
    (dashboard)/      # Himoyalangan panel sahifalari
    api/              # Backend route'lar (Supabase bilan ishlaydi)
    bot-ui/           # Telegram Web App (mijoz uchun)
  components/         # UI komponentlar
  lib/                # auth, audit, export, normalize, phone yordamchilari
  services/           # smsService, predictionService
  store/              # Zustand store (useStore)
  types/              # TypeScript tiplar
db/                   # SQL sxema fayllari
```

## Eslatma

`AGENTS.md` ga e'tibor bering — bu loyiha Next.js'ning o'zgartirilgan versiyasidan
foydalanadi (masalan, `middleware.ts` o'rniga `proxy.ts`). Kod yozishdan oldin
`node_modules/next/dist/docs/` dagi tegishli qo'llanmani o'qing.
