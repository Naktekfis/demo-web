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
    'pending'
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
