-- Nexus Support P0: storage, audit, RLS helpers, email inbound
-- Run in Supabase SQL Editor

-- Attachments bucket (public read for ticket/chat files)
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

drop policy if exists "attachments public read" on storage.objects;
create policy "attachments public read"
  on storage.objects for select
  using (bucket_id = 'attachments');

drop policy if exists "attachments authenticated upload" on storage.objects;
create policy "attachments authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'attachments');

drop policy if exists "attachments authenticated update" on storage.objects;
create policy "attachments authenticated update"
  on storage.objects for update
  using (bucket_id = 'attachments');

drop policy if exists "attachments authenticated delete" on storage.objects;
create policy "attachments authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'attachments');

-- Audit log
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  entity_id text not null,
  action text not null,
  detail text,
  actor text,
  created_at timestamptz default now()
);
create index if not exists audit_log_created_idx on audit_log (created_at desc);
alter table audit_log enable row level security;
drop policy if exists "audit read auth" on audit_log;
create policy "audit read auth" on audit_log for select to authenticated using (true);
drop policy if exists "audit insert auth" on audit_log;
create policy "audit insert auth" on audit_log for insert to authenticated with check (true);
drop policy if exists "audit insert anon" on audit_log;
create policy "audit insert anon" on audit_log for insert to anon with check (true);

-- Email inbound log (webhook writes here; app can create tickets from rows)
create table if not exists email_inbound (
  id uuid primary key default gen_random_uuid(),
  from_email text,
  from_name text,
  subject text,
  body text,
  ticket_id text,
  processed boolean default false,
  raw jsonb,
  created_at timestamptz default now()
);
create index if not exists email_inbound_created_idx on email_inbound (created_at desc);
alter table email_inbound enable row level security;
drop policy if exists "email_inbound read auth" on email_inbound;
create policy "email_inbound read auth" on email_inbound for select to authenticated using (true);
drop policy if exists "email_inbound insert" on email_inbound;
create policy "email_inbound insert" on email_inbound for insert with check (true);
drop policy if exists "email_inbound update auth" on email_inbound;
create policy "email_inbound update auth" on email_inbound for update to authenticated using (true);

-- Ensure ticket / chat meta columns
alter table tickets add column if not exists branch text;
alter table tickets add column if not exists attachments jsonb default '[]'::jsonb;
alter table tickets add column if not exists deleted_at timestamptz;
alter table chat_conversations add column if not exists branch text;
alter table chat_conversations add column if not exists ticket_id text;
alter table agents add column if not exists is_admin boolean default false;
alter table agents add column if not exists branch text;
alter table agents add column if not exists skills jsonb default '[]'::jsonb;

-- Basic agent/admin helpers (adjust if you already have stricter policies)
-- Prefer: only authenticated users mutate tickets; public can insert portal tickets via anon if needed.
