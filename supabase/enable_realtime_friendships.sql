-- Active le realtime sur la table friendships
alter table friendships replica identity full;

-- Ajoute friendships à la publication realtime (ignore l'erreur si déjà présent)
do $$
begin
  alter publication supabase_realtime add table friendships;
exception when others then null;
end $$;
