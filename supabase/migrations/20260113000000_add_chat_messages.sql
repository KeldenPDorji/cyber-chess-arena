-- Create chat_messages table for in-game chat
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  game_id uuid not null references public.chess_games(id) on delete cascade,
  sender_name text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for faster queries
create index if not exists chat_messages_game_id_idx on public.chat_messages(game_id);
create index if not exists chat_messages_created_at_idx on public.chat_messages(created_at);

-- Enable Row Level Security
alter table public.chat_messages enable row level security;

-- Allow anyone to read chat messages for games they can see
create policy "Anyone can read chat messages"
  on public.chat_messages for select
  using (true);

-- Allow anyone to insert chat messages
create policy "Anyone can insert chat messages"
  on public.chat_messages for insert
  with check (true);

-- Enable realtime
alter publication supabase_realtime add table public.chat_messages;
