-- Nexus Support — safe to re-run in Supabase SQL Editor

-- Agents (optional profile linked to auth.users)
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  initials text not null,
  role text not null default 'Agent',
  status text not null default 'online' check (status in ('online','busy','away','offline')),
  color text not null default 'bg-sky-500',
  email text,
  created_at timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  company text,
  created_at timestamptz default now()
);

create table if not exists tickets (
  id text primary key,
  title text not null,
  description text default '',
  priority text not null default 'medium' check (priority in ('critical','high','medium','low')),
  status text not null default 'new' check (status in ('new','open','pending','resolved','on-hold')),
  channel text not null default 'email' check (channel in ('email','chat','phone','portal','social')),
  assignee_id uuid references agents(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  customer_name text,
  customer_email text,
  notes jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tickets_status_idx on tickets(status);
create index if not exists tickets_priority_idx on tickets(priority);
create index if not exists tickets_created_idx on tickets(created_at desc);

alter table agents enable row level security;
alter table customers enable row level security;
alter table tickets enable row level security;

-- Drop all known policies so this script can be re-run safely
drop policy if exists "allow all agents" on agents;
drop policy if exists "allow all customers" on customers;
drop policy if exists "allow all tickets" on tickets;
drop policy if exists "Public read/write agents" on agents;
drop policy if exists "Public read/write customers" on customers;
drop policy if exists "Public read/write tickets" on tickets;
drop policy if exists "agents_auth_all" on agents;
drop policy if exists "customers_auth_all" on customers;
drop policy if exists "tickets_auth_all" on tickets;
drop policy if exists "tickets_anon_insert" on tickets;
drop policy if exists "tickets_anon_select" on tickets;
drop policy if exists "agents_anon_select" on agents;
drop policy if exists "customers_anon_select" on customers;

-- Authenticated agents: full access
create policy "agents_auth_all" on agents for all to authenticated using (true) with check (true);
create policy "customers_auth_all" on customers for all to authenticated using (true) with check (true);
create policy "tickets_auth_all" on tickets for all to authenticated using (true) with check (true);

-- Public portal: anon can insert + read tickets; read agents/customers
create policy "tickets_anon_insert" on tickets for insert to anon with check (true);
create policy "tickets_anon_select" on tickets for select to anon using (true);
create policy "agents_anon_select" on agents for select to anon using (true);
create policy "customers_anon_select" on customers for select to anon using (true);

-- Seed sample data only when tables are empty (safe on re-run)
insert into agents (name, initials, role, status, color, email)
select * from (values
  ('Sarah Chen', 'SC', 'Lead', 'online', 'bg-emerald-500', 'sarah@nexus.support'),
  ('Marcus Reed', 'MR', 'Senior', 'busy', 'bg-amber-500', 'marcus@nexus.support'),
  ('Aisha Lane', 'AL', 'Agent', 'online', 'bg-sky-500', 'aisha@nexus.support'),
  ('Tomás García', 'TG', 'Agent', 'online', 'bg-violet-500', 'tomas@nexus.support'),
  ('Rachel Kim', 'RK', 'Senior', 'away', 'bg-rose-500', 'rachel@nexus.support'),
  ('David Okonkwo', 'DO', 'Agent', 'online', 'bg-indigo-500', 'david@nexus.support')
) as v(name, initials, role, status, color, email)
where not exists (select 1 from agents limit 1);

insert into customers (name, email, company)
select * from (values
  ('Acme Corp', 'billing@acme.com', 'Acme Corp'),
  ('TechNova Inc', 'support@technova.io', 'TechNova Inc'),
  ('DataFlow Systems', 'ops@dataflow.io', 'DataFlow Systems'),
  ('BrightPath LLC', 'hello@brightpath.com', 'BrightPath LLC'),
  ('MobileFirst Co', 'dev@mobilefirst.app', 'MobileFirst Co'),
  ('GlobalTrade Ltd', 'finance@globaltrade.com', 'GlobalTrade Ltd')
) as v(name, email, company)
where not exists (select 1 from customers limit 1);

insert into tickets (id, title, description, priority, status, channel, customer_name, customer_email, created_at)
select * from (values
  ('NX-2841', 'Billing mismatch on enterprise subscription', 'Customer was charged twice for the annual plan.', 'high', 'open', 'email', 'Acme Corp', 'billing@acme.com', now() - interval '1 day'),
  ('NX-2839', 'SSO login failing for Okta users', 'Users redirected to error page after Okta auth.', 'critical', 'open', 'chat', 'TechNova Inc', 'support@technova.io', now() - interval '5 hours'),
  ('NX-2837', 'API rate limit exceeded unexpectedly', 'Production API hitting 429s under normal load.', 'high', 'pending', 'portal', 'DataFlow Systems', 'ops@dataflow.io', now() - interval '8 hours'),
  ('NX-2835', 'Feature request: bulk ticket export', 'Need CSV/JSON export for closed tickets.', 'low', 'new', 'email', 'BrightPath LLC', 'hello@brightpath.com', now() - interval '10 hours'),
  ('NX-2832', 'Mobile app crashes on iOS 18', 'Crash on launch after updating to iOS 18.1.', 'critical', 'open', 'chat', 'MobileFirst Co', 'dev@mobilefirst.app', now() - interval '12 hours')
) as v(id, title, description, priority, status, channel, customer_name, customer_email, created_at)
where not exists (select 1 from tickets limit 1);
