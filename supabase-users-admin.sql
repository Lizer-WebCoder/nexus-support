-- Run once in Supabase SQL Editor for admin Users page
alter table public.agents add column if not exists branch text;
alter table public.customers add column if not exists branch text;
alter table public.customers add column if not exists role text default 'Customer';
