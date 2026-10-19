-- Nexus Support Schema
-- Run this once in Supabase → SQL Editor

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null,
  role text not null default 'Agent',
  status text not null default 'online' check (status in ('online','busy','away','offline')),
  color text not null default 'bg-sky-500',
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tickets_status_idx on tickets(status);
create index if not exists tickets_priority_idx on tickets(priority);
create index if not exists tickets_assignee_idx on tickets(assignee_id);
create index if not exists tickets_created_idx on tickets(created_at desc);

alter table agents enable row level security;
alter table customers enable row level security;
alter table tickets enable row level security;

create policy "allow all agents" on agents for all using (true) with check (true);
create policy "allow all customers" on customers for all using (true) with check (true);
create policy "allow all tickets" on tickets for all using (true) with check (true);

insert into agents (name, initials, role, status, color) values
  ('Sarah Chen', 'SC', 'Lead', 'online', 'bg-emerald-500'),
  ('Marcus Reed', 'MR', 'Senior', 'busy', 'bg-amber-500'),
  ('Aisha Lane', 'AL', 'Agent', 'online', 'bg-sky-500'),
  ('Tomás García', 'TG', 'Agent', 'online', 'bg-violet-500'),
  ('Rachel Kim', 'RK', 'Senior', 'away', 'bg-rose-500'),
  ('David Okonkwo', 'DO', 'Agent', 'online', 'bg-indigo-500');

insert into customers (name, email, company) values
  ('Acme Corp', 'billing@acme.com', 'Acme Corp'),
  ('TechNova Inc', 'support@technova.io', 'TechNova Inc'),
  ('DataFlow Systems', 'ops@dataflow.io', 'DataFlow Systems'),
  ('BrightPath LLC', 'hello@brightpath.com', 'BrightPath LLC'),
  ('MobileFirst Co', 'dev@mobilefirst.app', 'MobileFirst Co'),
  ('GlobalTrade Ltd', 'finance@globaltrade.com', 'GlobalTrade Ltd');

insert into tickets (id, title, description, priority, status, channel, customer_name, created_at) values
  ('NX-2841', 'Billing mismatch on enterprise subscription', 'Customer was charged twice for the annual plan.', 'high', 'open', 'email', 'Acme Corp', now() - interval '1 day'),
  ('NX-2839', 'SSO login failing for Okta users', 'Users redirected to error page after Okta auth.', 'critical', 'open', 'chat', 'TechNova Inc', now() - interval '5 hours'),
  ('NX-2837', 'API rate limit exceeded unexpectedly', 'Production API hitting 429s under normal load.', 'high', 'pending', 'portal', 'DataFlow Systems', now() - interval '8 hours'),
  ('NX-2835', 'Feature request: bulk ticket export', 'Need CSV/JSON export for closed tickets.', 'low', 'new', 'email', 'BrightPath LLC', now() - interval '10 hours'),
  ('NX-2832', 'Mobile app crashes on iOS 18', 'Crash on launch after updating to iOS 18.1.', 'critical', 'open', 'chat', 'MobileFirst Co', now() - interval '12 hours'),
  ('NX-2828', 'Incorrect tax calculation on invoice', 'VAT applied incorrectly for EU customers.', 'medium', 'on-hold', 'email', 'GlobalTrade Ltd', now() - interval '2 days'),
  ('NX-2825', 'Password reset emails not arriving', 'Multiple users report missing reset links.', 'high', 'open', 'email', 'Acme Corp', now() - interval '3 hours'),
  ('NX-2821', 'Dashboard charts loading slowly', 'Ticket pulse chart takes >8s on first load.', 'medium', 'new', 'portal', 'TechNova Inc', now() - interval '6 hours'),
  ('NX-2818', 'Cannot attach files larger than 5MB', 'Upload fails silently for larger screenshots.', 'medium', 'pending', 'chat', 'DataFlow Systems', now() - interval '1 day'),
  ('NX-2814', 'Dark mode preference not saved', 'Setting resets on every login.', 'low', 'resolved', 'portal', 'BrightPath LLC', now() - interval '4 hours');
