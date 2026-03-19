-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- GAMES
-- =====================
create table if not exists games (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  cover_url text,
  created_at timestamptz default now()
);
alter table games enable row level security;
create policy "Users manage own games" on games for all using (auth.uid() = user_id);

-- =====================
-- BOSSES
-- =====================
create table if not exists bosses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id uuid references games(id) on delete cascade not null,
  name text not null,
  image_url text,
  order_index int default 0,
  created_at timestamptz default now()
);
alter table bosses enable row level security;
create policy "Users manage own bosses" on bosses for all using (auth.uid() = user_id);

-- =====================
-- CHALLENGE TYPES (prédéfinis + custom)
-- =====================
create table if not exists challenge_types (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,  -- null = global/preset
  name text not null,
  description text,
  icon text default '🏆',
  is_preset boolean default false
);
alter table challenge_types enable row level security;
create policy "Anyone reads presets" on challenge_types for select using (is_preset = true or auth.uid() = user_id);
create policy "Users manage own challenge types" on challenge_types for all using (auth.uid() = user_id);

-- Insert preset challenge types
insert into challenge_types (name, description, icon, is_preset) values
  ('No Hit', 'Vaincre le boss sans subir aucun coup', '🛡️', true),
  ('No Damage', 'Vaincre le boss sans perdre de HP', '✨', true),
  ('Level 1', 'Vaincre le boss au niveau 1', '⚡', true),
  ('Solo', 'Vaincre le boss seul sans aide', '🗡️', true),
  ('Speed Run', 'Vaincre le boss le plus rapidement possible', '⏱️', true),
  ('No Upgrade', 'Vaincre le boss sans amélioration d''équipement', '🔩', true),
  ('Blind', 'Vaincre le boss sans regarder de guide', '👁️', true),
  ('First Try', 'Vaincre le boss du premier coup', '🎯', true)
on conflict do nothing;

-- =====================
-- BOSS RUNS (performances par boss)
-- =====================
create table if not exists boss_runs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  boss_id uuid references bosses(id) on delete cascade not null,
  completed boolean default false,
  attempts int default 0,
  best_time_seconds int,  -- temps en secondes
  notes text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table boss_runs enable row level security;
create policy "Users manage own runs" on boss_runs for all using (auth.uid() = user_id);

-- =====================
-- CHALLENGE COMPLETIONS (défis validés par run)
-- =====================
create table if not exists challenge_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  boss_run_id uuid references boss_runs(id) on delete cascade not null,
  challenge_type_id uuid references challenge_types(id) on delete cascade not null,
  completed boolean default false,
  completed_at timestamptz,
  unique(boss_run_id, challenge_type_id)
);
alter table challenge_completions enable row level security;
create policy "Users manage own challenge completions" on challenge_completions for all using (auth.uid() = user_id);

-- =====================
-- VIEW: Stats par jeu
-- =====================
create or replace view game_stats as
select
  g.id as game_id,
  g.user_id,
  g.name as game_name,
  count(distinct b.id) as total_bosses,
  count(distinct case when br.completed then b.id end) as completed_bosses,
  count(distinct cc.id) filter (where cc.completed) as total_challenges_done,
  case when count(distinct b.id) > 0
    then round((count(distinct case when br.completed then b.id end)::numeric / count(distinct b.id)) * 100, 1)
    else 0
  end as completion_percentage
from games g
left join bosses b on b.game_id = g.id
left join boss_runs br on br.boss_id = b.id and br.user_id = g.user_id
left join challenge_completions cc on cc.boss_run_id = br.id and cc.user_id = g.user_id
group by g.id, g.user_id, g.name;
