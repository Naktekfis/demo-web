schema_version: 1

# ITB Insight Data Model

Source of truth: `docs/prd-itbinsight.md`

Related docs: `docs/MVP-SCOPE.md`, `docs/BACKLOG.md`, `docs/REGISTRATION-FLOWS.md`, `docs/ADMIN-DASHBOARD.md`, `docs/API-CONTRACTS.md`, `docs/SUPABASE-SCHEMA-PLAN.md`, `docs/PAYMENT-FLOWS.md`

Audience: web development team implementing the MVP backend and Supabase schema.

## Purpose

This document defines the current and recommended data model for the MVP. The MVP is competition registration only, plus visitor QR and admin-operated gate check-in.

The model should stay minimal enough to ship quickly, with active payment tables already included and booth tracking, RSVP, feedback, and analytics still deferred.

## Current Schema In Repo

Current effective schema is built by the migration chain through `supabase/migrations/0005_rls_initplan_optimization.sql`.

Migration inventory:

| Migration | Current role |
| --- | --- |
| `0001_initial_schema.sql` | Legacy proof-of-concept schema with `registrations` and `rsvp`. Superseded by the clean MVP reset in `0002`. |
| `0002_mvp_schema.sql` | Clean MVP schema reset with `profiles`, `visitor_tickets`, competition/team tables, registration table, and `admin_roles`. |
| `0003_submit_team_registration.sql` | Adds team submission RPC, later replaced by `0004` to use `submitted` status. |
| `0004_payment_schema.sql` | Converts registration status from `pending` to `submitted`, adds payment tables, and updates team submission RPC. |
| `0005_rls_initplan_optimization.sql` | Current latest migration. Recreates RLS policies with `(select auth.uid())` wrappers to avoid per-row auth function re-evaluation. |

| Table | Current purpose | MVP fit |
| --- | --- | --- |
| `profiles` | Stores user profile data linked to `auth.users`. | Active. Needed for Visitor and Admin identity. |
| `visitor_tickets` | Stores one opaque gate QR and check-in status per visitor. | Active replacement for legacy `rsvp`. |
| `competitions` | Stores competition metadata mirror for registration foreign keys. | Active DB mirror; operational competition content can still fall back to hardcoded/Sanity data. |
| `competition_teams` | Stores team container, UID, leader, and team status. | Active. |
| `competition_team_members` | Stores normalized team member rows. | Active. |
| `competition_registrations` | Stores submitted individual/team registrations. | Active; current statuses are `submitted`, `verified`, `rejected`. |
| `admin_roles` | Stores admin authorization rows. | Active preferred admin source, with `ADMIN_EMAILS` fallback in code. |
| `payments` | Stores app-level mock/Midtrans payment attempts. | Active. |
| `midtrans_transactions` | Stores Midtrans Snap/webhook details. | Active. |

## Implemented MVP Tables

### `profiles`

Purpose: one row per authenticated user.

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. References `auth.users(id)`. |
| `full_name` | `text` | Required when available from auth metadata or profile form. |
| `email` | `text` | Required. |
| `phone` | `text` | Optional for MVP. Can be deferred if not collected. |
| `institution` | `text` | Optional user-level institution. Competition members may also store institution per membership. |
| `avatar_url` | `text` | Optional. |
| `created_at` | `timestamptz` | Default `now()`. |
| `updated_at` | `timestamptz` | Updated on profile edit. |

RLS expectation:

- Visitor can read and update own profile.
- Admin can read profiles needed for registration/admin views.

### `visitor_tickets`

Purpose: active table for visitor QR ticket and gate check-in behavior.

Why not call it RSVP:

- In the PRD, RSVP means invited guest or Alumni Gathering confirmation.
- In legacy migration `0001`, `rsvp` meant QR ticket and gate check-in.
- Current MVP code uses `visitor_tickets`; keep RSVP naming reserved for future invited guest or Alumni Gathering confirmation.

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `user_id` | `uuid` | References `profiles(id)`. Unique for MVP if each visitor has one gate QR. |
| `qr_code` | `text` | Unique QR payload or opaque token. Created when user signs up/logs in. |
| `ticket_type` | `text` | Default `general_gate`. Keeps future flexibility for program-specific tickets. |
| `checked_in` | `boolean` | Default `false`. |
| `checked_in_at` | `timestamptz` | Set by admin scan. |
| `checked_in_by` | `uuid` | Optional. References admin profile. |
| `created_at` | `timestamptz` | Default `now()`. |
| `updated_at` | `timestamptz` | Updated on check-in. |

RLS expectation:

- Visitor can read own ticket.
- Visitor should not update `checked_in` fields directly.
- Admin can read tickets and perform check-in through a server route.
- Service role can create or ensure ticket rows server-side.

