-- UK Driver Hub: pictures for news stories (19 October 2026)
-- Run this ONCE in Supabase: SQL Editor -> + New query -> paste -> Run.
-- Expect: "Success. No rows returned".
-- Safe to run twice (it skips anything that already exists).
--
-- What it does:
--   1. Adds a "picture address" column to the news table (image_url).
--   2. Adds a small table (news_images) that holds the pictures that come
--      with the news SQL files, so you never have to upload them by hand.
--   3. Lets visitors see those pictures (read only).

-- 1. Picture address for each story (empty for older stories)
alter table public.news add column if not exists image_url text;

-- 2. Table for pictures that come inside the news SQL files.
--    Each picture has a short name (key), e.g. "2026-10-19-oxford-street".
create table if not exists public.news_images (
  key text primary key,
  content_type text not null default 'image/jpeg',
  data_base64 text not null,
  created_at timestamptz not null default now()
);

-- 3. Everyone can view the pictures; only you (via the SQL Editor) can add them.
alter table public.news_images enable row level security;

drop policy if exists "Anyone can view news pictures" on public.news_images;
create policy "Anyone can view news pictures"
  on public.news_images for select
  to anon, authenticated
  using (true);

grant select on public.news_images to anon, authenticated;
