-- SnapQuiz AI: ตารางเดียวสำหรับชุดทบทวน
-- วางสคริปต์นี้ใน Supabase SQL Editor แล้วกด Run

create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  source_hash text not null unique check (source_hash ~ '^[a-f0-9]{64}$'),
  content_json jsonb not null,
  created_at timestamptz not null default now(),
  constraint decks_content_shape check (
    jsonb_typeof(content_json) = 'object'
    and content_json ? 'title'
    and content_json ? 'cards'
    and content_json ? 'quizzes'
  )
);

create index if not exists decks_created_at_idx
  on public.decks (created_at desc);

alter table public.decks enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, delete on table public.decks to anon, authenticated;

drop policy if exists "public read decks" on public.decks;
create policy "public read decks"
  on public.decks
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public insert decks" on public.decks;
create policy "public insert decks"
  on public.decks
  for insert
  to anon, authenticated
  with check (
    char_length(title) between 1 and 120
    and source_hash ~ '^[a-f0-9]{64}$'
    and jsonb_typeof(content_json) = 'object'
  );

drop policy if exists "public delete decks" on public.decks;
create policy "public delete decks"
  on public.decks
  for delete
  to anon, authenticated
  using (true);

-- ไม่เปิด update ให้ anon
-- คีย์ anon อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น เบราว์เซอร์อ่านและลบชุดข้อสอบผ่านหน้า Next.js