Migration note:

- New MVP code uses `visitor_tickets`.
- `rsvp` is legacy from `0001_initial_schema.sql` and should not be used for new work.

### `competitions`

Purpose: competition metadata used by registration records.

MVP source decision:

- Competition content is hardcoded for MVP.
- This table can still exist as a database mirror so registrations have stable foreign keys.

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `slug` | `text` | Unique. Matches hardcoded competition slug. |
| `name` | `text` | Display name. |
| `description` | `text` | Optional. |
| `category` | `text` | Optional. |
| `registration_type` | `text` | `individual` or `team`. |
| `team_uid_prefix` | `text` | Optional prefix for generated team UID, for example `RBT`. |
| `team_min` | `integer` | For team competitions. Use `1` for individual. |
| `team_max` | `integer` | For team competitions. Use `1` for individual. |
| `registration_open` | `timestamptz` | Optional. |
| `registration_close` | `timestamptz` | Optional. |
| `is_active` | `boolean` | Default `true`. |
| `created_at` | `timestamptz` | Default `now()`. |

RLS expectation:

- Public read is allowed.
- Admin writes should go through service route or dashboard.

### `competition_teams`

Purpose: team container created by a team leader.

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `competition_id` | `uuid` | References `competitions(id)`. |
| `team_uid` | `text` | Unique human-shareable join code. Should not expose sequential IDs. |
| `team_name` | `text` | Required. Unique per competition if possible. |
| `leader_user_id` | `uuid` | References `profiles(id)`. |
| `status` | `text` | Suggested: `draft`, `submitted`, `verified`, `rejected`. |
| `created_at` | `timestamptz` | Default `now()`. |
| `updated_at` | `timestamptz` | Updated on change. |

RLS expectation:

- Leader can read own team.
- Team members can read team after joining.
- Visitor can join by valid `team_uid` through a server route.
- Admin can read all teams.

### `competition_team_members`

Purpose: membership rows for team-based competitions.

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `team_id` | `uuid` | References `competition_teams(id)`. |
| `user_id` | `uuid` | References `profiles(id)`. |
| `name` | `text` | Snapshot at join/submit time. |
| `email` | `text` | Snapshot at join/submit time. |
| `phone` | `text` | Required by current team create/join API. |
| `institution` | `text` | Required by current minimal data decision. |
| `member_role` | `text` | `leader` or `member`. |
| `joined_at` | `timestamptz` | Default `now()`. |

Constraints:

- Unique `(team_id, user_id)`.
- Exactly one leader per team.
- Team size must be validated in route logic against competition `team_min` and `team_max`.

RLS expectation:

- User can read own membership.
- Team members can read member list for their team.
- Admin can read all memberships.

### `competition_registrations`

Purpose: final submitted registration record for an individual participant or a team.

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `competition_id` | `uuid` | References `competitions(id)`. |
| `registration_kind` | `text` | `individual` or `team`. |
| `user_id` | `uuid` | References `profiles(id)`. Used for individual registration or submitter. |
| `team_id` | `uuid` | Nullable. References `competition_teams(id)`. |
| `status` | `text` | `submitted`, `verified`, or `rejected`. |
| `note` | `text` | Optional admin note. Required by API when setting status to `rejected`. |
| `submitted_at` | `timestamptz` | Default `now()`. |
| `updated_at` | `timestamptz` | Updated on status change. |

Constraints:

- Individual registration requires `user_id` and no `team_id`.
- Team registration requires `team_id`.
- A user should not submit duplicate individual registrations for the same competition.
- A team should not submit duplicate team registrations for the same competition.

RLS expectation:

- User can read own individual registration.
- Team member can read own team registration.
- Admin can read and update status.
- Status changes should happen through server routes.

### `admin_roles`

Purpose: simple admin authorization for MVP.

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `user_id` | `uuid` | References `profiles(id)`. |
| `role` | `text` | MVP can use `admin`. Future can add `competition_admin`, `gate_staff`, etc. |
| `created_at` | `timestamptz` | Default `now()`. |

Fallback behavior:

- Current code checks `admin_roles` first.
- `ADMIN_EMAILS` remains an approved temporary fallback only when intentionally configured because role management through env vars does not scale.

### `payments`

Purpose: app-level payment record linked to one competition registration.

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `registration_id` | `uuid` | References `competition_registrations(id)`. |
| `provider` | `text` | `mock` or `midtrans`. |
| `status` | `text` | `pending`, `paid`, `failed`, `expired`, `cancelled`. |
| `amount` | `integer` | MVP default: `10000`. |
| `currency` | `text` | Default `IDR`. |
| `paid_at` | `timestamptz` | Set when payment succeeds. |
| `expired_at` | `timestamptz` | Optional; Midtrans default can be used first. |
| `created_at` | `timestamptz` | Default `now()`. |
| `updated_at` | `timestamptz` | Updated on status change. |

