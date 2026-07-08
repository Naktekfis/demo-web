schema_version: 1

# MVP Implementation Guide

Source of truth: `docs/prd-itbinsight.md`

Related docs: `docs/MVP-SCOPE.md`, `docs/DATA-MODEL.md`, `docs/REGISTRATION-FLOWS.md`, `docs/ADMIN-DASHBOARD.md`, `docs/API-CONTRACTS.md`, `docs/SUPABASE-SCHEMA-PLAN.md`, `docs/IMPLEMENTATION-GAP.md`, `docs/PAYMENT-MIDTRANS-PLAN.md`, `docs/PAYMENT-FLOWS.md`

Audience: web development team implementing the MVP under a tight timeline.

## Purpose

This guide turns the MVP docs into an implementation sequence. Follow it in order unless a blocker requires reordering.

The core MVP is competition registration, with visitor QR creation, team registration, admin registration review, CSV export, and admin-operated gate check-in. Payment is the next implementation layer: internal mock first, then Midtrans Sandbox Snap.

## Implementation Rules

- Implement payment in two stages after core registration is stable: internal mock first, then Midtrans Sandbox Snap.
- Keep booth tracking out of MVP.
- Keep RSVP/alumni/feedback/sponsor flows out of MVP.
- Keep competition data hardcoded for MVP.
- Use `visitor_tickets`, not `rsvp`, for new schema work.
- Use opaque QR tokens only.
- Skip geofence for MVP check-in.
- Require phone number before competition registration submission.
- Lock team membership after team registration submission.
- Use the shared API response envelope from `docs/API-CONTRACTS.md`.
- Run `npm run build` after each major phase.

## Phase 0: Baseline And Branch Check

Goal: start from a known state.

Steps:

1. Check current worktree status.
2. Confirm no unrelated user changes will be edited.
3. Run baseline build.
4. Confirm Supabase env vars are available for local integration work.

Commands:

```bash
git status --short
npm run build
```

Definition of done:

- Build passes before implementation starts.
- Known unrelated changes are left untouched.

## Phase 1: Competition Data Shape

Status: Done

Goal: make hardcoded competition data support individual/team behavior.

Files likely affected:

- `lib/competitions.ts`
- `app/competitions/page.tsx`
- `app/competitions/[slug]/page.tsx`
- `components/dashboard/competition-register-form.tsx`

Steps:

1. [x] Extend competition type with `registrationType: 'individual' | 'team'`.
2. [x] Add `teamUidPrefix` for team competitions.
3. [x] Keep `teamMin` and `teamMax`.
4. [x] Mark individual competitions with `teamMin = 1` and `teamMax = 1`.
5. [x] Render registration type on competition detail.
6. [x] Route individual and team competitions to the correct registration UI.

Acceptance checks:

- [x] Competition list still renders.
- [x] Competition detail shows whether registration is individual or team-based.
- [x] Register CTA preserves slug and sends unauthenticated users to login.

## Phase 2: Supabase Schema Migration

Status: Done

Goal: replace demo schema with MVP schema.

Source spec: `docs/SUPABASE-SCHEMA-PLAN.md`

Files likely affected:

- `supabase/migrations/*`
- optional seed script under `scripts/`

Recommended path:

1. [x] Create a new clean migration for MVP schema.
2. [x] Create or recreate `profiles`.
3. [x] Create `visitor_tickets`.
4. [x] Create `competitions`.
5. [x] Create `competition_teams`.
6. [x] Create `competition_team_members`.
7. [x] Create `competition_registrations`.
8. [x] Create `admin_roles`.
9. [x] Enable RLS on all public tables.
10. [x] Add policies matching `docs/SUPABASE-SCHEMA-PLAN.md`.
11. [x] Add profile creation trigger for new auth users.
12. [x] Seed competitions from hardcoded config or a small seed script.

Important decisions:

- This MVP can use a clean reset because production data is not assumed.
- Payment tables are added in Phase 13 after core registration is stable.
- Do not preserve `rsvp` unless needed temporarily for compatibility.

Acceptance checks:

- [x] A new auth user gets a `profiles` row.
- [x] A logged-in user can read own profile.
- [x] A logged-in user cannot read another user's private rows.
- [x] Admin/service route can read admin data.

## Phase 3: Shared Server Helpers

Status: Done

Goal: avoid repeating auth, admin, ticket, and response logic across endpoints.

Files likely affected:

- `lib/api-response.ts`
- `lib/auth.ts` or existing Supabase server helper files
- `lib/admin.ts`
- `lib/tickets.ts`
- `lib/teams.ts`
- `lib/registrations.ts`

