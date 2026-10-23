-- =============================================================================
-- RUN THIS IN SUPABASE → SQL EDITOR (once)
-- Creates a pending agents/customers row for every new Auth user so they
-- appear under Users → Pending for admin approval.
-- =============================================================================

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

-- 3) Ensure customers.status exists (approval)
alter table public.customers
  add column if not exists status text default 'pending';

-- 4) Ensure agents.approval_status exists
alter table public.agents
  add column if not exists approval_status text default 'pending';

-- 5) Backfill: Auth users who have NO agent and NO customer profile yet
--    → create a pending row from their metadata role (default customer)
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

-- 6) Admins must be able to update approval (already covered by is_admin_agent policies)
--    Re-assert select so approved agents see everyone for the Users page
drop policy if exists agents_select on public.agents;
create policy agents_select on public.agents
  for select using (
    public.is_approved_agent()
    or user_id = auth.uid()
  );

drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers
  for select using (
    public.is_approved_agent()
    or user_id = auth.uid()
  );

drop policy if exists agents_update on public.agents;
create policy agents_update on public.agents
  for update using (
    public.is_admin_agent()
    or (user_id = auth.uid() and approval_status = 'approved')
  );

drop policy if exists customers_update on public.customers;
create policy customers_update on public.customers
  for update using (
    public.is_admin_agent()
    or user_id = auth.uid()
  );

-- Done. Refresh Users page — pending accounts should appear.