Rules:

- Registration status and payment status are separate.
- Payment success does not auto-verify registration.
- Retry is allowed while registration is not `verified` or `rejected`.
- Do not create duplicate active pending payments for the same registration.
- UI/API list helpers may display `unpaid` when no `payments` row exists. `unpaid` is not stored in the `payments.status` column.

### `midtrans_transactions`

Purpose: Midtrans-specific transaction details and webhook payloads.

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `payment_id` | `uuid` | References `payments(id)`. |
| `order_id` | `text` | Unique Midtrans order ID. |
| `snap_token` | `text` | Snap token from Midtrans. |
| `redirect_url` | `text` | Snap redirect URL. |
| `transaction_status` | `text` | Raw Midtrans transaction status. |
| `fraud_status` | `text` | Raw Midtrans fraud status if provided. |
| `gross_amount` | `integer` | Gross amount stored from transaction creation or webhook. |
| `raw_response` | `jsonb` | Create-transaction response. |
| `raw_notification` | `jsonb` | Last webhook payload. |
| `created_at` | `timestamptz` | Default `now()`. |
| `updated_at` | `timestamptz` | Updated on webhook. |

## MVP Relationships

```text
auth.users
  -> profiles
profiles
  -> visitor_tickets
  -> competition_team_members
  -> competition_registrations
competitions
  -> competition_teams
  -> competition_registrations
competition_teams
  -> competition_team_members
  -> competition_registrations
profiles
  -> admin_roles
competition_registrations
  -> payments
payments
  -> midtrans_transactions
```

## Current-To-Recommended Mapping

| Current table | Recommended MVP direction |
| --- | --- |
| `profiles` | Keep and extend only if needed. |
| `competitions` | Keep as DB mirror, even if hardcoded content is source for MVP. Add `registration_type`. |
| `registrations` | Replace or evolve into `competition_registrations` plus team tables. Current JSON `team_members` is not enough for join-by-UID flow. |
| `rsvp` | Legacy only. Do not use for new MVP work; use `visitor_tickets`. |

## Minimal Data Collected

For MVP, collect only what the registration flow needs.

Visitor/profile:

- Full name.
- Email.
- Phone number. Required before competition registration/team membership operations.
- Institution. Required before team creation/join in current code.

Competition registration:

- Competition ID or slug.
- Individual participant user ID, or team ID.
- Team name for team competitions.
- Team UID for joining.
- Member name.
- Member email.
- Member phone.
- Member institution.
- Member role: leader or member.

Deferred:

- Payment proof. Payment state uses `payments` and `midtrans_transactions` instead.
- KTM or identity uploads.
- Follow/share proof.
- Robot sketch upload.

## Security Rules

- Users must be authenticated to register or join a team.
- Users must not read another user's private registration data.
- Team join must happen through a server route that validates the team UID.
- Team size must be enforced server-side.
- Admin dashboard must be protected by role or email allowlist.
- Visitor cannot set `checked_in` directly.
- Admin check-in must happen through a server route.
- Service role key must stay server-only.
- CSV export should be admin-only.

## Deferred Data Areas

These are not part of MVP schema unless scope changes:

| Data area | Why deferred |
| --- | --- |
| Payment proof upload | Payment uses mock/Midtrans records instead of proof upload. |
| `booths` / `booth_visits` | Booth tracking out of scope. |
| `feedback` | Feedback system out of scope. |
| `partners` / `partner_clicks` | Sponsorship features out of scope. |
| `programs` / `sessions` | Event program pages out of scope for MVP. |
| `audit_logs` | Recommended later for sensitive admin actions, but not required for minimal MVP. |

## Open Decisions

| Decision | Current recommendation |
| --- | --- |
| Competition content source for production launch | Code can read Sanity when configured and falls back to hardcoded data. Operational launch source still needs confirmation. |
| Midtrans production mode | Mock and Midtrans Sandbox are implemented. Production keys, production callback, and go-live policy still need confirmation. |
| PII retention and deletion policy | Not defined in code/docs yet. Required before production-scale launch. |

## Verification

After schema changes, verify:

- New user gets a profile.
- New user gets one QR ticket.
- User cannot read another user's profile/ticket/registration.
- Team leader can create team.
- Team member can join with valid UID.
- Invalid team UID is rejected.
- Admin can search and export registrations.
- Admin can scan QR and mark check-in.
- Duplicate check-in is rejected.