Steps:

1. [x] Add response helpers for the shared API envelope.
2. [x] Add authenticated-user helper for route handlers.
3. [x] Add admin-check helper using `admin_roles` or temporary `ADMIN_EMAILS` fallback.
4. [x] Add `ensureVisitorTicket(userId)` helper.
5. [x] Add `generateQrToken()` helper for opaque QR token.
6. [x] Add `generateTeamUid(prefix)` helper.
7. [x] Add competition lookup helper that maps hardcoded data to DB competition rows.

Response shape:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Pesan error untuk user atau admin."
  }
}
```

Acceptance checks:

- [x] New endpoints return consistent `success`, `data`, and `error` fields.
- [x] Error code is stable English `SCREAMING_SNAKE_CASE`.
- [x] Error message is Bahasa Indonesia.

## Phase 4: Ticket Creation After Login

Status: Done

Goal: every Visitor gets one QR ticket after first sign-up/login.

Files likely affected:

- `app/auth/callback/route.ts`
- `app/dashboard/my-tickets/page.tsx`
- new `app/api/tickets/ensure/route.ts`
- `components/dashboard/QRTicket.tsx`

Steps:

1. [x] Implement `POST /api/tickets/ensure`.
2. [x] Call ticket ensure after auth callback when possible.
3. [x] Keep a fallback ensure call on ticket/dashboard page load.
4. [x] Update ticket page to read `visitor_tickets` instead of `rsvp`.
5. [x] Ensure QR displays opaque token only.

Acceptance checks:

- [x] New Visitor gets exactly one ticket.
- [x] Returning Visitor keeps same QR token.
- [x] Ticket page works after refresh.
- [x] QR payload does not expose user metadata.

## Phase 5: Individual Registration API And UI

Status: Done

Goal: logged-in Visitor can submit an individual competition registration.

API spec: `POST /api/registrations/individual`

Files likely affected:

- `app/api/registrations/individual/route.ts`
- `app/dashboard/register-competition/page.tsx`
- `components/dashboard/competition-register-form.tsx`
- `app/dashboard/page.tsx`

Steps:

1. [x] Create individual registration endpoint.
2. [x] Validate user session.
3. [x] Ensure profile exists.
4. [x] Require phone before submission.
5. [x] Validate competition exists and is `individual`.
6. [x] Validate registration window.
7. [x] Reject duplicate registration.
8. [x] Insert `competition_registrations` with `registration_kind = individual` and `status = submitted`.
9. [x] Update dashboard to read `competition_registrations`.

Acceptance checks:

- [x] Unauthenticated user is rejected or redirected.
- [x] Missing phone blocks submission.
- [x] Duplicate individual registration returns `DUPLICATE_REGISTRATION`.
- [x] Success shows `submitted` status.

## Phase 6: Team Creation And Join Flow

Status: Done

Goal: team-based competitions support leader-created teams and member join by UID.

API specs:

- `POST /api/teams`
- `POST /api/teams/join`
- `DELETE /api/teams/[teamId]/members/[memberId]`
- `POST /api/teams/[teamId]/leave`

Files likely affected:

- `app/api/teams/route.ts`
- `app/api/teams/join/route.ts`
- `app/api/teams/[teamId]/members/[memberId]/route.ts`
- `app/api/teams/[teamId]/leave/route.ts`
- `app/dashboard/teams/create/page.tsx`
- `app/dashboard/teams/join/page.tsx`
- team UI components under `components/dashboard/`

Steps:

1. [x] Build team creation endpoint.
2. [x] Generate team UID with competition prefix and 6 random uppercase characters.
3. [x] Insert `competition_teams` with `status = draft`.
4. [x] Insert leader into `competition_team_members`.
5. [x] Build join endpoint.
6. [x] Validate UID format and competition slug.
7. [x] Enforce one team per user per competition.
8. [x] Enforce max team size.
9. [x] Add leader remove-member endpoint before submission.
10. [x] Add member leave endpoint before submission.
11. [x] Block all user membership edits when team status is not `draft`.

Acceptance checks:

- [x] Leader can create team and receive UID like `ROBO-A7K2QD`.
- [x] Member can join with valid UID.
- [x] Invalid UID returns `TEAM_NOT_FOUND` or `INVALID_TEAM_UID`.
- [x] Full team returns `TEAM_FULL`.
- [x] Leader can remove member before submit.
- [x] Member can leave before submit.
- [x] No member edits after submit.

## Phase 7: Team Registration Submit

Status: Done

Goal: leader can submit final team registration.

API spec: `POST /api/registrations/team`

Files likely affected:

- `app/api/registrations/team/route.ts`
- team dashboard UI
- `app/dashboard/page.tsx`

Steps:

1. [x] Validate user is team leader.
2. [x] Validate team status is `draft`.
3. [x] Count team members.
4. [x] Validate `team_min` and `team_max`.
5. [x] Reject duplicate team registration.
6. [x] Insert `competition_registrations` with `registration_kind = team` and `status = submitted`.
7. [x] Update team status to `submitted`.
8. [x] Show submitted status in participant dashboard.

Acceptance checks:

- [x] Non-leader cannot submit.
- [x] Below-minimum team cannot submit.
- [x] Duplicate team submit returns `TEAM_ALREADY_SUBMITTED`.
- [x] Submitted team membership is locked.

## Phase 8: Admin Overview And Registration Review

Status: Done

Goal: Admin can review and manage competition registrations.

Specs:

- `docs/ADMIN-DASHBOARD.md`
- `GET /api/admin/overview`
- `GET /api/admin/registrations`
- `PATCH /api/admin/registrations/[id]/status`
- `GET /api/admin/registrations/export`

Files likely affected:

- `app/admin/page.tsx`
- `app/admin/registrations/page.tsx`
- `app/admin/registrations/[id]/page.tsx`
- `app/api/admin/overview/route.ts`
- `app/api/admin/registrations/route.ts`
- `app/api/admin/registrations/[id]/status/route.ts`
- `app/api/admin/registrations/export/route.ts`
- admin components under `components/admin/`

Steps:

1. [x] Protect admin routes.
2. [x] Implement overview metrics.
3. [x] Implement registration list with pagination.
4. [x] Add search by name, email, phone, team name, team UID, competition, and QR token.
5. [x] Add filters for competition, registration type, status, and check-in status.
6. [x] Add registration detail page.
7. [x] Implement status update endpoint.
8. [x] Require note for `rejected`.
9. [x] Add CSV export using current filters.

Acceptance checks:

- [x] Non-admin cannot access admin pages or APIs.
- [x] Admin can see overview metrics.
- [x] Admin can search registrations by team UID.
- [x] Admin can update status.
- [x] Rejection without note is blocked.
- [x] CSV contains fields from `docs/ADMIN-DASHBOARD.md`.

## Phase 9: Admin Visitors And Gate Check-In

Status: Done

Goal: Admin can see all Visitors and check in any Visitor with a valid QR.

Specs:

- `GET /api/admin/visitors`
- `POST /api/admin/check-in`

Files likely affected:

- `app/admin/visitors/page.tsx`
- `app/admin/check-in/page.tsx`
- `components/admin/check-in-form.tsx`
- `app/api/admin/visitors/route.ts`
- `app/api/admin/check-in/route.ts`

Steps:

1. [x] Implement visitor list endpoint.
2. [x] Add visitor page with search by name, email, phone, QR token, and check-in status.
3. [x] Update check-in endpoint to accept `{ "qrCode": "opaque-token" }`.
4. [x] Remove `lat` and `lng` requirement from check-in.
5. [x] Remove geofence validation for MVP.
6. [x] On successful check-in, set `checked_in`, `checked_in_at`, and `checked_in_by`.
7. [x] Return `ALREADY_CHECKED_IN` for duplicates.
8. [x] Keep manual QR token input as fallback when camera scanning is unavailable.

Acceptance checks:

- [x] Admin can check in any Visitor with QR.
- [x] QR does not need competition registration.
- [x] Unknown QR returns `TICKET_NOT_FOUND`.
- [x] Duplicate QR returns `ALREADY_CHECKED_IN`.
- [x] Check-in works without browser geolocation permission.

## Phase 10: Replace Legacy Data Access

Status: Done

Goal: remove old MVP-incompatible assumptions from current code.

Known legacy areas:

- `rsvp` should become `visitor_tickets`.
- `registrations` should become `competition_registrations` plus team tables.
- `/api/register` should be replaced or wrapped by new individual/team endpoints.
- Geofence check-in should be disabled for MVP.
- Existing competition form assumes direct member list submission; team UID flow changes this.

Steps:

1. Replace direct `rsvp` reads/writes.
2. Replace direct `registrations` reads/writes.
3. Keep compatibility wrappers only if needed for incremental rollout.
4. Update README only if commands/routes materially change.
5. Search for stale table names before final QA.

Search patterns:

```bash
rg "rsvp|registrations|ticketCode|lat|lng|geofence" app components lib
```

Acceptance checks:

- No production path writes to `rsvp`.
- No production path writes to old `registrations` shape.
- Check-in API no longer requires location.

## Phase 11: Manual QA Script

Status: Done

Goal: verify end-to-end MVP behavior.

Run these checks in order.

### Guest

1. [x] Open landing page.
2. [x] Open competition list.
3. [x] Open competition detail.
4. [x] Click register while logged out.
5. [x] Confirm redirect to login with return path.

### Visitor Ticket

1. [x] Log in as new Visitor.
2. [x] Confirm profile exists.
3. [x] Confirm `visitor_tickets` row exists.
4. [x] Open ticket page.
5. [x] Refresh ticket page.
6. [x] Confirm QR token stays the same.

### Individual Registration

1. [x] Open individual competition.
2. [x] Submit without phone.
3. [x] Confirm submission is blocked.
4. [x] Add phone.
5. [x] Submit registration.
6. [x] Confirm status is `submitted`.
7. [x] Submit again.
8. [x] Confirm duplicate is rejected.

### Team Registration

1. [x] Log in as leader.
2. [x] Create team.
3. [x] Copy team UID.
4. [x] Log in as member.
5. [x] Join using team UID.
6. [x] Leader removes member before submit.
7. [x] Member rejoins.
8. [x] Leader submits final team registration.
9. [x] Try member leave after submit.
10. [x] Confirm edit is blocked.

### Admin Review

1. [x] Log in as admin.
2. [x] Open `/admin`.
3. [x] Open registrations list.
4. [x] Search by team UID.
5. [x] Open registration detail.
6. [x] Reject without note.
7. [x] Confirm blocked.
8. [x] Reject with note.
9. [x] Change back to submitted.
10. [x] Change to verified.
11. [x] Export CSV.

### Gate Check-In

1. [x] Open visitor QR.
2. [x] Open admin check-in page.
3. [x] Scan or paste QR token.
4. [x] Confirm success.
5. [x] Scan same token again.
6. [x] Confirm duplicate response.
7. [x] Try fake QR token.
8. [x] Confirm not found response.

## Phase 12: Final Verification

Status: Done

Goal: ensure repo is ready for handoff.

Commands:

```bash
npm run build
npx tsc --noEmit
```

Optional smoke scripts if Supabase env is configured:

```bash
node scripts/verify-supabase.js
node scripts/test-supabase-client.js
```

Do not rely on `npm run lint` until the repo has a non-interactive ESLint config.

Definition of done:

- [x] Build passes.
- [x] TypeScript check passes.
- [x] Manual QA script passes or failures are documented.
- [x] Known deferred items are not accidentally implemented halfway.

## Phase 13: Payment Schema And State Model

Status: Done

Goal: add payment persistence without changing registration verification behavior.

Specs:

- `docs/PAYMENT-MIDTRANS-PLAN.md`
- `docs/PAYMENT-FLOWS.md`
- `docs/SUPABASE-SCHEMA-PLAN.md`

Files likely affected:

- `supabase/migrations/*`
- `lib/payments.ts`
- `lib/registrations.ts`
- dashboard registration queries
- admin registration queries

Steps:

1. [x] Add `payments` table.
2. [x] Add `midtrans_transactions` table.
3. [x] Keep registration status and payment status separate.
4. [x] Ensure existing submitted registrations can show missing payment as payable.
5. [x] Add payment joins to dashboard registration data.
6. [x] Add payment joins to admin registration data.
7. [x] Do not auto-verify registration when payment becomes `paid`.

Acceptance checks:

- [x] Registration can be `submitted` while payment is `pending`.
- [x] Payment can be `paid` while registration remains `submitted`.
- [x] Admin can still change registration to `verified` manually.

## Phase 14: Internal Mock Payment

Status: Next

Goal: prove payment UX and state transitions before Midtrans integration.

API specs:

- `POST /api/payments/create`
- `GET /api/payments/[id]`
- `POST /api/payments/mock/settle`
- `POST /api/payments/mock/fail`
- `POST /api/payments/mock/expire`

Files likely affected:

- `app/api/payments/create/route.ts`
- `app/api/payments/[id]/route.ts`
- `app/api/payments/mock/settle/route.ts`
- `app/api/payments/mock/fail/route.ts`
- `app/api/payments/mock/expire/route.ts`
- `app/dashboard/payments/[id]/mock/page.tsx`
- dashboard registration card component

Steps:

1. [x] Implement `POST /api/payments/create` with provider `mock`.
2. [x] Use amount from hardcoded competition data; default IDR 10,000.
3. [x] Allow individual participant to pay own registration.
4. [x] Allow only team leader to pay team registration.
5. [x] Block payment when registration is `verified` or `rejected`.
6. [x] Reuse active pending payment instead of creating duplicates.
7. [x] Add dashboard `Bayar` button after registration submission.
8. [x] Add mock payment page with success/fail/expire demo actions.
9. [x] Add retry CTA for `failed`, `expired`, or `cancelled` payments.
10. [x] Confirm mock success sets `payment_status = paid` only.

Acceptance checks:

- [x] Individual participant can mock-pay.
- [x] Team leader can mock-pay.
- [x] Team member cannot pay team registration.
- [x] Retry works while registration is `submitted`.
- [x] Paid payment does not auto-verify registration.

## Phase 15: Admin Payment Visibility

Status: Done

Goal: let Admin inspect payment status before manual verification.

Files likely affected:

- `app/admin/page.tsx`
- `app/admin/registrations/page.tsx`
- `app/admin/registrations/[id]/page.tsx`
- `app/api/admin/overview/route.ts`
- `app/api/admin/registrations/route.ts`
- `app/api/admin/registrations/export/route.ts`

Steps:

1. [x] Add paid/pending payment metrics to admin overview.
2. [x] Add payment status column to registration list.
3. [x] Add payment provider, amount, paid at, and Midtrans order ID fields to detail page.
4. [x] Add payment fields to CSV export.
5. [x] Skip mock/demo-only payment override because it is not needed for current testing and should not look like production behavior.

Acceptance checks:

- [x] Admin can inspect payment status.
- [x] CSV includes payment fields.
- [x] Admin can verify registration after payment is paid.
- [x] Mock override is not presented as production behavior.

## Phase 16: Midtrans Sandbox Snap

Status: Done

Goal: connect payment creation to Midtrans Sandbox after mock flow is stable.

Files likely affected:

- `lib/midtrans.ts`
- `app/api/payments/create/route.ts`
- payment dashboard flow
- `.env.local` and deployment env vars

Environment variables:

```bash
MIDTRANS_SERVER_KEY=your-sandbox-server-key
MIDTRANS_CLIENT_KEY=your-sandbox-client-key
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-sandbox-client-key
```

Steps:

1. [x] Add server-only Midtrans helper.
2. [x] Add provider `midtrans` path to `POST /api/payments/create`.
3. [x] Generate unique Midtrans `order_id`.
4. [x] Send customer details: name, email, phone.
5. [x] Send item details: competition name, registration/team name, amount.
6. [x] Store Snap token, redirect URL, order ID, and raw response.
7. [x] Redirect user to Midtrans Sandbox Snap URL.
8. [x] Return user to `/dashboard` for minimum bug risk.
9. [x] Dashboard refreshes payment status after return.

Acceptance checks:

- [x] Sandbox transaction is created server-side.
- [x] User reaches Midtrans payment page.
- [x] Server key is never exposed to client.
- [x] Return to dashboard does not break registration/payment state.

## Phase 17: Midtrans Webhook

Status: Done

Goal: update payment status from verified Midtrans notifications.

Endpoint:

- `POST /api/payments/midtrans/notification`

Callback URL for deployed testing: `https://www.itbinsight.com/api/payments/midtrans/notification`.

Steps:

1. [x] Configure callback URL using `https://www.itbinsight.com` or a tunnel during testing.
2. [x] Verify Midtrans signature.
3. [x] Look up `midtrans_transactions.order_id`.
4. [x] Map Midtrans status to internal payment status.
5. [x] Store raw notification payload.
6. [x] Make endpoint idempotent.
7. [x] Do not auto-verify registration.

Acceptance checks:

- [x] Invalid signature is rejected.
- [x] Duplicate webhook is safe.
- [x] `settlement` or `capture` marks payment `paid`.
- [x] `expire` marks payment `expired`.
- [x] Registration status remains separate.

## Rollback And Safety Notes

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client code.
- Do not trust client-side status updates.
- Do not put PII in QR payload.
- If schema reset is used, confirm no production data must be preserved.
- If migration fails, stop before changing app code and fix schema first.
- If auth or RLS blocks normal user flow, fix policy before adding UI workarounds.

## Build Order Summary

1. Competition data shape.
2. Supabase schema.
3. Shared server helpers.
4. Ticket ensure after login.
5. Individual registration.
6. Team create/join/edit-before-submit.
7. Team final submit.
8. Admin overview and registration review.
9. Admin visitor list and QR check-in.
10. Legacy table cleanup.
11. Manual QA.
12. Final build/type verification.
13. Payment schema and state model.
14. Internal mock payment.
15. Admin payment visibility.
16. Midtrans Sandbox Snap.
17. Midtrans webhook.
