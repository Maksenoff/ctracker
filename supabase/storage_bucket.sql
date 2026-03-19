-- Crée le bucket pour les images uploadées
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict do nothing;

-- Politique : chaque user peut upload/lire/supprimer ses propres images
create policy "Users can upload images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Images are public" on storage.objects
  for select to public
  using (bucket_id = 'images');

create policy "Users can delete their images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]);
