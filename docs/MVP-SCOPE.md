schema_version: 1

# ITB Insight MVP Scope

Source of truth: `docs/prd-itbinsight.md`

Related docs: `docs/IMPLEMENTATION-GUIDE.md`, `docs/IMPLEMENTATION-GAP.md`, `docs/DATA-MODEL.md`, `docs/REGISTRATION-FLOWS.md`, `docs/ADMIN-DASHBOARD.md`, `docs/API-CONTRACTS.md`, `docs/SUPABASE-SCHEMA-PLAN.md`, `docs/PAYMENT-MIDTRANS-PLAN.md`, `docs/PAYMENT-FLOWS.md`

Audience: web development team and internal stakeholders deciding what is included in the first usable release.

## Purpose

This document defines the agreed MVP boundary for the current implementation cycle. It intentionally narrows the full PRD into a competition-registration-first product with minimal backend support.

The MVP is not the full ITB Insight event platform. The full PRD still includes event pages, RSVP, booth tracking, sponsor features, feedback, analytics, and gamification, but those are outside this first scope unless explicitly moved back in.

## MVP Goal

The MVP goal is competition registration only, with a minimal account system, visitor QR, admin dashboard, and admin-operated gate check-in.

Payment is implemented after the core registration MVP using a two-stage rollout: internal mock payment first, then Midtrans Sandbox Snap. Payment success does not automatically verify a registration.

## Roles

| Role | Meaning | MVP access |
| --- | --- | --- |
| Guest | User who has not signed up or logged in. | Can view landing page and competition information. |
| Visitor | User who has signed up or logged in and has a QR ticket. | Can view own profile, QR ticket, and competition registration flows. |
| Competition Participant | Visitor who has joined or submitted a competition registration. | Can view own competition registration status and team membership. |
| Admin | Committee user with admin access. | Can view admin dashboard, scan QR for gate check-in, search registrations, export data, and update registration status. |

## In Scope

### Public and Auth

- Guest can open the landing page.
- Guest can open competition list and competition detail pages.
- Guest is redirected to login when trying to register.
- Guest does not see authenticated-only Dashboard navigation.
- `Berita` and `Galeri` are hidden from primary navigation until content is ready.
- Visitor can sign up or log in.
- Google sign-in should use professional ITB Insight branding in the OAuth account chooser and consent experience before launch.
- Visitor can see the Dashboard navigation after login.
- Logging out from `/dashboard*` redirects the user to the landing page instead of leaving them on a protected dashboard route.
- Visitor profile is created or ensured after sign-up/login.
- Visitor QR ticket is created or ensured after sign-up/login.
- Visitor can open a ticket page that displays their QR.

### Competition Registration

- Competition data is hardcoded for now.
- CMS/Sanity may stay in the codebase, but the MVP docs treat hardcoded data as the operational source for launch.
- Competition can be individual or team-based.
- Individual competition registration can be submitted by one logged-in visitor.
- Team-based competition uses a leader/member flow.
- Team leader creates a team first.
- System returns a team name and team UID.
- Team members must log in before joining a team.
- Team members join using the team UID.
- Registration starts with status `submitted`.
- Payment status is tracked separately from registration status.
- Admin can update registration status to `verified` or `rejected`.

### Admin Dashboard

- Admin can access a protected admin dashboard.
- Admin can see an Admin navigation entry in the header after login.
- Logging out from `/admin*` redirects the user to the landing page instead of leaving them on a protected admin route.
- Admin can view competition registration list.
- Admin can view registration detail, including team and member data.
- Admin can search by name, email, team name, or team UID.
- Admin can filter or identify registration status.
- Admin can update status: `submitted`, `verified`, `rejected`.
- Admin can see payment status for registrations.
- Admin can export registration data as CSV.

### Gate Check-In

- Gate check-in is performed by Admin, not self-service visitor check-in.
- Visitor shows their QR ticket.
- Admin scans the QR from the admin dashboard or admin scan page.
- System validates the QR.
- System marks the visitor as checked in.
- Duplicate scan returns an already-checked-in response.
- Current QR is only for gate check-in, but the data model should stay flexible enough for future use.

## Out Of Scope

The following PRD areas are out of MVP scope for now:

- Booth QR tracking.
- Booth visit points, leaderboard, progress tracker, or reward claim.
- Public RSVP for invited guests or Alumni Gathering.
- Event program pages for all main-event programs.
- Public news and gallery promotion in primary navigation until content ownership and final assets are ready.
- External GForm routing because current decision is no GForm in MVP.
- Partnership inquiry form.
- Sponsor and media-partner logo wall.
- Sponsor hotspot map cards.
- Feedback forms and feedback dashboard.
- Inspirates recap input and school activity summary.
- Basic analytics dashboard beyond registration/check-in counts.
- AI booth recommendation.
- Real-time heatmap.
- Social sharing.
- Easter egg.

