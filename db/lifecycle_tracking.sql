-- ═══════════════════════════════════════════════════════════════════════════
-- Mashina JARAYONINI kuzatish (lifecycle tracking)
-- ───────────────────────────────────────────────────────────────────────────
-- Xodim mashinani QABUL qiladi → ta'mirlaydi → (kerak bo'lsa zapchast kutadi)
-- → tayyor → mijozga TOPSHIRADI. Har bosqichda vaqt va kim yoziladi.
-- Boshliq (Yahyo aka) barcha mashinalarni va vaqtlarni kuzatadi.
--
-- Barcha ustunlar NULLABLE — mavjud 1200+ buyurtma buzilmaydi (ular bosqich=NULL,
-- ya'ni eski "tayyor kiritilgan" buyurtmalar, kuzatuvga tushmaydi).
-- `holat` (to'lov: tulangan/tulanmagan) ALOHIDA qoladi — bu JARAYON bosqichi.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── orders: jarayon bosqichi va vaqtlar ──────────────────────────────────────
-- bosqich qiymatlari:
--   'qabul_qilindi'       🟡 qabul qilindi (ish boshlanishi kutilmoqda/boshlandi)
--   'zapchast_kutilmoqda' 📦 zapchast kerak, kutilmoqda
--   'tamirlanmoqda'       🔧 zapchast keldi / ish davom etmoqda
--   'tayyor'              ✅ ta'mir tugadi, mijoz kutilmoqda
--   'topshirildi'         🚗 mijozga topshirildi (yakunlandi)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bosqich text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS qabul_xodim_id bigint;          -- kim qabul qildi
ALTER TABLE orders ADD COLUMN IF NOT EXISTS qabul_xodim_nomi text;          -- ismi (tez ko'rsatish uchun)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS qabul_vaqti timestamptz;        -- qabul qilingan vaqt
ALTER TABLE orders ADD COLUMN IF NOT EXISTS zapchast_nomi text;             -- kutilayotgan zapchast nomi
ALTER TABLE orders ADD COLUMN IF NOT EXISTS zapchast_vaqti timestamptz;     -- "zapchast kerak" belgilangan vaqt
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tayyor_vaqti timestamptz;       -- tayyor bo'lgan vaqt
ALTER TABLE orders ADD COLUMN IF NOT EXISTS topshirilgan_vaqti timestamptz; -- mijozga topshirilgan vaqt
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_log jsonb DEFAULT '[]'::jsonb; -- to'liq tarix: [{bosqich,vaqt,xodim_id,izoh}]

CREATE INDEX IF NOT EXISTS idx_orders_bosqich ON orders(bosqich);
CREATE INDEX IF NOT EXISTS idx_orders_qabul_xodim ON orders(qabul_xodim_id);

-- ── workers: boshliqni belgilash ─────────────────────────────────────────────
-- Boshliq bo'lganlar botda "barcha mashinalar" kuzatuvini ko'radi (+ o'zi ham
-- mashina qabul qila oladi). Hozircha faqat Yahyo aka (id=2).
ALTER TABLE workers ADD COLUMN IF NOT EXISTS is_boss boolean DEFAULT false;

UPDATE workers SET is_boss = true WHERE id = 2;  -- Yahyo aka = boshliq
