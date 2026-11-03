-- workers.chek_nusxa: har bir chekning doimiy nusxasini oladigan xodimlar.
-- Admin chati (ADMIN_TELEGRAM_ID) kabi ularga borgan chek 24 soatdan keyin o'chirilmaydi.
alter table public.workers
  add column if not exists chek_nusxa boolean not null default false;

-- 2026-11-03: Umarxon ham barcha cheklarni ko'rsin.
update public.workers set chek_nusxa = true where id = 21;
