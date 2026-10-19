-- Run in Supabase SQL Editor once

-- Ticket branch + attachments
alter table tickets add column if not exists branch text;
alter table tickets add column if not exists attachments jsonb default '[]'::jsonb;
create index if not exists tickets_branch_idx on tickets (branch);
create index if not exists tickets_customer_email_idx on tickets (customer_email);

-- Chat meta
alter table chat_conversations add column if not exists branch text;
alter table chat_conversations add column if not exists ticket_id text;

-- Admin flag on agents
alter table agents add column if not exists is_admin boolean default false;

-- Optional: mark first agent as admin
update agents set is_admin = true
where id in (select id from agents order by created_at nulls last limit 1)
and not exists (select 1 from agents where is_admin = true);
