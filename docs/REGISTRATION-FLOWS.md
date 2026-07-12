schema_version: 1

# ITB Insight Registration Flows

Source of truth: `docs/prd-itbinsight.md`

Related docs: `docs/MVP-SCOPE.md`, `docs/DATA-MODEL.md`, `docs/ADMIN-DASHBOARD.md`, `docs/API-CONTRACTS.md`, `docs/SUPABASE-SCHEMA-PLAN.md`, `docs/PAYMENT-FLOWS.md`, `docs/QA-CHECKLIST.md`

Audience: web development team implementing the MVP user and admin flows.

## Purpose

This document defines the MVP registration flows for ITB Insight. The MVP is competition registration only, with visitor QR creation and admin-operated gate check-in.

Payment is implemented as a separate post-registration flow through mock payment and optional Midtrans Sandbox. Booth tracking, RSVP, feedback, sponsor features, and advanced analytics are not part of this MVP.

## Flow Summary

| Flow | Actor | Result |
| --- | --- | --- |
| A. Browse as Guest | Guest | User can understand event and competition options before login. |
| B. Sign Up or Login | Guest -> Visitor | Profile and QR ticket are created or ensured. |
| C. Individual Competition Registration | Visitor | User submits an individual registration with status `submitted`. |
| D. Team Competition Registration | Visitor / Team Leader / Team Member | Leader creates team, members join with UID, registration is submitted. |
| E. Admin Registration Review | Admin | Admin searches, reviews, exports, verifies, or rejects registrations. |
| F. Gate Check-In | Admin + Visitor | Admin scans visitor QR and marks attendance. |
| G. Payment | Visitor or team leader + Admin | User pays from dashboard; admin still verifies registration separately. |

## Flow A: Browse As Guest

Goal: let users discover competitions before committing to login.

Steps:

1. Guest opens landing page.
2. Guest opens competition list.
3. Guest opens competition detail.
4. Guest clicks register.
5. System redirects Guest to login.
6. System preserves return path to the selected competition registration flow.

Expected behavior:

- Public pages do not require login.
- Registration action requires login.
- Header navigation for Guests includes only launch-ready public pages.
- `Berita` and `Galeri` are hidden from header navigation while dormant.
- `Dashboard` is hidden from header navigation until login.
- `Admin` is hidden from header navigation unless the logged-in user is authorized as admin.
- Direct Guest access to `/dashboard*` redirects to login with `next` preserved.
- Competition content is hardcoded for MVP.

Failure states:

| Failure | Expected response |
| --- | --- |
| Competition slug does not exist | Show competition-not-found page or message. |
| Registration is closed | Show clear closed-registration state and disable submit. |
| Login return path missing | Redirect to dashboard after login. |

## Flow B: Sign Up Or Login

Goal: create a Visitor account and ensure the Visitor has a QR ticket.

Steps:

1. Guest opens login page.
2. Guest signs up or logs in.
3. System creates or ensures `profiles` row.
4. System creates or ensures one QR ticket for the user.
5. System redirects user to the preserved return path or dashboard.
6. User is now a Visitor.
7. Header navigation can now show `Dashboard`.
8. If the user is an authorized admin, header navigation can also show `Admin`.

Logout behavior:

- If the user logs out from `/dashboard*`, redirect to the landing page (`/`) after Supabase sign-out completes.
- If the user logs out from `/admin*`, redirect to `/` after Supabase sign-out completes.
- If the user logs out from a public route, refresh the current route so the header clears authenticated-only links without forcing a landing-page redirect.

OAuth branding rule:

- The Google account chooser and consent experience should identify the app professionally as ITB Insight or an approved event domain.
- Avoid launch configurations where the primary user-facing identity is the raw Supabase project reference, for example `*.supabase.co`.
- Preferred production setup: custom Google OAuth credentials with an approved consent screen name and, when available, a Supabase custom auth domain such as `auth.itbinsight.com`.

QR creation rule:

- QR ticket should be created on first successful sign-up/login.
- If a QR already exists, reuse it.
- QR should not be regenerated on every login.