## Acceptance Criteria

### Guest

- Can open `/` without logging in.
- Can open `/competitions` without logging in.
- Can open `/competitions/[slug]` without logging in.
- Does not see `Dashboard`, `Berita`, or `Galeri` in the primary header navigation.
- Does not see `Admin` in the primary header navigation.
- Opening `/dashboard` directly redirects to login with a return path.
- When clicking register, is sent to login with a return path.

### Visitor

- Can log in or sign up.
- Sees `Dashboard` in the primary header navigation after login.
- Does not see `Admin` in the primary header navigation unless authorized as admin.
- Has a profile row after login.
- Has a QR ticket after login.
- Can see own QR ticket.
- Can understand the dashboard first screen without decorative animation or unclear interactive graphics.
- Logging out from dashboard routes returns to the landing page.
- Can submit individual competition registration when competition type is individual.
- Can pay for own submitted individual registration from dashboard.
- Can create a team when competition type is team-based and user is the team leader.
- Can join an existing team with team UID.
- Can see own registration or team membership status.

### Competition Participant

- Has registration status visible as `submitted`, `verified`, or `rejected`.
- Has payment status visible as `pending`, `paid`, `failed`, `expired`, or `cancelled` when payment is required.
- Cannot see another participant's private registration data.
- Cannot join a team without logging in.
- Cannot join a team with an invalid team UID.

### Admin

- Can open admin dashboard only when authorized.
- Can open `/admin` directly after login.
- Sees `Admin` in the desktop and mobile header navigation.
- Can list competition registrations.
- Can search by name, email, team name, or team UID.
- Can open registration details.
- Can update registration status.
- Can view payment status.
- Can export CSV.
- Can scan visitor QR for gate check-in.
- Can see duplicate QR scans rejected clearly.
- Logging out from admin routes returns to the landing page.
- Admin screens use consistent local navigation, cards, filters, and status badges.

## Non-Functional Requirements

- Keep personal data minimal.
- Keep service-role credentials server-only.
- Use route handlers for privileged writes.
- Avoid trusting payment or registration status from client-side state.
- Keep launch-critical UI focused on clear tasks and statuses; avoid decorative animation that obscures the next action.
- Keep admin operations visually consistent across overview, registration review, visitor list, and QR check-in screens.
- Production favicon and app icon requests must not return 404.
- OAuth login should not expose the raw Supabase project reference as the primary app identity in the Google account chooser for launch.
- Keep data model extensible for future booth tracking and payment.
- Build must pass with `npm run build` before handoff.

## Deferred Decisions

| Decision | Current MVP stance | Future note |
| --- | --- | --- |
| Payment | Mock and Midtrans Sandbox Snap are implemented. | Production Midtrans go-live, callback configuration, and final verification rules still need confirmation. |
| OAuth branding | Must be professional before launch. | Configure custom Google OAuth app branding and, if available, Supabase custom auth domain such as `auth.itbinsight.com`. |
| RSVP table naming | `visitor_tickets` is the MVP ticket/check-in table. | Use a separate future RSVP model for invited guests/alumni if that PRD scope returns. |
| Competition content source | Hardcoded for MVP. | Sanity can become the content source after data shape is stable. |
| News and gallery launch | Routes can remain in the codebase, but header links stay hidden for MVP. | Re-enable after final editorial owner, assets, and content model are confirmed. |
| Booth tracking | Not in MVP. | Data model should not block adding booth visits later. |
| Privacy retention | Minimal for MVP. | Formal retention and deletion policy should be defined before production scale. |

## Verification

Run after implementation changes:

```bash
npm run build
```

Optional manual checks:

- Log in as a visitor.
- Confirm guest header hides Dashboard, Berita, and Galeri.
- Confirm logged-in header shows Dashboard.
- Confirm admin header shows Admin only for authorized admins.
- Confirm logout from `/dashboard*` and `/admin*` lands on `/`.
- Confirm `/admin` works by direct URL for authorized admins.
- Confirm `/favicon.ico` and app icons return 200 in production.
- Confirm Google account chooser/consent no longer presents the raw Supabase project reference as the user-facing app identity before launch.
- Confirm QR ticket is created.
- Register for an individual competition.
- Create a team and join it with another logged-in account.
- Log in as admin.
- Search registration data.
- Update registration status.
- Scan QR and verify duplicate scan handling.
