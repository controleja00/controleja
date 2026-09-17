create extension if not exists pgcrypto;

create or replace function public.set_updated_date()
returns trigger
language plpgsql
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'user' check (role in ('admin', 'user')),
  full_name text,
  phone text,
  company_name text,
  company_type text,
  cnpj text,
  plan_id text not null default 'free' check (plan_id in ('free', 'essential', 'professional')),
  subscription_status text not null default 'free' check (subscription_status in ('free', 'trialing', 'active', 'past_due', 'canceled')),
  trial_ends_at timestamptz,
  billing_provider text check (billing_provider in ('asaas', 'mercado_pago', 'stripe')),
  billing_customer_id text,
  onboarding_goal text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    role,
    full_name,
    plan_id,
    subscription_status,
    trial_ends_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'plan_id', 'free'),
    coalesce(new.raw_user_meta_data->>'subscription_status', 'free'),
    nullif(new.raw_user_meta_data->>'trial_ends_at', '')::timestamptz
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  address text not null,
  client text not null,
  technical_responsible text,
  start_date date,
  expected_end_date date,
  status text not null default 'Planejamento',
  project_type text,
  phases jsonb not null default '[]'::jsonb,
  progress_method text not null default 'Físico (quantidade)',
  measurement_generates text not null default 'Conta a pagar (empreiteiro)',
  contracted_value numeric(14,2),
  initial_capital numeric(14,2),
  subcontractor_ids text[] not null default '{}',
  budget numeric(14,2),
  progress_percent numeric(5,2) not null default 0,
  financial_progress_percent numeric(5,2) not null default 0,
  description text,
  photos text[] not null default '{}',
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.subcontractors (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company_name text not null,
  cnpj text not null,
  contact_name text not null,
  phone text,
  email text,
  specialty text not null,
  city text,
  state text,
  employee_count integer,
  has_own_equipment boolean not null default false,
  previous_works text,
  photos text[] not null default '{}',
  score_operational numeric(5,2) not null default 0,
  score_technical numeric(5,2) not null default 0,
  score_legal numeric(5,2) not null default 0,
  score_financial numeric(5,2) not null default 0,
  score_behavioral numeric(5,2) not null default 0,
  score_total numeric(5,2) not null default 0,
  status text not null default 'Pendente',
  availability text not null default 'Disponível',
  notes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  project_name text,
  subcontractor_id uuid references public.subcontractors(id) on delete set null,
  subcontractor_name text,
  service text not null,
  unit text not null,
  contracted_qty numeric(14,3),
  executed_qty numeric(14,3),
  unit_price numeric(14,2),
  total_value numeric(14,2),
  status text not null default 'Pendente',
  photos text[] not null default '{}',
  comments text,
  measurement_date date,
  approved_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.cash_flow_entries (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  project_name text,
  description text not null,
  type text not null default 'Despesa',
  category text,
  value numeric(14,2) not null default 0,
  due_date date,
  paid_date date,
  status text not null default 'Previsto',
  related_entity text,
  related_id text,
  notes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  project_name text,
  name text,
  subcontractor_id uuid references public.subcontractors(id) on delete set null,
  subcontractor_name text,
  type text not null,
  file_url text,
  status text not null default 'Pendente',
  expiry_date date,
  notes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text,
  type text not null,
  severity text not null default 'Média',
  related_entity text,
  related_id text,
  is_read boolean not null default false,
  is_resolved boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  project_name text,
  report_date date not null,
  phase text,
  photos text[] not null default '{}',
  observation text,
  visible_to_client boolean not null default false,
  ai_report text,
  status text not null default 'Rascunho',
  sent_by text,
  client_last_access timestamptz,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.client_portal_configs (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  active boolean not null default false,
  access_token text unique not null default encode(gen_random_bytes(24), 'hex'),
  password text,
  show_photos boolean not null default true,
  show_reports boolean not null default true,
  show_progress boolean not null default true,
  show_next_steps boolean not null default true,
  show_deadline boolean not null default true,
  client_last_access timestamptz,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.progress_history (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  project_name text,
  previous_percent numeric(5,2),
  new_percent numeric(5,2) not null,
  observation text,
  responsible text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.supplies (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  project_name text,
  name text not null,
  category text not null,
  unit text,
  quantity_needed numeric(14,3),
  quantity_in_stock numeric(14,3) not null default 0,
  unit_price numeric(14,2),
  total_value numeric(14,2),
  supplier text,
  status text not null default 'Disponível',
  priority text not null default 'Média',
  needed_by date,
  notes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.hiring_requests (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  project_name text,
  service_type text not null,
  description text not null,
  location text not null,
  start_date date,
  deadline_days integer,
  area_size text,
  estimated_budget numeric(14,2),
  workers_needed integer,
  equipment_needed text,
  technical_requirements text,
  status text not null default 'Aberta',
  hired_subcontractor_id uuid references public.subcontractors(id) on delete set null,
  hired_subcontractor_name text,
  ai_analysis text,
  notes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.guarantees (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  project_name text,
  subcontractor_id uuid references public.subcontractors(id) on delete set null,
  subcontractor_name text,
  service text not null,
  completion_date date,
  warranty_months integer not null default 12,
  warranty_end_date date,
  status text not null default 'Ativa',
  claims text,
  notes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  entity_name text,
  details text,
  user_email text,
  ip_address text,
  risk_level text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.benchmarks (
  id uuid primary key default gen_random_uuid(),
  created_by_id uuid default auth.uid() references auth.users(id) on delete set null,
  service text not null,
  category text not null,
  region text,
  unit text,
  avg_price numeric(14,2),
  min_price numeric(14,2),
  max_price numeric(14,2),
  avg_productivity numeric(14,3),
  productivity_unit text,
  sample_size integer,
  period text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'asaas',
  provider_customer_id text,
  provider_subscription_id text unique,
  plan_id text not null check (plan_id in ('essential', 'professional')),
  status text not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'profiles',
    'projects',
    'subcontractors',
    'measurements',
    'cash_flow_entries',
    'documents',
    'alerts',
    'daily_reports',
    'client_portal_configs',
    'progress_history',
    'supplies',
    'hiring_requests',
    'guarantees',
    'audit_logs',
    'benchmarks',
    'subscriptions'
  ] loop
    execute format('alter table public.%I enable row level security', tbl);
  end loop;
end $$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'projects',
    'subcontractors',
    'measurements',
    'cash_flow_entries',
    'documents',
    'alerts',
    'daily_reports',
    'client_portal_configs',
    'progress_history',
    'supplies',
    'hiring_requests',
    'guarantees',
    'audit_logs'
  ] loop
    execute format('drop policy if exists "owner_select" on public.%I', tbl);
    execute format('drop policy if exists "owner_insert" on public.%I', tbl);
    execute format('drop policy if exists "owner_update" on public.%I', tbl);
    execute format('drop policy if exists "owner_delete" on public.%I', tbl);
    execute format('create policy "owner_select" on public.%I for select to authenticated using (created_by_id = auth.uid() or public.is_admin())', tbl);
    execute format('create policy "owner_insert" on public.%I for insert to authenticated with check (created_by_id = auth.uid() or public.is_admin())', tbl);
    execute format('create policy "owner_update" on public.%I for update to authenticated using (created_by_id = auth.uid() or public.is_admin()) with check (created_by_id = auth.uid() or public.is_admin())', tbl);
    execute format('create policy "owner_delete" on public.%I for delete to authenticated using (created_by_id = auth.uid() or public.is_admin())', tbl);
  end loop;
end $$;

drop policy if exists "profile_select_self" on public.profiles;
drop policy if exists "profile_update_self" on public.profiles;
drop policy if exists "profile_insert_self" on public.profiles;
create policy "profile_select_self" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());
create policy "profile_update_self" on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());
create policy "profile_insert_self" on public.profiles
for insert to authenticated
with check (id = auth.uid() or public.is_admin());

drop policy if exists "benchmark_read_authenticated" on public.benchmarks;
drop policy if exists "benchmark_admin_insert" on public.benchmarks;
drop policy if exists "benchmark_admin_update" on public.benchmarks;
drop policy if exists "benchmark_admin_delete" on public.benchmarks;
create policy "benchmark_read_authenticated" on public.benchmarks
for select to authenticated
using (true);
create policy "benchmark_admin_insert" on public.benchmarks
for insert to authenticated
with check (public.is_admin());
create policy "benchmark_admin_update" on public.benchmarks
for update to authenticated
using (public.is_admin())
with check (public.is_admin());
create policy "benchmark_admin_delete" on public.benchmarks
for delete to authenticated
using (public.is_admin());

drop policy if exists "subscription_select_self" on public.subscriptions;
drop policy if exists "subscription_admin_write" on public.subscriptions;
create policy "subscription_select_self" on public.subscriptions
for select to authenticated
using (user_id = auth.uid() or public.is_admin());
create policy "subscription_admin_write" on public.subscriptions
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'profiles',
    'projects',
    'subcontractors',
    'measurements',
    'cash_flow_entries',
    'documents',
    'alerts',
    'daily_reports',
    'client_portal_configs',
    'progress_history',
    'supplies',
    'hiring_requests',
    'guarantees',
    'audit_logs',
    'benchmarks',
    'subscriptions'
  ] loop
    execute format('drop trigger if exists set_%I_updated_date on public.%I', tbl, tbl);
    execute format('create trigger set_%I_updated_date before update on public.%I for each row execute function public.set_updated_date()', tbl, tbl);
  end loop;
end $$;

create index if not exists idx_projects_owner on public.projects(created_by_id);
create index if not exists idx_measurements_owner_project on public.measurements(created_by_id, project_id);
create index if not exists idx_cash_flow_owner_project on public.cash_flow_entries(created_by_id, project_id);
create index if not exists idx_documents_owner_project on public.documents(created_by_id, project_id);
create index if not exists idx_alerts_owner_resolved on public.alerts(created_by_id, is_resolved);
create index if not exists idx_daily_reports_project_date on public.daily_reports(project_id, report_date desc);
create index if not exists idx_client_portal_token on public.client_portal_configs(access_token);
create index if not exists idx_client_portal_project on public.client_portal_configs(project_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('app-files', 'app-files', true, 104857600)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "app_files_read_public" on storage.objects;
drop policy if exists "app_files_upload_own_folder" on storage.objects;
drop policy if exists "app_files_update_own_folder" on storage.objects;
drop policy if exists "app_files_delete_own_folder" on storage.objects;
create policy "app_files_read_public" on storage.objects
for select to anon, authenticated
using (bucket_id = 'app-files');
create policy "app_files_upload_own_folder" on storage.objects
for insert to authenticated
with check (bucket_id = 'app-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "app_files_update_own_folder" on storage.objects
for update to authenticated
using (bucket_id = 'app-files' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'app-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "app_files_delete_own_folder" on storage.objects
for delete to authenticated
using (bucket_id = 'app-files' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.get_client_portal_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg public.client_portal_configs%rowtype;
  project_payload jsonb;
  report_payload jsonb;
begin
  select *
  into cfg
  from public.client_portal_configs
  where access_token = p_token
    and active = true
  limit 1;

  if cfg.id is null then
    return null;
  end if;

  select jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'address', p.address,
    'client', p.client,
    'technical_responsible', p.technical_responsible,
    'start_date', p.start_date,
    'expected_end_date', p.expected_end_date,
    'status', p.status,
    'project_type', p.project_type,
    'phases', p.phases,
    'progress_method', p.progress_method,
    'progress_percent', p.progress_percent,
    'financial_progress_percent', p.financial_progress_percent,
    'description', p.description,
    'photos', p.photos
  )
  into project_payload
  from public.projects p
  where p.id = cfg.project_id
    and p.status <> 'Arquivada';

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'project_id', r.project_id,
        'project_name', r.project_name,
        'report_date', r.report_date,
        'phase', r.phase,
        'photos', r.photos,
        'observation', r.observation,
        'visible_to_client', r.visible_to_client,
        'ai_report', r.ai_report,
        'status', r.status,
        'sent_by', r.sent_by,
        'created_date', r.created_date
      )
      order by r.report_date desc, r.created_date desc
    ),
    '[]'::jsonb
  )
  into report_payload
  from public.daily_reports r
  where r.project_id = cfg.project_id
    and r.status = 'Publicado'
    and coalesce(r.visible_to_client, true) = true;

  update public.client_portal_configs
  set client_last_access = now()
  where id = cfg.id;

  return jsonb_build_object(
    'config', jsonb_build_object(
      'id', cfg.id,
      'project_id', cfg.project_id,
      'active', cfg.active,
      'show_photos', cfg.show_photos,
      'show_reports', cfg.show_reports,
      'show_progress', cfg.show_progress,
      'show_next_steps', cfg.show_next_steps,
      'show_deadline', cfg.show_deadline,
      'client_last_access', cfg.client_last_access
    ),
    'project', project_payload,
    'reports', report_payload
  );
end;
$$;

grant execute on function public.get_client_portal_by_token(text) to anon, authenticated;