Recommended implementation:

- Keep profile creation in the existing Supabase auth trigger or server-side ensure function.
- Add an ensure-ticket step after login/callback or when rendering ticket/dashboard.
- Current code uses `visitor_tickets` for QR storage. `rsvp` is legacy and should not be used for new MVP work.

Failure states:

| Failure | Expected response |
| --- | --- |
| Auth provider fails | Show login error and allow retry. |
| OAuth app branding is not approved | Treat as a launch-readiness blocker, not a code bug. |
| Profile creation fails | Block registration and show support/admin message. |
| QR creation fails | Allow login, but ticket page should show recoverable error. |
| Logout from protected route leaves stale protected UI visible | Redirect to `/` and refresh route state. |

## Flow C: Individual Competition Registration

Goal: allow one logged-in Visitor to register for an individual competition.

Preconditions:

- User is logged in.
- User has a profile.
- User has a QR ticket.
- Competition exists and is active.
- Competition `registration_type` is `individual`.

Steps:

1. Visitor opens competition detail.
2. Visitor clicks register.
3. System opens individual registration form.
4. Visitor confirms minimal registration data.
5. System validates required data.
6. System creates `competition_registrations` row with `registration_kind = individual`.
7. System sets registration status to `submitted`.
8. System does not create a payment row during registration.
9. System shows success state.
10. Visitor can create or resume payment from the dashboard. Until a payment row exists, the UI may display `unpaid` as a derived state.

Minimal data:

- User ID.
- Competition ID or slug.
- Name from profile.
- Email from profile.
- Phone from profile. Current API blocks registration when phone is missing.
- Institution if required by the specific flow.

Failure states:

| Failure | Expected response |
| --- | --- |
| User is not logged in | Redirect to login with return path. |
| Duplicate registration | Show already-registered message and link to dashboard. |
| Competition inactive or closed | Block submit and explain status. |
| Server validation fails | Show actionable error. |

## Flow D: Team Competition Registration

Goal: support team-based competitions where the leader creates a team and members join with UID.

Preconditions:

- Users must be logged in before creating or joining a team.
- Competition exists and is active.
- Competition `registration_type` is `team`.

### D1: Leader Creates Team

Steps:

1. Visitor opens team competition detail.
2. Visitor clicks register or create team.
3. System opens create-team form.
4. Visitor enters team name.
5. System validates team name and competition capacity rules.
6. System creates `competition_teams` row.
7. System creates leader row in `competition_team_members`.
8. System generates team UID.
9. System shows team name and team UID to leader.
10. Leader shares team UID with members.

Team UID rules:

- UID must be unique.
- UID should be random enough to avoid guessing.
- UID should be safe to share with intended members.
- UID should not expose sequential database IDs.

Failure states:

| Failure | Expected response |
| --- | --- |
| Team name already exists in same competition | Ask leader to choose another name. |
| User already leads or joined another team in same competition | Block duplicate team membership. |
| UID generation collision | Retry generation server-side. |

### D2: Member Joins Team

Steps:

1. Visitor logs in.
2. Visitor opens join-team page or registration form.
3. Visitor enters team UID.
4. System validates UID.
5. System verifies team belongs to the selected competition.
6. System checks team size limit.
7. System creates member row in `competition_team_members`.
8. System shows joined-team success state.

Failure states:

| Failure | Expected response |
| --- | --- |
| UID invalid | Show invalid UID message. |
| Team is full | Show team-full message. |
| User already joined this team | Show already-joined message. |
| User joined another team in same competition | Block and explain. |

### D3: Leader Submits Team Registration

Steps:

1. Leader opens team dashboard or competition registration page.
2. System shows current members.
3. System validates team member count against `team_min` and `team_max`.
4. Leader submits final registration.
5. System creates `competition_registrations` row with `registration_kind = team`.
6. System sets registration status to `submitted`.
7. System does not create a payment row during team submission.
8. System sets team status to `submitted`.
9. Dashboard shows submitted registration and payment CTA. Until a payment row exists, the UI may display `unpaid` as a derived state.

