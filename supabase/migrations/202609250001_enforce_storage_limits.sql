create or replace function public.current_storage_limit_bytes()
returns bigint
language sql
stable
security definer
set search_path = public, storage
as $$
  select case
    when p.subscription_status = 'active'
      or (p.subscription_status = 'trialing' and p.trial_ends_at > now())
    then case p.plan_id
      when 'professional' then 10737418240::bigint
      when 'essential' then 2147483648::bigint
      else 536870912::bigint
    end
    else 536870912::bigint
  end
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.can_upload_storage_object(object_name text, object_metadata jsonb)
returns boolean
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  used_bytes bigint;
  incoming_bytes bigint;
  quota_bytes bigint;
begin
  if auth.uid() is null or (storage.foldername(object_name))[1] <> auth.uid()::text then
    return false;
  end if;

  select coalesce(sum(coalesce((metadata ->> 'size')::bigint, 0)), 0)
  into used_bytes
  from storage.objects
  where bucket_id in ('app-files', 'private-files')
    and (storage.foldername(name))[1] = auth.uid()::text;

  incoming_bytes := coalesce((object_metadata ->> 'size')::bigint, 0);
  quota_bytes := coalesce(public.current_storage_limit_bytes(), 536870912::bigint);
  return incoming_bytes > 0 and used_bytes + incoming_bytes <= quota_bytes;
end;
$$;

revoke all on function public.current_storage_limit_bytes() from public;
revoke all on function public.can_upload_storage_object(text, jsonb) from public;
grant execute on function public.current_storage_limit_bytes() to authenticated;
grant execute on function public.can_upload_storage_object(text, jsonb) to authenticated;

update storage.buckets
set file_size_limit = 26214400,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'audio/webm'
    ]
where id in ('app-files', 'private-files');

drop policy if exists "app_files_upload_own_folder" on storage.objects;
create policy "app_files_upload_own_folder" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'app-files'
  and public.can_upload_storage_object(name, metadata)
);

drop policy if exists "private_files_upload_own_folder" on storage.objects;
create policy "private_files_upload_own_folder" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'private-files'
  and public.can_upload_storage_object(name, metadata)
);
