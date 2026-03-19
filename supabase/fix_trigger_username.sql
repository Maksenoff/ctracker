-- Mise à jour du trigger pour lire le username depuis les métadonnées de signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username')
  on conflict (id) do update set
    username = coalesce(EXCLUDED.username, profiles.username);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Activation du realtime sur la table friendships
alter table friendships replica identity full;
alter publication supabase_realtime add table friendships;
