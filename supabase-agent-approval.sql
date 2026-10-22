-- Agent self-signup approval (presence status stays online/busy/away/offline)
alter table public.agents add column if not exists approval_status text default 'approved';
-- Existing agents remain approved
update public.agents set approval_status = 'approved' where approval_status is null;
