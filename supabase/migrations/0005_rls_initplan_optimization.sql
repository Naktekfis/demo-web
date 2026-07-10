-- Migration: Fix auth_rls_initplan for all RLS policies
-- Replaces `auth.uid()` with `(select auth.uid())` in policy expressions
-- to avoid per-row re-evaluation and improve query performance at scale.
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- Profiles
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select using ((select auth.uid()) = id or public.is_admin((select auth.uid())));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Visitor Tickets
drop policy if exists "Users can read own visitor ticket" on public.visitor_tickets;
create policy "Users can read own visitor ticket" on public.visitor_tickets
  for select using ((select auth.uid()) = user_id or public.is_admin((select auth.uid())));

-- Competitions
drop policy if exists "Active competitions are public" on public.competitions;
create policy "Active competitions are public" on public.competitions
  for select using (is_active = true or public.is_admin((select auth.uid())));

-- Competition Teams
drop policy if exists "Team members can read joined teams" on public.competition_teams;
create policy "Team members can read joined teams" on public.competition_teams
  for select using (
    leader_user_id = (select auth.uid())
    or public.is_admin((select auth.uid()))
    or public.is_team_member(competition_teams.id, (select auth.uid()))
  );

-- Competition Team Members
drop policy if exists "Team members can read team memberships" on public.competition_team_members;
create policy "Team members can read team memberships" on public.competition_team_members
  for select using (
    user_id = (select auth.uid())
    or public.is_admin((select auth.uid()))
    or public.is_team_member(competition_team_members.team_id, (select auth.uid()))
  );

-- Competition Registrations
drop policy if exists "Participants can read own registrations" on public.competition_registrations;
create policy "Participants can read own registrations" on public.competition_registrations
  for select using (
    user_id = (select auth.uid())
    or public.is_admin((select auth.uid()))
    or public.is_team_member(competition_registrations.team_id, (select auth.uid()))
  );

-- Admin Roles
drop policy if exists "Admins can read admin roles" on public.admin_roles;
create policy "Admins can read admin roles" on public.admin_roles
  for select using (user_id = (select auth.uid()) or public.is_admin((select auth.uid())));

-- Payments
drop policy if exists "Participants can read own payments" on public.payments;
create policy "Participants can read own payments" on public.payments
  for select using (
    public.is_admin((select auth.uid()))
    or exists (
      select 1
      from public.competition_registrations
      where competition_registrations.id = payments.registration_id
        and (
          competition_registrations.user_id = (select auth.uid())
          or public.is_team_member(competition_registrations.team_id, (select auth.uid()))
        )
    )
  );

-- Midtrans Transactions
drop policy if exists "Admins can read midtrans transactions" on public.midtrans_transactions;
create policy "Admins can read midtrans transactions" on public.midtrans_transactions
  for select using (public.is_admin((select auth.uid())));
