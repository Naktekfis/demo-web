schema_version: 1

# Admin Dashboard Spec

Source of truth: `docs/prd-itbinsight.md`

Related docs: `docs/IMPLEMENTATION-GUIDE.md`, `docs/MVP-SCOPE.md`, `docs/DATA-MODEL.md`, `docs/REGISTRATION-FLOWS.md`, `docs/API-CONTRACTS.md`, `docs/SUPABASE-SCHEMA-PLAN.md`, `docs/PAYMENT-MIDTRANS-PLAN.md`, `docs/PAYMENT-FLOWS.md`

Audience: web development team building the MVP admin surface.

## Purpose

This document defines the final MVP admin dashboard behavior. The MVP is competition registration only, plus visitor QR and admin-operated gate check-in.

The dashboard should be useful for a tight MVP timeline: enough structure for admin operations, without building the full PRD event platform.

## Route Structure

Use separate admin routes to keep each screen simple.

| Route | Purpose |
| --- | --- |
| `/admin` | Overview metrics and quick links. |
| `/admin/registrations` | Registration list, search, filters, export. |
| `/admin/registrations/[id]` | Registration detail and status update. |
| `/admin/visitors` | Visitor list and QR/check-in status. |
| `/admin/check-in` | QR scanner and manual QR token input. |

Rationale:

- One giant dashboard is faster at first, but becomes hard to maintain.
- Separate routes keep UI and API contracts clearer.
- Existing `/admin/check-in` can stay as the scan page.

## Admin Access

MVP access model:

- Use one effective permission level: `admin`.
- Implement with `admin_roles` table if schema work is happening now.
- If timeline is too tight, keep `ADMIN_EMAILS` as a temporary allowlist.
- Admin pages must remain accessible by direct URL for authorized admins, including after public header/navigation cleanup.
- Header navigation may expose an `Admin` entry only after the current logged-in user is confirmed as admin.
- Do not rely on header visibility as authorization. All `/admin*` pages and `/api/admin*` endpoints must keep server-side admin checks.

Future roles are deferred:

- `super_admin`
- `competition_admin`
- `gate_staff`

Do not build granular permissions in MVP unless the team has extra time. The UI and schema should not block adding them later.

## Admin Header Entry

Expected header behavior:

| User state | Header behavior |
| --- | --- |
| Guest | No `Dashboard` or `Admin` link. |
| Logged-in non-admin Visitor | Show `Dashboard`; do not show `Admin`. |
| Logged-in Admin | Show `Dashboard` and `Admin`. |

Implementation guidance:

- Prefer a server-backed admin check for header state, using the same `admin_roles` plus `ADMIN_EMAILS` fallback as privileged admin routes.
- If a client-side header needs admin state, expose only a minimal boolean such as `isAdmin`; never expose admin role rows, service-role data, or internal authorization details.
- The admin link should point to `/admin` and be present in both desktop and mobile header menus.
- The active header state should work for `/admin`, `/admin/registrations`, `/admin/visitors`, and `/admin/check-in`.
- Logging out from any `/admin*` page should send the user to the landing page (`/`) so a signed-out user is not left on a protected admin screen.
- Logging out from any `/dashboard*` page should also send the user to `/` for the same reason.

Regression checks:

- Authorized admin can open `/admin` directly from the browser address bar.
- Authorized admin can open `/admin` from the header.
- Non-admin logged-in user cannot see the header admin link.
- Non-admin logged-in user cannot access `/admin` by direct URL.
- Admin logout from `/admin*` lands on `/`.

## Admin UX Shell

All admin routes should use the same visual shell so committee users do not need to relearn navigation between operational screens.

Current implementation pattern:

