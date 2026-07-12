schema_version: 1

# Supabase Schema Plan

Source of truth: `docs/prd-itbinsight.md`

Related docs: `docs/MVP-SCOPE.md`, `docs/DATA-MODEL.md`, `docs/REGISTRATION-FLOWS.md`, `docs/ADMIN-DASHBOARD.md`, `docs/API-CONTRACTS.md`, `docs/PAYMENT-FLOWS.md`, `docs/runbooks/SECURITY-CHECKLIST.md`

Audience: web development team implementing Supabase migrations for MVP.

## Purpose

This document turns the data model into a concrete MVP migration plan.

Because this project is still MVP and production data is not assumed, the implemented path uses a clean MVP schema reset in `0002_mvp_schema.sql`, then payment and RLS optimization migrations through `0005_rls_initplan_optimization.sql`.

## Recommendation

Use the current migration chain as the source of truth for new environments.

Recommended direction:

- Current MVP migrations replace `rsvp` with `visitor_tickets`.
- Current MVP migrations replace JSON-heavy `registrations.team_members` with normalized team and registration tables.
- Keep `profiles`.
- Keep or recreate `competitions` as a DB mirror of hardcoded competition data.
- Use `admin_roles` as the preferred admin source, with `ADMIN_EMAILS` only as an intentional temporary fallback.

Add payment tables now for the post-registration payment phase. Implement internal mock first, then Midtrans Sandbox Snap.

Current latest migration note: `0005_rls_initplan_optimization.sql` keeps the `0004_payment_schema.sql` payment/status model and optimizes RLS policies by wrapping auth helper calls such as `auth.uid()` with `select` in policy expressions.

## Legacy Schema Problems Solved By `0002` And Later

| Legacy surface | Problem solved in current schema |
| --- | --- |
| `rsvp` | Name conflicts with PRD RSVP meaning. It currently means QR ticket/check-in. |
| `registrations.team_members` JSON | Easy for prototype work, but cannot support member login + join team by UID cleanly. |
| `registrations` | Mixes team registration and member data in one row. |
| `competitions` | Missing `registration_type` and team UID prefix config. |
| Admin access | Env allowlist alone does not scale; current code checks `admin_roles` first and falls back to `ADMIN_EMAILS` only when configured. |

## Target Tables

MVP tables:

- `profiles`
- `visitor_tickets`
- `competitions`
- `competition_teams`
- `competition_team_members`
- `competition_registrations`
- `admin_roles`
- `payments`
- `midtrans_transactions`

Deferred tables:

- `booths`
- `booth_visits`
- `feedback`
- `partners`
- `partner_clicks`
- `programs`
- `sessions`
- `audit_logs`

## Table Plan

### `profiles`

Required fields:

- `id uuid primary key references auth.users(id) on delete cascade`
- `full_name text not null`
- `email text not null`
- `phone text`
- `institution text`
- `avatar_url text`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Notes:

- Phone is required for registration operations, but can be nullable at account creation.
- Registration flow should require phone before submitting competition registration.

### `visitor_tickets`

Required fields:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid unique references profiles(id) on delete cascade`
- `qr_code text unique not null`
- `ticket_type text not null default 'general_gate'`
- `checked_in boolean not null default false`
- `checked_in_at timestamptz`
- `checked_in_by uuid references profiles(id)`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

QR rule:

- Use an opaque random token.
- Generate the token in server code before insert; the current migration does not define a database default for `qr_code`.
- Do not encode user metadata in QR.

### `competitions`

Required fields:

- `id uuid primary key default gen_random_uuid()`
- `slug text unique not null`
- `name text not null`
- `description text`
- `category text`
- `registration_type text not null check (registration_type in ('individual', 'team'))`
- `team_uid_prefix text`
- `team_min integer not null default 1`
- `team_max integer not null default 1`
- `registration_open timestamptz`
- `registration_close timestamptz`
- `is_active boolean not null default true`
- `created_at timestamptz default now()`

Notes:

- Hardcoded competition data remains the MVP source.
- This table can be seeded from hardcoded data for stable foreign keys.

### `competition_teams`

Required fields:

- `id uuid primary key default gen_random_uuid()`
- `competition_id uuid not null references competitions(id) on delete cascade`
- `team_uid text unique not null`
- `team_name text not null`
- `leader_user_id uuid not null references profiles(id) on delete cascade`
- `status text not null default 'draft' check (status in ('draft', 'submitted', 'verified', 'rejected'))`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Constraints:

- Unique `(competition_id, team_name)`.
- `team_uid` format should be generated server-side, for example `RBT-A7K2QD`.

### `competition_team_members`

Required fields:

- `id uuid primary key default gen_random_uuid()`
- `team_id uuid not null references competition_teams(id) on delete cascade`
- `user_id uuid not null references profiles(id) on delete cascade`
- `name text not null`
- `email text not null`
- `phone text not null`
- `institution text not null`
- `member_role text not null check (member_role in ('leader', 'member'))`
- `joined_at timestamptz default now()`

Constraints:

- Unique `(team_id, user_id)`.
- Route logic must ensure only one leader per team.
- Route logic must enforce team size.
- Route logic must block edits after team submission.

### `competition_registrations`

Required fields:

- `id uuid primary key default gen_random_uuid()`
- `competition_id uuid not null references competitions(id)`
- `registration_kind text not null check (registration_kind in ('individual', 'team'))`
- `user_id uuid references profiles(id)`
- `team_id uuid references competition_teams(id)`
- `status text not null default 'submitted' check (status in ('submitted', 'verified', 'rejected'))`
- `note text`
- `submitted_at timestamptz default now()`
- `updated_at timestamptz default now()`

Constraints:

- Individual registration requires `user_id` and `team_id is null`.
- Team registration requires `team_id`.
- Unique individual registration per `(competition_id, user_id)`.
- Unique team registration per `(competition_id, team_id)`.

Status meaning:

- `submitted`: waiting for payment/admin review.
- `verified`: manually accepted for MVP. Final meaning waits for payment/berkas rules.
- `rejected`: rejected by admin, note required by API.

### `payments`

Required fields:

- `id uuid primary key default gen_random_uuid()`
- `registration_id uuid not null references competition_registrations(id) on delete cascade`
- `provider text not null check (provider in ('mock', 'midtrans'))`
- `status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired', 'cancelled'))`
- `amount integer not null default 10000`
- `currency text not null default 'IDR'`
- `paid_at timestamptz`
- `expired_at timestamptz`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Constraints:

