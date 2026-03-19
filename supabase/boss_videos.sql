create table if not exists boss_videos (
  id uuid default gen_random_uuid() primary key,
  boss_id uuid references bosses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  label text,
  created_at timestamptz default now()
);
alter table boss_videos enable row level security;
create policy "Users manage own boss_videos" on boss_videos for all using (auth.uid() = user_id);