Failure states:

| Failure | Expected response |
| --- | --- |
| Team below minimum size | Block submit and show required member count. |
| Team above maximum size | Block submit and require removal/admin handling. |
| Non-leader tries to submit | Block action. |
| Registration already submitted | Show existing status. |

## Flow E: Admin Registration Review

Goal: allow Admin to operate the registration system without direct database access.

Preconditions:

- Admin is logged in.
- Admin is authorized by `admin_roles` or temporary `ADMIN_EMAILS` allowlist.

Steps:

1. Admin opens admin dashboard.
2. System verifies admin access.
3. Header shows `Admin` for authorized admin users.
4. Dashboard lists competition registrations.
5. Admin searches by name, email, team name, or team UID.
6. Admin opens registration detail.
7. Admin reviews participant or team data.
8. Admin updates status to `verified` or `rejected`.
9. System stores updated status.
10. Admin can export CSV when needed.

Status rules:

| Status | Meaning |
| --- | --- |
| `submitted` | Submitted and waiting for payment/admin review. |
| `verified` | Accepted or administratively approved. |
| `rejected` | Rejected by admin. |

Failure states:

| Failure | Expected response |
| --- | --- |
| User is not admin | Return 403 or redirect away from dashboard. |
| Admin header state is stale | Keep server-side `/admin*` checks authoritative and refresh header state. |
| Search has no result | Show empty state, not an error. |
| Export fails | Show retryable error. |
| Status update race | Re-fetch latest status and show current value. |

## Flow F: Gate Check-In

Goal: admin checks in visitors at the gate by scanning QR.

Preconditions:

- Visitor has a QR ticket.
- Admin is logged in.
- Admin has access to admin scan page.

Steps:

1. Visitor arrives at gate.
2. Visitor opens or shows QR ticket.
3. Admin opens admin scan page.
4. Admin scans QR or enters QR manually.
5. System validates QR exists.
6. System checks whether ticket is already checked in.
7. System marks ticket as checked in.
8. System stores check-in timestamp.
9. System shows success message to Admin.

Duplicate scan behavior:

- If ticket is already checked in, do not update the row again.
- Show checked-in timestamp if available.
- Make duplicate result visually distinct from success.

Current implementation note:

- Existing code uses `visitor_tickets.checked_in` and `visitor_tickets.checked_in_at`.
- QR check-in is admin-operated and does not require geofence/location permission.

Failure states:

| Failure | Expected response |
| --- | --- |
| QR does not exist | Show ticket-not-found error. |
| QR already checked in | Show duplicate check-in message. |
| Admin session expired | Ask Admin to log in again. |
| Scanner unsupported | Allow manual QR/code input. |

## Flow G: Payment

Payment starts after registration submission and starts from the dashboard.

Current implementation supports internal mock payment and Midtrans Sandbox Snap. Midtrans webhook endpoint is implemented and verifies signatures before updating payment status.

Rules:

- Individual participant pays for their own registration.
- Team leader pays for team registration.
- Payment transaction must be created server-side.
- Client must not be trusted as the source of payment truth.
- Midtrans webhook updates payment status server-side after signature verification.
- Registration status and payment status are separate fields.
- Payment success sets `payment_status = paid`, not `registration_status = verified`.
- Admin verifies registration separately.

Status model:

| Field | Example values |
| --- | --- |
| `payment_status` | Stored values: `pending`, `paid`, `failed`, `expired`, `cancelled`. Display-only value: `unpaid` when no payment row exists. |
| `registration_status` | `submitted`, `verified`, `rejected` |

## Route Surface

