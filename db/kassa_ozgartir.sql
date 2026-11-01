-- Kassa qoldig'ini ATOMAR o'zgartirish.
-- Qo'shish/ayirish bitta UPDATE ichida bajariladi, shu sabab bir vaqtdagi ikki
-- so'rov (dashboard to'lovi + bot rasxodi) bir-birining yozuvini bosib ketmaydi.
-- Faqat server (service_role) chaqira oladi.

create or replace function public.kassa_ozgartir(p_naqd numeric, p_karta numeric)
returns setof public.kassa
language sql
set search_path = ''
as $$
  update public.kassa
     set naqd = naqd + p_naqd,
         karta = karta + p_karta,
         updated_at = now()
   where id = 1
  returning *;
$$;

revoke all on function public.kassa_ozgartir(numeric, numeric) from public, anon, authenticated;
grant execute on function public.kassa_ozgartir(numeric, numeric) to service_role;
