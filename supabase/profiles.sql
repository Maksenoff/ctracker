-- Table profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);

-- Créé automatiquement un profil vide à chaque inscription
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Crée un profil pour les utilisateurs déjà existants
insert into profiles (id)
select id from auth.users
on conflict do nothing;
