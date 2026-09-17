alter table public.profiles
  add column if not exists job_title text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name, plan_id, subscription_status)
  values (
    new.id,
    new.email,
    'user',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'free',
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke update on public.profiles from authenticated;
grant update (full_name, phone, company_name, company_type, cnpj, job_title, onboarding_goal)
on public.profiles to authenticated;

drop policy if exists "profile_update_self" on public.profiles;
create policy "profile_update_self" on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

comment on column public.profiles.role is
  'Authorization role. Only server-side administrative operations may change this field.';