- `components/admin/admin-chrome.tsx` owns the admin page shell, local admin navigation, panel styling, stat cards, and status badges.
- Admin pages keep the existing ITB Insight theme: light slate/indigo surface, rounded cards, bold `font-heading`, and compact operational density.
- Local admin navigation appears inside the admin header and links to `/admin`, `/admin/registrations`, `/admin/visitors`, and `/admin/check-in`.
- Primary actions stay in the page header, for example CSV export on `/admin/registrations` and dashboard back-link on `/admin`.
- Search and filter forms use a single elevated card with clear focus states.
- Status values should use consistent badges across overview, list, detail, and visitor screens.

UX acceptance checks:

- Admin routes have one consistent local navigation block.
- Admin list rows remain readable on mobile and desktop.
- Payment, registration, and check-in statuses use distinguishable badges without relying only on text position.
- Admin screens preserve server-side authorization and do not move privileged logic into client components.

## Overview Metrics

`/admin` should show PRD-aligned operational numbers.

| Metric | Definition |
| --- | --- |
| Total visitors | Count of signed-up users with visitor tickets. |
| Total checked-in visitors | Count of visitor tickets with `checked_in = true`. |
| Total competition registrations | Count of individual and team registrations. |
| Total teams | Count of created competition teams. |
| Submitted registrations | Count where registration status is `submitted`. |
| Verified registrations | Count where registration status is `verified`. |
| Rejected registrations | Count where registration status is `rejected`. |
| Paid payments | Count with latest/display payment status `paid`. |
| Pending payments | Count with latest/display payment status `pending`. |
| Per-competition registrations | Count grouped by competition. |

Out of MVP:

- Booth visits.
- Busiest booth.
- Gate-to-booth conversion.
- Sponsor click analytics.
- Feedback average rating.

## Registrations List

`/admin/registrations` should list both individual and team registrations.

Default columns:

| Column | Notes |
| --- | --- |
| Competition | Competition name or slug. |
| Type | `individual` or `team`. |
| Team name | Empty for individual registrations. |
| Team UID | Empty for individual registrations. |
| Primary contact | Individual user or team leader. |
| Email | Contact email. |
| Phone | Required for MVP registration data. |
| Institution | User or team member institution. |
| Status | `submitted`, `verified`, `rejected`. |
| Payment status | `unpaid`, `pending`, `paid`, `failed`, `expired`, `cancelled`. `unpaid` is display-only when no payment row exists. |
| Submitted at | Registration submission time. |
| Check-in status | Visitor ticket status for the primary user or member summary. |

## Search And Filters

Admin search should support:

- User name.
- User email.
- Phone number.
- Team name.
- Team UID.
- Competition name or slug.
- QR token.

Filters:

- Competition.
- Registration type: `individual`, `team`.
- Registration status: `submitted`, `verified`, `rejected`.
- Payment status: `unpaid`, `pending`, `paid`, `failed`, `expired`, `cancelled`.
- Check-in status: `checked_in`, `not_checked_in`.

Empty search result should show an empty state, not an error.

## Registration Detail

`/admin/registrations/[id]` should show:

- Competition name.
- Registration type.
- Registration status.
- Submitted timestamp.
- Admin note, if any.
- Individual participant data, or team summary.
- Team member list for team registrations.
- Each member's name, email, phone if available, institution, and role.
- Ticket/check-in status for linked users.

## Status Updates

Allowed registration statuses:

- `submitted`
- `verified`
- `rejected`

Meaning:

| Status | MVP meaning |
| --- | --- |
| `submitted` | Submitted, waiting for payment/admin review. |
| `verified` | Temporarily approved by admin. Final meaning will depend on future payment/berkas rules. |
| `rejected` | Rejected by admin. |

Status update rules:

- Admin can change `submitted` to `verified`.
- Admin can change `submitted` to `rejected`.
- Admin can change `verified` back to `submitted` if needed.
- Admin can change `rejected` back to `submitted` if needed.
- `rejected` should require a note.
- Other status changes may include an optional note.

Clarification:

- Final definition of `verified` is deferred until payment and required-file rules are implemented.
- For MVP, `verified` only means admin has manually accepted the registration record.
- Payment status is separate. `paid` does not automatically mean `verified`.

