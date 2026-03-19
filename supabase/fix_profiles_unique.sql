-- Supprimer les doublons (garde le plus récent)
delete from profiles
where id not in (
  select distinct on (username) id
  from profiles
  where username is not null
  order by username, updated_at desc nulls last
);

-- Ajouter une contrainte unique sur le username
alter table profiles add constraint profiles_username_unique unique (username);
