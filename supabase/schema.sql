-- Supabase 初期スキーマ
-- Supabase ダッシュボードの SQL Editor で実行する

-- 日次メトリクス
create table if not exists metrics_daily (
  date date primary key,
  yt_subscribers integer,
  tt_followers integer,
  ig_followers integer,
  fb_followers integer,
  updated_at timestamptz not null default now()
);

-- TikTok の OAuth トークン（refresh のため）
create table if not exists tiktok_token (
  id integer primary key default 1,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- 公開ダッシュボードは anon キーで読むので、metrics_daily に SELECT 許可
alter table metrics_daily enable row level security;
create policy "Public read metrics" on metrics_daily for select to anon using (true);

-- tiktok_token は service_role のみアクセス可（anon には開けない）
alter table tiktok_token enable row level security;

-- Instagram Graph API の長期トークン（60日、使うたび自動延長される）
create table if not exists instagram_token (
  id integer primary key default 1,
  access_token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint single_row_ig check (id = 1)
);

alter table instagram_token enable row level security;
