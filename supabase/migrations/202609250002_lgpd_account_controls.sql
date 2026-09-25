alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists privacy_accepted_at timestamptz,
  add column if not exists legal_version text;

create table if not exists public.privacy_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email_hash text not null,
  consent_type text not null check (consent_type in ('terms_and_privacy')),
  legal_version text not null,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  evidence jsonb not null default '{}'::jsonb
);

alter table public.privacy_consents enable row level security;
drop policy if exists "privacy_consents_select_self" on public.privacy_consents;
create policy "privacy_consents_select_self" on public.privacy_consents
for select to authenticated using (user_id = auth.uid() or public.is_admin());

create index if not exists privacy_consents_user_id_idx on public.privacy_consents(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  accepted_at timestamptz;
  version text;
begin
  accepted_at := case
    when new.raw_user_meta_data->>'legal_accepted_at' is not null
      then (new.raw_user_meta_data->>'legal_accepted_at')::timestamptz
    else null
  end;
  version := nullif(new.raw_user_meta_data->>'legal_version', '');

  insert into public.profiles (
    id, email, role, full_name, plan_id, subscription_status,
    terms_accepted_at, privacy_accepted_at, legal_version
  ) values (
    new.id,
    new.email,
    'user',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'free',
    'free',
    accepted_at,
    accepted_at,
    version
  ) on conflict (id) do nothing;

  if accepted_at is not null and version is not null then
    insert into public.privacy_consents (user_id, email_hash, consent_type, legal_version, accepted_at, evidence)
    values (
      new.id,
      encode(digest(lower(coalesce(new.email, '')), 'sha256'), 'hex'),
      'terms_and_privacy',
      version,
      accepted_at,
      jsonb_build_object('source', 'registration', 'provider', coalesce(new.app_metadata->>'provider', 'email'))
    );
  end if;
  return new;
end;
$$;

comment on table public.privacy_consents is
  'Consent evidence retained in anonymized form after account deletion for legal accountability.';
comment on column public.profiles.legal_version is
  'Version of the Terms and Privacy Policy accepted by the account owner.';

create or replace function public.record_current_legal_consent(p_version text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  account_email text;
begin
  if auth.uid() is null or nullif(trim(p_version), '') is null then
    raise exception 'Invalid consent request';
  end if;
  select email into account_email from auth.users where id = auth.uid();
  update public.profiles
  set terms_accepted_at = now(), privacy_accepted_at = now(), legal_version = p_version
  where id = auth.uid();
  insert into public.privacy_consents (user_id, email_hash, consent_type, legal_version, evidence)
  values (
    auth.uid(),
    encode(digest(lower(coalesce(account_email, '')), 'sha256'), 'hex'),
    'terms_and_privacy',
    p_version,
    jsonb_build_object('source', 'oauth_registration')
  );
end;
$$;

revoke all on function public.record_current_legal_consent(text) from public;
grant execute on function public.record_current_legal_consent(text) to authenticated;
