-- Nexus Support P1: KB, macros (canned), CSAT surveys
-- Run in Supabase SQL Editor after supabase-p0.sql

create table if not exists knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text default 'General',
  body text not null default '',
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table knowledge_articles enable row level security;
drop policy if exists "kb read all" on knowledge_articles;
create policy "kb read all" on knowledge_articles for select using (true);
drop policy if exists "kb write auth" on knowledge_articles;
create policy "kb write auth" on knowledge_articles for all to authenticated using (true) with check (true);
drop policy if exists "kb write anon" on knowledge_articles;
create policy "kb write anon" on knowledge_articles for all to anon using (true) with check (true);

create table if not exists canned_responses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  shortcut text,
  created_at timestamptz default now()
);
alter table canned_responses enable row level security;
drop policy if exists "canned read" on canned_responses;
create policy "canned read" on canned_responses for select using (true);
drop policy if exists "canned write" on canned_responses;
create policy "canned write" on canned_responses for all using (true) with check (true);

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  ticket_id text,
  score int not null check (score between 1 and 5),
  comment text,
  customer_name text,
  created_at timestamptz default now()
);
create index if not exists survey_ticket_idx on survey_responses (ticket_id);
alter table survey_responses enable row level security;
drop policy if exists "survey read" on survey_responses;
create policy "survey read" on survey_responses for select using (true);
drop policy if exists "survey insert" on survey_responses;
create policy "survey insert" on survey_responses for insert with check (true);

alter table knowledge_articles add column if not exists published boolean default true;
