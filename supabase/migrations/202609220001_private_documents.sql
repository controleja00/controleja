insert into storage.buckets (id, name, public, file_size_limit)
values ('private-files', 'private-files', false, 104857600)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "private_files_read_own_folder" on storage.objects;
drop policy if exists "private_files_upload_own_folder" on storage.objects;
drop policy if exists "private_files_update_own_folder" on storage.objects;
drop policy if exists "private_files_delete_own_folder" on storage.objects;

create policy "private_files_read_own_folder" on storage.objects
for select to authenticated
using (bucket_id = 'private-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "private_files_upload_own_folder" on storage.objects
for insert to authenticated
with check (bucket_id = 'private-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "private_files_update_own_folder" on storage.objects
for update to authenticated
using (bucket_id = 'private-files' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'private-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "private_files_delete_own_folder" on storage.objects
for delete to authenticated
using (bucket_id = 'private-files' and (storage.foldername(name))[1] = auth.uid()::text);
