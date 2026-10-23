-- =============================================================================
-- RUN THIS IN SUPABASE → SQL EDITOR (once)
-- Fixes missing customers columns, then auto-creates pending profiles on signup.
-- =============================================================================

-- 0) Align customers table with what the app expects
alter table public.customers
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.customers
  add column if not exists status text default 'pending';

alter table public.customers
  add column if not exists email text;

alter table public.customers
  add column if not exists name text;

-- Unique on user_id (ignore if already exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'customers_user_id_key'
      and conrelid = 'public.customers'::regclass
  ) then
    alter table public.customers
      add constraint customers_user_id_key unique (user_id);
  end if;
exception when others then
  null;
end $$;

create index if not exists customers_user_id_idx on public.customers (user_id);
create index if not exists customers_email_idx on public.customers (email);

-- Agents columns (safe if already present)
alter table public.agents
  add column if not exists approval_status text default 'pending';

alter table public.agents
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.agents
  add column if not exists email text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'agents_user_id_key'
      and conrelid = 'public.agents'::regclass
  ) then
    alter table public.agents
      add constraint agents_user_id_key unique (user_id);
  end if;
exception when others then
  null;
end $$;

-- 1) Trigger function: runs as security definer (bypasses RLS)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r text := lower(coalesce(new.raw_user_meta_data->>'role', 'customer'));
  n text := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(new.email, '@', 1)
  );
  ini text;
begin
  ini := upper(left(regexp_replace(n, '\s+', '', 'g'), 2));
  if length(ini) < 1 then
    ini := 'US';
  end if;

  if r = 'agent' or r = 'admin' then
    insert into public.agents (
      user_id, email, name, initials, role, status, approval_status, is_admin
    ) values (
      new.id,
      lower(new.email),
      n,
      ini,
      case when r = 'admin' then 'Admin' else 'Agent' end,
      'offline',
      'pending',
      false
    )
    on conflict (user_id) do nothing;
  else
    insert into public.customers (
      user_id, email, name, status
    ) values (
      new.id,
      lower(new.email),
      n,
      'pending'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

-- 2) Fire after every new Auth user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 3) Backfill Auth users who have no agent and no customer profile
insert into public.customers (user_id, email, name, status)
select
  u.id,
  lower(u.email),
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    split_part(u.email, '@', 1)
  ),
  'pending'
from auth.users u
where lower(coalesce(u.raw_user_meta_data->>'role', 'customer')) not in ('agent', 'admin')
  and not exists (select 1 from public.customers c where c.user_id = u.id)
  and not exists (select 1 from public.agents a where a.user_id = u.id)
  and u.email is not null
on conflict (user_id) do nothing;

insert into public.agents (user_id, email, name, initials, role, status, approval_status, is_admin)
select
  u.id,
  lower(u.email),
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    split_part(u.email, '@', 1)
  ),
  upper(left(regexp_replace(
    coalesce(
      nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
      split_part(u.email, '@', 1)
    ), '\s+', '', 'g'), 2)),
  'Agent',
  'offline',
  'pending',
  false
from auth.users u
where lower(coalesce(u.raw_user_meta_data->>'role', 'customer')) in ('agent', 'admin')
  and not exists (select 1 from public.agents a where a.user_id = u.id)
  and u.email is not null
on conflict (user_id) do nothing;

-- 4) RLS helpers
create or replace function public.is_approved_agent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.agents
    where user_id = auth.uid()
      and coalesce(approval_status, 'approved') = 'approved'
  );
$$;

create or replace function public.is_admin_agent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.agents
    where user_id = auth.uid()
      and coalesce(approval_status, 'approved') = 'approved'
      and is_admin = true
  );
$$;

alter table public.agents enable row level security;
alter table public.customers enable row level security;

drop policy if exists agents_select on public.agents;
create policy agents_select on public.agents
  for select using (
    public.is_approved_agent()
    or user_id = auth.uid()
  );

drop policy if exists agents_insert on public.agents;
create policy agents_insert on public.agents
  for insert with check (
    public.is_admin_agent()
    or (user_id = auth.uid() and coalesce(approval_status, 'pending') = 'pending')
  );

drop policy if exists agents_update on public.agents;
create policy agents_update on public.agents
  for update using (
    public.is_admin_agent()
    or (user_id = auth.uid() and coalesce(approval_status, 'approved') = 'approved')
  );

drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers
  for select using (
    public.is_approved_agent()
    or user_id = auth.uid()
  );

drop policy if exists customers_insert on public.customers;
create policy customers_insert on public.customers
  for insert with check (
    public.is_approved_agent()
    or user_id = auth.uid()
  );

drop policy if exists customers_update on public.customers;
create policy customers_update on public.customers
  for update using (
    public.is_admin_agent()
    or user_id = auth.uid()
  );

-- Done. Refresh Users page — pending accounts should appear.
