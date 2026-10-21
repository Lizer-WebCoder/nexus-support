-- Nexus Support P2/P3 extras
-- Run after p0 and p1

alter table tickets add column if not exists tags jsonb default '[]'::jsonb;
alter table tickets add column if not exists deleted_at timestamptz;

create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enabled boolean default true,
  trigger text default 'ticket_created',
  condition_field text,
  condition_op text default 'contains',
  condition_value text,
  action text default 'set_priority',
  action_value text,
  created_at timestamptz default now()
);
alter table automations enable row level security;
drop policy if exists "auto all" on automations;
create policy "auto all" on automations for all using (true) with check (true);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  severity text default 'info',
  active boolean default true,
  created_at timestamptz default now()
);
alter table announcements enable row level security;
drop policy if exists "ann all" on announcements;
create policy "ann all" on announcements for all using (true) with check (true);