- Route logic must prevent duplicate active pending payments for the same registration.
- Retry is allowed if registration is not `verified` or `rejected`.
- Current migration does not store `payer_user_id`; payer authorization is derived from the linked registration owner or team leader in server logic.

### `midtrans_transactions`

Required fields:

- `id uuid primary key default gen_random_uuid()`
- `payment_id uuid not null references payments(id) on delete cascade`
- `order_id text unique not null`
- `snap_token text`
- `redirect_url text`
- `transaction_status text`
- `fraud_status text`
- `gross_amount integer`
- `raw_response jsonb`
- `raw_notification jsonb`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `admin_roles`

Required fields:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid unique not null references profiles(id) on delete cascade`
- `role text not null default 'admin'`
- `created_at timestamptz default now()`

MVP rule:

- Use only one effective role: `admin`.
- Keep future granular roles out of MVP unless needed.

## RLS Plan

Enable RLS on all public tables.

### `profiles`

- User can select own row.
- User can update own row.
- Admin can select all rows through policy or service route.

### `visitor_tickets`

- User can select own ticket.
- User cannot update `checked_in` directly.
- Admin/check-in route updates ticket using service role.

### `competitions`

- Public can select active competitions.
- Admin/service role can manage competition seed data.

### `competition_teams`

- Leader can select own team.
- Team member can select joined team.
- Team creation and join should go through server routes.
- Admin can select all teams through service route.

### `competition_team_members`

- User can select own membership.
- Team members can select all members in their team.
- Insert/delete should go through server routes to enforce business rules.
- Admin can select all members through service route.

### `competition_registrations`

- Individual participant can select own registration.
- Team member can select own team registration.
- Insert should go through server route.
- Status update should be admin-only through server route.

### `admin_roles`

- Users should not write roles.
- Admin role writes should be service-role only.

### `payments` and `midtrans_transactions`

- User can select payments linked to own individual registration.
- Team members can select payments linked to their team registration; only the team leader can create/manage the payment in server route logic.
- User cannot directly update payment status.
- Payment creation and status changes should go through server routes.
- Admin can read payment data through service routes.

## Migration Order

Recommended clean reset order:

1. Create extension support for UUID/random generation if needed.
2. Create `profiles`.
3. Create `visitor_tickets`.
4. Create `competitions`.
5. Create `competition_teams`.
6. Create `competition_team_members`.
7. Create `competition_registrations`.
8. Create `admin_roles`.
9. Create `payments`.
10. Create `midtrans_transactions`.
11. Enable RLS.
12. Add RLS policies.
13. Add auth user trigger for profile creation.
14. Add helper function or route logic for visitor ticket creation.
15. Seed competitions from hardcoded competition config.
16. Seed first admin role or configure `ADMIN_EMAILS`.

## Compatibility With Current Code

Current code uses the MVP schema tables:

- `profiles`
- `visitor_tickets`
- `competitions`
- `competition_teams`
- `competition_team_members`
- `competition_registrations`
- `admin_roles`
- `payments`
- `midtrans_transactions`

Legacy compatibility notes:

- `registrations` and `rsvp` only exist in the superseded `0001` migration and should not be used for new MVP work.
- `/api/admin/check-in` accepts `{ "qrCode": "opaque-token" }` and no longer requires geofence/location fields.
- Phone is required before competition registration submission and team membership operations.

## Payment Plan

Payment is implemented after core registration through two stages: internal mock, then Midtrans Sandbox Snap.

Midtrans implementation should define:

- Transaction creation endpoint.
- Webhook verification.
- Payment status field.
- Reconciliation behavior.
- Relationship between payment status and registration status.

## Acceptance Criteria

- New signed-up user gets profile.
- New signed-up user gets one visitor ticket.
- Returning user keeps the same QR token.
- Individual competition registration can be inserted.
- Team leader can create team with UID.
- Member can join by UID.
- Member can leave before submission.
- Leader can remove member before submission.
- Team membership is locked after submission.
- Admin can list registrations.
- Admin can update registration status.
- Admin can check in any Visitor with valid QR.
- Check-in does not require geofence.
- User cannot read another user's private registration data.
