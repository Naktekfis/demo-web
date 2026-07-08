alter table public.competition_registrations
  drop constraint if exists competition_registrations_status_check;

update public.competition_registrations
set status = 'submitted'
where status = 'pending';

alter table public.competition_registrations
  alter column status set default 'submitted';

alter table public.competition_registrations
  add constraint competition_registrations_status_check check (status in ('submitted', 'verified', 'rejected'));

create or replace function public.submit_team_registration(
  p_team_id uuid,
  p_leader_user_id uuid
)
returns table (
  registration_id uuid,
  registration_status text,
  registration_submitted_at timestamptz,
  team_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team record;
  v_registration public.competition_registrations%rowtype;
  v_member_count integer;
begin
  select id, competition_id, leader_user_id, status
  into v_team
  from public.competition_teams
  where id = p_team_id
  for update;

  if not found or v_team.leader_user_id <> p_leader_user_id then
    raise exception 'TEAM_NOT_FOUND_OR_FORBIDDEN';
  end if;

  if v_team.status <> 'draft' then
    raise exception 'TEAM_ALREADY_SUBMITTED';
  end if;

  select count(*)
  into v_member_count
  from public.competition_team_members
  where team_id = v_team.id;

  if v_member_count < (select team_min from public.competitions where id = v_team.competition_id) then
    raise exception 'TEAM_BELOW_MINIMUM';
  end if;

  if v_member_count > (select team_max from public.competitions where id = v_team.competition_id) then
    raise exception 'TEAM_ABOVE_MAXIMUM';
  end if;

  insert into public.competition_registrations (
    competition_id,
    registration_kind,
    team_id,
    status
  ) values (
    v_team.competition_id,
    'team',
    v_team.id,
    'submitted'
  )
  returning * into v_registration;

  update public.competition_teams
  set status = 'submitted'
  where id = v_team.id;

  registration_id := v_registration.id;
  registration_status := v_registration.status;
  registration_submitted_at := v_registration.submitted_at;
  team_status := 'submitted';
  return next;
end;
$$;

revoke all on function public.submit_team_registration(uuid, uuid) from public;
revoke all on function public.submit_team_registration(uuid, uuid) from anon;
revoke all on function public.submit_team_registration(uuid, uuid) from authenticated;
grant execute on function public.submit_team_registration(uuid, uuid) to service_role;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.competition_registrations(id) on delete cascade,
  provider text not null default 'mock' check (provider in ('mock', 'midtrans')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  amount integer not null default 10000 check (amount >= 0),
  currency text not null default 'IDR' check (currency = upper(currency)),
  paid_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_paid_at_consistency check (
    (status = 'paid' and paid_at is not null)
    or (status <> 'paid')
  )
);

create unique index payments_one_pending_per_registration
  on public.payments (registration_id)
  where status = 'pending';

create index payments_registration_id_idx on public.payments (registration_id);
create index payments_status_idx on public.payments (status);
create index payments_provider_idx on public.payments (provider);

create table public.midtrans_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  order_id text not null unique,
  snap_token text,
  redirect_url text,
  transaction_status text,
  fraud_status text,
  gross_amount integer,
  raw_response jsonb,
  raw_notification jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index midtrans_transactions_payment_id_idx on public.midtrans_transactions (payment_id);
create index midtrans_transactions_order_id_idx on public.midtrans_transactions (order_id);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create trigger midtrans_transactions_set_updated_at
  before update on public.midtrans_transactions
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;
alter table public.midtrans_transactions enable row level security;

create policy "Participants can read own payments" on public.payments
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1
      from public.competition_registrations
      where competition_registrations.id = payments.registration_id
        and (
          competition_registrations.user_id = auth.uid()
          or public.is_team_member(competition_registrations.team_id, auth.uid())
        )
    )
  );

create policy "Admins can read midtrans transactions" on public.midtrans_transactions
  for select using (public.is_admin(auth.uid()));
