create or replace function public.start_trial(p_plan text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_plan not in ('essential', 'professional') then
    raise exception 'Invalid trial plan' using errcode = '22023';
  end if;

  update public.profiles
  set plan_id = p_plan,
      subscription_status = 'trialing',
      trial_ends_at = now() + interval '7 days'
  where id = auth.uid()
    and plan_id = 'free'
    and subscription_status = 'free'
    and trial_ends_at is null
  returning * into updated_profile;

  if updated_profile.id is null then
    select * into updated_profile
    from public.profiles
    where id = auth.uid();
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.start_trial(text) from public;
grant execute on function public.start_trial(text) to authenticated;

create or replace function public.enforce_project_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_plan text;
  profile_status text;
  profile_trial_end timestamptz;
  allowed_projects integer;
  current_projects integer;
begin
  if new.status = 'Concluída' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status <> 'Concluída' then
    return new;
  end if;

  select plan_id, subscription_status, trial_ends_at
  into profile_plan, profile_status, profile_trial_end
  from public.profiles
  where id = new.created_by_id;

  if profile_status = 'active'
     or (profile_status = 'trialing' and profile_trial_end > now()) then
    allowed_projects := case profile_plan
      when 'professional' then 20
      when 'essential' then 3
      else 1
    end;
  else
    allowed_projects := 1;
  end if;

  select count(*)
  into current_projects
  from public.projects
  where created_by_id = new.created_by_id
    and status <> 'Concluída'
    and (tg_op = 'INSERT' or id <> new.id);

  if current_projects >= allowed_projects then
    raise exception 'PROJECT_PLAN_LIMIT:%', allowed_projects using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_project_plan_limit_trigger on public.projects;
create trigger enforce_project_plan_limit_trigger
before insert or update of status on public.projects
for each row execute function public.enforce_project_plan_limit();

revoke all on function public.enforce_project_plan_limit() from public;

