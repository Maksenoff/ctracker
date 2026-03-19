-- Table des amis
create table if not exists friendships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references auth.users(id) on delete cascade not null,
  addressee_id uuid references auth.users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz default now(),
  unique(requester_id, addressee_id)
);
alter table friendships enable row level security;
create policy "Users see own friendships" on friendships for select using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "Users send friend requests" on friendships for insert with check (auth.uid() = requester_id);
create policy "Addressee can respond" on friendships for update using (auth.uid() = addressee_id);
create policy "Either user can remove" on friendships for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Profils lisibles par tous (pour la recherche par pseudo)
drop policy if exists "Users manage own profile" on profiles;
create policy "Anyone can read profiles" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- Lecture publique pour voir les profils des autres utilisateurs
create policy "Authenticated read all games" on games for select using (auth.role() = 'authenticated');
create policy "Authenticated read all bosses" on bosses for select using (auth.role() = 'authenticated');
create policy "Authenticated read all boss_runs" on boss_runs for select using (auth.role() = 'authenticated');
create policy "Authenticated read all challenge_completions" on challenge_completions for select using (auth.role() = 'authenticated');
create policy "Authenticated read challenge_types" on challenge_types for select using (auth.role() = 'authenticated');
