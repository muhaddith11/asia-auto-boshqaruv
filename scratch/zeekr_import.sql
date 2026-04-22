-- ============================================================
-- ZEEKR mashinalar va xizmatlarni bazaga qo'shish
-- Supabase → SQL Editor → Run
-- ============================================================

-- 1. ZEEKR mashinalarini cars_list ga qo'shish
INSERT INTO cars_list (brand, name)
VALUES
  ('ZEEKR', '001'),
  ('ZEEKR', '007'),
  ('ZEEKR', '7X'),
  ('ZEEKR', '9X')
ON CONFLICT DO NOTHING;

-- 2. Xizmatlarni services_list ga qo'shish (4 model x 11 xizmat = 44 ta)

INSERT INTO services_list (brand, car_model, name, price, stavka)
VALUES
  -- ── ZEEKR 001 ───────────────────────────────────────────
  ('ZEEKR', '001', '🔍 Diagnostika',                         100000,    0),
  ('ZEEKR', '001', '🔋 Batareya holatini tekshirish',         200000,    0),
  ('ZEEKR', '001', '🧵 Simlarni to''g''irlash (Izolatsiya)', 500000,    0),
  ('ZEEKR', '001', '🇷🇺 Russifikatsiya (Rus tilida qilish)', 1200000,   0),
  ('ZEEKR', '001', '📱 Ilovalar (App) o''rnatish',           100000,    0),
  ('ZEEKR', '001', '🛣️ Probeg tekshirish',                   100000,    0),
  ('ZEEKR', '001', '🛞 Batareya yechish',                    12000000,  0),
  ('ZEEKR', '001', '🔌 Zaryadlash portini remonti',           600000,    0),
  ('ZEEKR', '001', '🚫 Tabloda datchik o''chirish',           100000,    0),
  ('ZEEKR', '001', '🌀 Konditsioner remont',                  600000,    0),
  ('ZEEKR', '001', '⚡ Invertor holatini tekshirish',         100000,    0),

  -- ── ZEEKR 007 ───────────────────────────────────────────
  ('ZEEKR', '007', '🔍 Diagnostika',                         100000,    0),
  ('ZEEKR', '007', '🔋 Batareya holatini tekshirish',         200000,    0),
  ('ZEEKR', '007', '🧵 Simlarni to''g''irlash (Izolatsiya)', 500000,    0),
  ('ZEEKR', '007', '🇷🇺 Russifikatsiya (Rus tilida qilish)', 1200000,   0),
  ('ZEEKR', '007', '📱 Ilovalar (App) o''rnatish',           100000,    0),
  ('ZEEKR', '007', '🛣️ Probeg tekshirish',                   100000,    0),
  ('ZEEKR', '007', '🛞 Batareya yechish',                    12000000,  0),
  ('ZEEKR', '007', '🔌 Zaryadlash portini remonti',           600000,    0),
  ('ZEEKR', '007', '🚫 Tabloda datchik o''chirish',           100000,    0),
  ('ZEEKR', '007', '🌀 Konditsioner remont',                  600000,    0),
  ('ZEEKR', '007', '⚡ Invertor holatini tekshirish',         100000,    0),

  -- ── ZEEKR 7X ────────────────────────────────────────────
  ('ZEEKR', '7X',  '🔍 Diagnostika',                         100000,    0),
  ('ZEEKR', '7X',  '🔋 Batareya holatini tekshirish',         200000,    0),
  ('ZEEKR', '7X',  '🧵 Simlarni to''g''irlash (Izolatsiya)', 500000,    0),
  ('ZEEKR', '7X',  '🇷🇺 Russifikatsiya (Rus tilida qilish)', 1200000,   0),
  ('ZEEKR', '7X',  '📱 Ilovalar (App) o''rnatish',           100000,    0),
  ('ZEEKR', '7X',  '🛣️ Probeg tekshirish',                   100000,    0),
  ('ZEEKR', '7X',  '🛞 Batareya yechish',                    12000000,  0),
  ('ZEEKR', '7X',  '🔌 Zaryadlash portini remonti',           600000,    0),
  ('ZEEKR', '7X',  '🚫 Tabloda datchik o''chirish',           100000,    0),
  ('ZEEKR', '7X',  '🌀 Konditsioner remont',                  600000,    0),
  ('ZEEKR', '7X',  '⚡ Invertor holatini tekshirish',         100000,    0),

  -- ── ZEEKR 9X ────────────────────────────────────────────
  ('ZEEKR', '9X',  '🔍 Diagnostika',                         100000,    0),
  ('ZEEKR', '9X',  '🔋 Batareya holatini tekshirish',         200000,    0),
  ('ZEEKR', '9X',  '🧵 Simlarni to''g''irlash (Izolatsiya)', 500000,    0),
  ('ZEEKR', '9X',  '🇷🇺 Russifikatsiya (Rus tilida qilish)', 1200000,   0),
  ('ZEEKR', '9X',  '📱 Ilovalar (App) o''rnatish',           100000,    0),
  ('ZEEKR', '9X',  '🛣️ Probeg tekshirish',                   100000,    0),
  ('ZEEKR', '9X',  '🛞 Batareya yechish',                    12000000,  0),
  ('ZEEKR', '9X',  '🔌 Zaryadlash portini remonti',           600000,    0),
  ('ZEEKR', '9X',  '🚫 Tabloda datchik o''chirish',           100000,    0),
  ('ZEEKR', '9X',  '🌀 Konditsioner remont',                  600000,    0),
  ('ZEEKR', '9X',  '⚡ Invertor holatini tekshirish',         100000,    0)

ON CONFLICT (name, brand, car_model) DO UPDATE
  SET price = EXCLUDED.price;

-- ── Tekshirish ──────────────────────────────────────────────
-- Qo'shilgan mashinalar:
SELECT * FROM cars_list WHERE brand = 'ZEEKR' ORDER BY name;

-- Qo'shilgan xizmatlar soni (44 ta bo'lishi kerak):
SELECT car_model, COUNT(*) as xizmatlar_soni
FROM services_list
WHERE brand = 'ZEEKR'
GROUP BY car_model
ORDER BY car_model;
