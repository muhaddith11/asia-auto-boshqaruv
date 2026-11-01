-- Bot-ui'ga brauzerdan kirish kodi: xodimning Telegram'iga yuboriladi.
-- Kodning o'zi saqlanmaydi, faqat imzolangan xeshi. Har xodimda bitta faol kod.
-- RLS yoqilgan va policy yo'q: faqat server (service_role) o'qiy oladi.

create table if not exists public.bot_login_codes (
  worker_id bigint primary key references public.workers(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.bot_login_codes enable row level security;