## Payment Visibility

Admin registration views should show:

- Payment status.
- Payment provider: `mock` or `midtrans`.
- Gross amount.
- Currency.
- Midtrans order ID, if available.
- Paid at.
- Expired at.
- Latest payment attempt.

Mock/demo override:

- No admin payment override UI is implemented in the current code.
- Mock status changes are available through the visitor-owned mock payment page/actions.
- Production Midtrans status must come from server-side transaction creation or verified webhook.

## Team Administration

Team behavior in MVP:

- Leader can create a team.
- Member can join by team UID.
- Leader can remove a member before submission.
- Member can leave before submission.
- After team registration is submitted, team membership cannot be edited by users.
- Admin can inspect submitted team membership.

Admin override for team membership is not required in MVP.

## Visitors Page

`/admin/visitors` should include all signed-up visitors, not only competition participants.

Default columns:

- Name.
- Email.
- Phone.
- Institution.
- QR token short display.
- Check-in status.
- Checked-in timestamp.

Search should support:

- Name.
- Email.
- Phone.
- QR token.
- Check-in status.

## QR Check-In

Gate check-in rule:

- All Visitors with a QR can be checked in.
- Check-in does not require competition registration.
- Check-in does not require registration status `verified`.

MVP QR scanner behavior:

1. Admin opens `/admin/check-in`.
2. Admin scans QR or inputs QR token manually.
3. System validates token.
4. System rejects unknown token.
5. System rejects duplicate check-in with a clear message.
6. System marks valid ticket as checked in.
7. System stores `checked_in_at` and `checked_in_by` when available.

Geofence:

- Skip geofence for MVP.
- Do not require admin location permission.
- Keep geofence as a future optional config if needed.

QR payload:

- Use an opaque random token only.
- Do not put user metadata in the QR payload.
- Do not rely on client-visible QR content for authorization.

## CSV Export

`/admin/registrations` should support CSV export.

Recommended columns:

- `competition_name`
- `competition_slug`
- `registration_type`
- `registration_status`
- `payment_status`
- `payment_provider`
- `payment_amount`
- `payment_currency`
- `payment_midtrans_order_id`
- `payment_expired_at`
- `payment_attempted_at`
- `paid_at`
- `team_name`
- `team_uid`
- `member_role`
- `member_name`
- `member_email`
- `member_phone`
- `institution`
- `submitted_at`
- `checked_in`
- `checked_in_at`

Export rules:

- Admin-only.
- Export current filtered result when filters are active.
- Do not expose service-role keys or internal IDs unless needed for operations.

## Error States

| Case | UI response |
| --- | --- |
| Not logged in | Redirect to login. |
| Logged in but not admin | Show access denied or redirect to dashboard. |
| Admin check fails unexpectedly | Show retryable error and log server-side details without exposing secrets. |
| Search empty | Show empty state. |
| Export fails | Show retryable error. |
| QR unknown | Show ticket not found. |
| QR duplicate | Show already checked in with timestamp. |
| Status update fails | Keep previous status visible and show error. |

## Acceptance Criteria

- Admin can open `/admin` directly after login.
- Admin sees an `Admin` link in the desktop and mobile header.
- Non-admin users do not see the `Admin` header link.
- Admin can see overview metrics.
- Admin can list all visitors.
- Admin can list all competition registrations.
- Admin can search by name, email, phone, team name, team UID, competition, QR token, and status.
- Admin can open registration detail.
- Admin can update registration status.
- Rejection requires a note.
- Admin can export registration CSV.
- Admin can scan QR without geofence.
- Unknown QR is rejected.
- Duplicate QR scan is rejected clearly.
- Admin UI uses the shared admin shell for overview, registration list/detail, visitor list, and check-in pages.
- Logging out while on `/admin*` or `/dashboard*` redirects to `/`.
