-- Run in Supabase SQL Editor once
alter table public.agents add column if not exists signature text;
alter table public.agents add column if not exists skills text[];
alter table public.agents add column if not exists preferred_language text;
alter table public.agents add column if not exists work_hours_start text;
alter table public.agents add column if not exists work_hours_end text;
alter table public.agents add column if not exists out_of_office boolean default false;
alter table public.agents add column if not exists ooo_message text;
alter table public.agents add column if not exists avatar_url text;

alter table public.tickets add column if not exists deleted_at timestamptz;
alter table public.tickets add column if not exists sla_due_at timestamptz;
alter table public.tickets add column if not exists first_response_at timestamptz;
