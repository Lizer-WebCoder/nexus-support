-- Add branch column to tickets (run once in Supabase SQL Editor)
alter table tickets add column if not exists branch text;

-- Optional: index for filtering by branch
create index if not exists tickets_branch_idx on tickets (branch);
