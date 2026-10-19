-- Optional: persist branch + ticket on chat conversations (run in Supabase SQL Editor)
alter table chat_conversations add column if not exists branch text;
alter table chat_conversations add column if not exists ticket_id text;
