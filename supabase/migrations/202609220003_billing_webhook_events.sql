create table if not exists public.billing_webhook_events (
  id bigint generated always as identity primary key,
  provider_event_id text not null unique,
  event_type text not null,
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processed', 'ignored', 'failed')),
  processed_at timestamptz,
  created_date timestamptz not null default now()
);

alter table public.billing_webhook_events enable row level security;
revoke all on public.billing_webhook_events from anon, authenticated;

create index if not exists billing_webhook_events_created_date_idx
  on public.billing_webhook_events (created_date desc);

comment on table public.billing_webhook_events is
  'Idempotency ledger for payment provider webhooks. Accessible only to trusted server operations.';

