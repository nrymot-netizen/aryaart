-- Phase 7 slice 1: public drawings and draw-back pairs.
-- Writes go through the service role in Next.js. Anon can only read public rows.

create table if not exists published_profiles (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null check (handle ~ '^ink-[a-z0-9]{6,16}$'),
  created_at timestamptz not null default now()
);

create table if not exists published_artworks (
  id text primary key,
  profile_id uuid not null references published_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  image text not null,
  style text not null,
  subject text not null,
  tags text[] not null default '{}',
  tools text[] not null default '{}',
  ai_disclosure boolean not null default false,
  visibility text not null default 'public',
  published_at date not null,
  price int not null default 40,
  format text not null default 'digital',
  created_at timestamptz not null default now()
);

create table if not exists published_process_logs (
  id text primary key,
  artwork_id text not null references published_artworks(id) on delete cascade,
  paper_color text not null,
  width int not null,
  height int not null,
  ops jsonb not null,
  recorded_at timestamptz not null,
  challenge_id text
);

create table if not exists published_draw_backs (
  id text primary key,
  source_artwork_id text not null,
  reply_artwork_id text not null references published_artworks(id) on delete cascade,
  published_at timestamptz not null
);

create index if not exists published_artworks_created_at_idx on published_artworks (created_at desc);
create index if not exists published_draw_backs_reply_idx on published_draw_backs (reply_artwork_id);

alter table published_profiles enable row level security;
alter table published_artworks enable row level security;
alter table published_process_logs enable row level security;
alter table published_draw_backs enable row level security;

create policy "public read profiles" on published_profiles for select using (true);
create policy "public read artworks" on published_artworks for select using (visibility = 'public');
create policy "public read process logs" on published_process_logs for select using (true);
create policy "public read draw-backs" on published_draw_backs for select using (true);
