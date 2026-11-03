-- 3D konteyner ombori (/parts/konteyner): zapchast qaysi javonda turadi.
-- javon: A/B tomon + bo'lim (1-6) + qavat (1-5), masalan 'B2-3'. NULL — javonga qo'yilmagan.
-- javon_tur: 3D da qanday ko'rinishi (quti, shina, filtr...). NULL — nomidan taxmin qilinadi.
alter table public.parts add column if not exists javon text;
alter table public.parts add column if not exists javon_tur text;

alter table public.parts drop constraint if exists parts_javon_check;
alter table public.parts add constraint parts_javon_check
  check (javon is null or javon ~ '^[AB][1-6]-[1-5]$');

alter table public.parts drop constraint if exists parts_javon_tur_check;
alter table public.parts add constraint parts_javon_tur_check
  check (javon_tur is null or javon_tur in
    ('motor','tormoz','filtr','elektr','osma','moy','shina','kuzov','akkum','boshqa'));

create index if not exists parts_javon_idx on public.parts (javon) where javon is not null;
