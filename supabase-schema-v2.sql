-- Nexus Support v2 — run once after the base schema
-- Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS)

-- Extend agents
alter table agents add column if not exists phone text;
alter table agents add column if not exists timezone text default 'UTC';
alter table agents add column if not exists is_admin boolean default false;
alter table agents add column if not exists bio text;

-- Extend tickets
alter table tickets add column if not exists sla_due_at timestamptz;
alter table tickets add column if not exists first_response_at timestamptz;
alter table tickets add column if not exists tags text[] default '{}';
alter table tickets add column if not exists messages jsonb default '[]'::jsonb;

-- Knowledge articles
create table if not exists knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  body text not null default '',
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Live chat
create table if not exists chat_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text,
  status text not null default 'waiting' check (status in ('active','waiting','ended')),
  preview text default '',
  unread int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references chat_conversations(id) on delete cascade,
  sender text not null check (sender in ('agent','customer')),
  text text not null,
  created_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text default '',
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Automations
create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enabled boolean default true,
  trigger text not null default 'ticket_created',
  condition_field text,
  condition_op text default 'contains',
  condition_value text,
  action text not null default 'set_priority',
  action_value text,
  created_at timestamptz default now()
);

-- Canned responses
create table if not exists canned_responses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  shortcut text,
  created_at timestamptz default now()
);

-- Surveys (CSAT)
create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  ticket_id text,
  score int check (score between 1 and 5),
  comment text,
  customer_name text,
  created_at timestamptz default now()
);

-- Quality reviews
create table if not exists quality_reviews (
  id uuid primary key default gen_random_uuid(),
  ticket_id text,
  agent_name text,
  score int check (score between 1 and 5),
  notes text,
  reviewer text,
  created_at timestamptz default now()
);

-- Announcements
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  severity text default 'info' check (severity in ('info','warning','critical')),
  active boolean default true,
  created_at timestamptz default now()
);

-- Custom forms (metadata)
create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  fields jsonb default '[]'::jsonb,
  active boolean default true,
  created_at timestamptz default now()
);

-- Releases
create table if not exists releases (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  title text not null,
  notes text default '',
  released_at timestamptz default now()
);

-- RLS
alter table knowledge_articles enable row level security;
alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;
alter table notifications enable row level security;
alter table automations enable row level security;
alter table canned_responses enable row level security;
alter table survey_responses enable row level security;
alter table quality_reviews enable row level security;
alter table announcements enable row level security;
alter table forms enable row level security;
alter table releases enable row level security;

do $$ begin
  -- permissive policies for authenticated + anon where needed
  execute 'drop policy if exists ka_all on knowledge_articles';
  execute 'create policy ka_all on knowledge_articles for all using (true) with check (true)';
  execute 'drop policy if exists cc_all on chat_conversations';
  execute 'create policy cc_all on chat_conversations for all using (true) with check (true)';
  execute 'drop policy if exists cm_all on chat_messages';
  execute 'create policy cm_all on chat_messages for all using (true) with check (true)';
  execute 'drop policy if exists n_all on notifications';
  execute 'create policy n_all on notifications for all using (true) with check (true)';
  execute 'drop policy if exists auto_all on automations';
  execute 'create policy auto_all on automations for all using (true) with check (true)';
  execute 'drop policy if exists cr_all on canned_responses';
  execute 'create policy cr_all on canned_responses for all using (true) with check (true)';
  execute 'drop policy if exists sr_all on survey_responses';
  execute 'create policy sr_all on survey_responses for all using (true) with check (true)';
  execute 'drop policy if exists qr_all on quality_reviews';
  execute 'create policy qr_all on quality_reviews for all using (true) with check (true)';
  execute 'drop policy if exists an_all on announcements';
  execute 'create policy an_all on announcements for all using (true) with check (true)';
  execute 'drop policy if exists f_all on forms';
  execute 'create policy f_all on forms for all using (true) with check (true)';
  execute 'drop policy if exists r_all on releases';
  execute 'create policy r_all on releases for all using (true) with check (true)';
exception when others then null;
end $$;

-- Seed KB if empty
insert into knowledge_articles (title, category, body)
select * from (values
  ('How to reset a customer password', 'Account', '1. Open the customer profile.
2. Click Security → Reset password.
3. An email is sent automatically. Link expires in 24 hours.'),
  ('SSO / Okta troubleshooting', 'Auth', 'Common causes: clock skew, incorrect ACS URL, user not assigned in Okta.'),
  ('Billing mismatch checklist', 'Billing', 'Confirm plan, seat count, pending invoices, and tax settings.'),
  ('API rate limits', 'API', 'Free: 60/min · Pro: 600/min · Enterprise: custom. 429 includes Retry-After.'),
  ('SLA policies overview', 'Support', 'Critical: 15m/4h · High: 1h/8h · Medium: 4h/24h · Low: 8h/72h')
) as v(title, category, body)
where not exists (select 1 from knowledge_articles limit 1);

insert into canned_responses (title, body, shortcut)
select * from (values
  ('Greeting', 'Hi! Thanks for contacting support. I''m looking into this now.', '/hi'),
  ('Need more info', 'Could you share screenshots, the exact error message, and when this started?', '/info'),
  ('Resolved', 'This should now be fixed. Please reply if anything still looks wrong.', '/done'),
  ('Escalating', 'I''m escalating this to our senior team and will update you shortly.', '/esc')
) as v(title, body, shortcut)
where not exists (select 1 from canned_responses limit 1);

insert into automations (name, enabled, trigger, condition_field, condition_op, condition_value, action, action_value)
select * from (values
  ('Critical keyword boost', true, 'ticket_created', 'title', 'contains', 'down', 'set_priority', 'critical'),
  ('Billing auto-tag', true, 'ticket_created', 'title', 'contains', 'billing', 'set_priority', 'high')
) as v(name, enabled, trigger, condition_field, condition_op, condition_value, action, action_value)
where not exists (select 1 from automations limit 1);

insert into announcements (title, body, severity, active)
select * from (values
  ('Welcome to Nexus Support', 'Agent command center is live. Use the portal link for customers.', 'info', true)
) as v(title, body, severity, active)
where not exists (select 1 from announcements limit 1);

insert into forms (name, description, fields, active)
select * from (values
  ('General support', 'Default intake form', '[{"id":"subject","label":"Subject","type":"text","required":true},{"id":"details","label":"Details","type":"textarea","required":true}]'::jsonb, true),
  ('Billing request', 'Invoice and payment issues', '[{"id":"invoice","label":"Invoice number","type":"text","required":true},{"id":"amount","label":"Amount","type":"text","required":false},{"id":"details","label":"Details","type":"textarea","required":true}]'::jsonb, true)
) as v(name, description, fields, active)
where not exists (select 1 from forms limit 1);

insert into releases (version, title, notes)
select * from (values
  ('1.1.0', 'Supabase auth & cloud tickets', 'Agent accounts, portal, and realtime ticket sync.'),
  ('1.2.0', 'Full platform modules', 'Profile, notifications, KB admin, chat, automations, QA, surveys.')
) as v(version, title, notes)
where not exists (select 1 from releases limit 1);

-- Realtime (ignore errors if already added)
do $$ begin
  alter publication supabase_realtime add table tickets;
exception when others then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table agents;
exception when others then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table chat_conversations;
exception when others then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table chat_messages;
exception when others then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table notifications;
exception when others then null;
end $$;