| Surface | Purpose |
| --- | --- |
| `/auth/login` | Visitor login/sign-up. |
| `/auth/callback` | Auth callback and post-login redirect. |
| `/about` | Public event/about page linked from the primary header. |
| `/map` | Public venue map page linked from the primary header. |
| `/terms` | Public terms/refund policy page linked from the footer. |
| `/dashboard` | Protected Visitor dashboard and registration status. Header link is visible only after login. |
| `/dashboard/my-tickets` | Visitor QR ticket. |
| `/competitions` | Public competition list. |
| `/competitions/[slug]` | Public competition detail. |
| `/news` | Dormant public news route. Hide from primary navigation until content is ready. |
| `/gallery` | Dormant public gallery route. Hide from primary navigation until content/assets are ready. |
| `/dashboard/register-competition` | Visitor registration entry point. |
| `/dashboard/teams/create` | Team creation page. |
| `/dashboard/teams/join` | Join-team-by-UID page. |
| `/dashboard/payments/[id]/mock` | Internal mock payment page. |
| `/admin` | Admin dashboard. |
| `/admin/registrations` | Admin registration list, filters, status action, and CSV export. |
| `/admin/registrations/[id]` | Admin registration detail and status action. |
| `/admin/visitors` | Admin visitor/ticket list. |
| `/admin/check-in` | Admin QR scan page. |
| `/api/tickets/ensure` | Ensure current visitor has one QR ticket. |
| `/api/registrations/individual` | Submit individual registration. |
| `/api/registrations/team` | Submit final team registration. |
| `/api/teams` | Create team endpoint. |
| `/api/teams/join` | Join team endpoint. |
| `/api/teams/[teamId]/members/[memberId]` | Leader removes a member before submission. |
| `/api/teams/[teamId]/leave` | Member leaves before submission. |
| `/api/admin/overview` | Admin overview metrics. |
| `/api/admin/me` | Minimal endpoint for client header admin state; unauthenticated requests return `isAdmin: false`. |
| `/api/admin/registrations` | Admin list/search/filter endpoint. |
| `/api/admin/registrations/[id]/status` | Admin status update endpoint. |
| `/api/admin/registrations/export` | Admin CSV export endpoint. |
| `/api/admin/visitors` | Admin visitor list endpoint. |
| `/api/admin/check-in` | Admin gate check-in endpoint. |
| `/api/payments/create` | Create or reuse mock/Midtrans payment. |
| `/api/payments/[id]` | Load payment detail. |
| `/api/payments/mock/settle` | Mark mock payment as paid. |
| `/api/payments/mock/fail` | Mark mock payment as failed. |
| `/api/payments/mock/expire` | Mark mock payment as expired. |
| `/api/payments/midtrans/notification` | Midtrans webhook notification endpoint. |

## Implementation Order

Recommended order for MVP build:

1. Ensure QR ticket is created after sign-up/login.
2. Use `visitor_tickets` for QR/check-in storage.
3. Add competition type: `individual` or `team`.
4. Implement individual registration using current minimal fields.
5. Implement team creation with team UID.
6. Implement team join with UID.
7. Implement final team registration submit.
8. Build admin dashboard list/search/detail/status update.
9. Add CSV export.
10. Add mock and Midtrans payment flows.
11. Keep admin QR scan/check-in working without geofence.
12. Hide dormant public nav links and simplify dashboard UX before launch.
13. Restore and verify admin header access, production favicon, and OAuth branding.

## Verification Checklist

- Guest can browse competition info.
- Guest is redirected to login before registration.
- Guest does not see Dashboard, Berita, or Galeri in header navigation.
- Logged-in Visitor sees Dashboard in header navigation.
- Logged-in Admin sees Admin in header navigation.
- Logged-in non-admin Visitor does not see Admin in header navigation.
- Direct guest access to `/dashboard` redirects to login with return path.
- Authorized Admin can open `/admin` directly.
- Production `/favicon.ico` returns 200.
- Google OAuth account chooser/consent uses professional ITB Insight branding before launch.
- New Visitor gets one QR ticket.
- Returning Visitor keeps same QR ticket.
- Visitor can submit individual competition registration.
- Leader can create team and receive UID.
- Member can join team with valid UID.
- Invalid UID fails clearly.
- Team cannot submit below minimum size.
- Admin can search registration by team UID.
- Admin can update registration status.
- Admin can export registration CSV.
- Admin can scan QR and mark check-in.
- Duplicate QR scan is rejected clearly.
- Dashboard first screen is readable without decorative animation.
