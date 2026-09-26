-- bot_messages_to_delete: Telegramdan o'chirish natijasini saqlash.
-- Oldin qator natijadan qat'i nazar o'chirib yuborilardi va xato sababini ko'rib bo'lmasdi.
alter table public.bot_messages_to_delete
  add column if not exists status text not null default 'pending',
  add column if not exists attempts int not null default 0,
  add column if not exists last_error text,
  add column if not exists processed_at timestamptz;

create index if not exists bot_messages_to_delete_pending_idx
  on public.bot_messages_to_delete (delete_at)
  where status = 'pending';
