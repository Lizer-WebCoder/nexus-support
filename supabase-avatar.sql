-- Run once in Supabase SQL Editor to enable profile photos on agents
alter table public.agents
  add column if not exists avatar_url text;

comment on column public.agents.avatar_url is 'Profile photo data URL or public image URL';
