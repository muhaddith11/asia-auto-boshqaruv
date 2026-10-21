-- Davomat — xodim telefoni ishxona WiFi'iga ulanganini skaner aniqlaydi.
--
-- Ishxona routeri (TP-Link XX530v, provayderniki) o'zi hech kimga xabar bera
-- olmaydi, Vercel serveri esa ishxona tarmog'iga kira olmaydi. Shuning uchun
-- tarmoq ICHIDAGI kompyuter (davomat-skaner/skaner.ps1) har daqiqada kim
-- ulanganini /api/attendance/scan ga yuboradi.
--
-- Xom ma'lumot — qurilma (MAC) bo'yicha: telefon xodimga keyin bog'lansa ham
-- o'sha kungi kelgan vaqti yo'qolmaydi. Xodim davomati o'qishda hisoblanadi.
--
-- Qo'lda Supabase SQL editorda ishga tushiriladi (db/work_sessions.sql kabi).

-- Tarmoqda ko'ringan har bir qurilma. Telefonlar har WiFi uchun alohida
-- "yashirin" MAC ishlatadi, lekin bitta tarmoqda u o'zgarmaydi.
create table if not exists public.wifi_devices (
  mac         text primary key,                 -- 'aa:bb:cc:dd:ee:ff' (kichik harf)
  worker_id   bigint references workers(id) on delete set null,
  ignored     boolean not null default false,   -- printer, TV, kamera — ro'yxatda turmasin
  label       text,
  ip          text,
  first_seen  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);

create index if not exists wifi_devices_worker_idx on public.wifi_devices (worker_id);

-- Qurilma kuniga bitta qator: o'sha kuni birinchi va oxirgi ko'ringan vaqti.
create table if not exists public.wifi_presence (
  mac         text not null references wifi_devices(mac) on delete cascade,
  day         date not null,                    -- Toshkent kuni
  first_seen  timestamptz not null,
  last_seen   timestamptz not null,
  primary key (mac, day)
);

create index if not exists wifi_presence_day_idx on public.wifi_presence (day);

-- Kun holati: skaner qachon yoqilgan (undan oldin kelganlar vaqti aniq emas)
-- va boshliqqa nima yuborilgan.
create table if not exists public.attendance_days (
  day             date primary key,
  scanner_first   timestamptz not null,
  scanner_last    timestamptz not null,
  report_sent_at  timestamptz,
  late_notified   bigint[] not null default '{}' -- hisobotdan keyin "keldi" xabari ketgan xodimlar
);

-- Yagona sozlama qatori (id = 1).
create table if not exists public.attendance_settings (
  id           int primary key default 1 check (id = 1),
  work_start   time not null default '09:00',
  report_time  time not null default '09:30',
  notify       boolean not null default false,  -- sinov tugaguncha boshliqqa yuborilmaydi
  scanner_key  text not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
);

insert into public.attendance_settings (id) values (1) on conflict (id) do nothing;

alter table public.wifi_devices        enable row level security;
alter table public.wifi_presence       enable row level security;
alter table public.attendance_days     enable row level security;
alter table public.attendance_settings enable row level security;
