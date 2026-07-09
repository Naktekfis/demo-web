schema_version: 1

# ITB Insight Implementation Gap

Source of truth: `docs/prd-itbinsight.md`

Audit date: 2026-07-09

Audience: web development team and internal stakeholders deciding what to build next.

Related docs: `docs/IMPLEMENTATION-GUIDE.md`, `docs/MVP-SCOPE.md`, `docs/DATA-MODEL.md`, `docs/REGISTRATION-FLOWS.md`, `docs/ADMIN-DASHBOARD.md`, `docs/API-CONTRACTS.md`, `docs/SUPABASE-SCHEMA-PLAN.md`, `docs/PAYMENT-MIDTRANS-PLAN.md`, `docs/PAYMENT-FLOWS.md`

## Purpose

This document maps the current implementation against the latest PRD. It is intentionally scoped to implementation planning, not product copy or brand guidelines.

`README.md` remains the quick project overview. `docs/prd-itbinsight.md` remains the product requirements source of truth.

## Current Implementation Snapshot

| Area | Current status | Evidence |
| --- | --- | --- |
| Landing page | Partial | Landing route and sections exist in `app/page.tsx` and `components/landing/*`. Hero/countdown/static public sections exist, but PRD social proof metrics are not fully data-backed. |
| Auth | Partial | Google OAuth/magic-link login exists in `app/auth/login/page.tsx`; dashboard routes are protected by `middleware.ts` through Supabase middleware. Production OAuth branding still needs verification so users do not see the raw Supabase project reference as the app identity. |
| Visitor QR ticket | Implemented for MVP | `visitor_tickets` is the active table. `POST /api/tickets/ensure` creates/reuses one opaque QR per visitor. |
| Gate check-in | Implemented for MVP | `/admin/check-in` and `POST /api/admin/check-in` validate `qrCode`, update `visitor_tickets`, and do not require geofence. |
| Competition catalog | Partial | Public list/detail routes exist. `lib/competitions.ts` can read Sanity when configured and falls back to hardcoded competition data. Production content source is still an open decision. |
| Individual registration | Implemented for MVP | `POST /api/registrations/individual` inserts `competition_registrations` with status `submitted` after auth/profile/phone checks. |
| Team registration | Implemented for MVP | `POST /api/teams`, `POST /api/teams/join`, member remove/leave endpoints, and `POST /api/registrations/team` implement team UID flow and lock membership after submission. |
| Participant dashboard | Implemented for MVP, needs UX cleanup | `/dashboard` shows registration/team/payment state; `/dashboard/my-tickets` shows QR ticket. Current opening dashboard component uses decorative neural animation that should be removed before launch. |
| Admin registration review | Implemented for MVP, regression needs verification | `/admin`, `/admin/registrations`, `/admin/registrations/[id]`, `/admin/visitors`, and admin APIs support metrics, search/filter, detail, status updates, visitor list, and CSV export. After Phase 18 navigation cleanup, direct `/admin` access and admin header entry must be re-verified. |
| Payment | Implemented for MVP sandbox/demo | `payments` and `midtrans_transactions` exist. `POST /api/payments/create` supports `mock` and `midtrans`; mock settle/fail/expire endpoints and Midtrans webhook are implemented. Production go-live remains open. |
| Venue map | Partial | MapLibre venue map exists in `components/map/venue-map.tsx` with static markers/filtering. Booth QR tracking and sponsor hotspot data are not implemented. |
| Content pages | Partial | About, map, public competitions, auth, dashboard, and admin pages exist. News and gallery routes exist but should be hidden from primary navigation until content/assets are ready. Full PRD program pages are not implemented. Production favicon/app icon is currently a launch-readiness gap if `/favicon.ico` returns 404. |
| Data schema | Implemented for MVP | Latest effective migration is `supabase/migrations/0004_payment_schema.sql`. Legacy `rsvp`/`registrations` from `0001` are superseded. |

## Gap Size

Overall gap against the full PRD: medium-to-large.

The current code now covers the narrowed MVP well: auth, visitor QR, competition registration, team UID flow, admin review/export/check-in, and mock/Midtrans Sandbox payment. The immediate launch-polish gap after Phase 18 is admin access/header regression, production favicon, and professional OAuth branding. The larger remaining gap is mostly full-event platform scope from the PRD: booth operations, public RSVP/alumni flows, event program pages, sponsor/partner features, feedback, analytics, gamification, final content, and production payment operations.

| Scope | Approximate coverage | Meaning |
| --- | --- | --- |
| Narrow MVP docs | About 80-90 percent implemented | Core user/admin/payment paths exist; production env/content/payment policy still need confirmation. |
| Full PRD must-have surface | About 40-50 percent implemented or partially implemented | Competition registration and QR gate check-in are strong; event/booth/sponsor/feedback requirements remain mostly missing. |
| Full PRD should/could surface | About 15-25 percent implemented or partially implemented | Countdown/map/gallery exist partially; advanced engagement and analytics are absent. |

## Must-Have Gap Matrix

| PRD ID | Requirement | Status | Gap |
| --- | --- | --- | --- |
| MK-01 | Sign-up/login, profile data, pre-registration | Partial | Login/profile exists. Generic event pre-registration button is not implemented; MVP uses visitor ticket plus competition registration. |
| MK-02 / EV-01 | Unique QR generated and gate validation | Partial | Visitor QR and admin gate validation exist. QR email delivery and full visitor registration-status display at gate are not fully specified/verified. |
| EV-02 | Separate QR per booth | Missing | No booth QR model, booth scan endpoint, or booth visit log. |
| MK-04 | Landing headline numbers for visitors, exhibitors, collaborators | Partial | Static/public stats exist, but not all required metrics and not fully data-backed. |
| MK-08 / EV-07 | Invited guest RSVP and Alumni Gathering page | Missing | `rsvp` is legacy and not the PRD RSVP flow. No invited-guest/alumni RSVP implementation. |
| CP-01 | Group participants by competition | Implemented for MVP | Admin registration data groups/filter/searches by competition. Full reporting can still be improved. |
| CPT-03 | Competition description and requirements | Partial | Public competition detail exists; content completeness depends on final hardcoded/Sanity data. |
| CPT-05 | Guidebook/syllabus link after choosing competition | Partial | `guideBookUrl` exists in the competition type, but fallback data currently does not include real guidebook links. |
| CPT-07 | Timeline and total prize pool per competition | Missing | No finalized timeline/prize-pool model rendered per competition in current fallback data. |
| CPT-10 | Robot registration file upload for sketch | Missing | No file upload or storage validation path. |
| EV-03 | Central database and committee dashboard | Partial | MVP admin dashboard covers registrations, visitors, check-in, and payment. Booth scans, event recap, and broader analytics are missing. |
| EV-04 | Event info pages for all main programs | Partial | Generic content pages exist. Exhibition, play-tech, show-tech, tech seminar, Insight on Stage, Alumni Gathering, and Inspirates pages are not implemented as PRD-specific pages. |
| EV-05 | External GForm registration links | Missing by MVP decision | Current MVP docs say no GForm in MVP. Which future flows stay external is still open. |
| EV-06 | Inspirates recap input panel | Missing | No Inspirates schema, admin form, or dashboard recap. |
| EV-10 / SPON-01 / CB-3 | Interactive map with booths, sponsor hotspots, photo spots | Partial | Static venue map exists. Booth categories, sponsor profile cards, visit-site links, and photo-spot pins are missing. |
| CB-01 | Documentation gallery or aftermovie | Partial | Gallery route exists with placeholder/static content; final assets/model are not confirmed. |
| MK-03 / EV-13 | In-website feedback | Missing | No feedback pages, forms, QR feedback routing, or feedback table. |
| MK-09 / SPON-03 | Partnership inquiry form | Missing | No partnership form, database table, or email routing. |
| MK-07 / SPON-02 | Tiered sponsor/media-partner logo wall | Missing | No partner data model or logo wall UI. |

## Should-Have Gap Matrix

| PRD ID | Requirement | Status | Gap |
| --- | --- | --- | --- |
| EV-08 | Booth scan only after gate check-in | Missing | Requires booth scan system first. |
| MK-05 / CPT-04 | Countdown component for landing and competition registration | Partial | Landing countdown exists. Competition fee exists in payment logic, but competition page countdown/prize/timeline presentation is incomplete. |
| MK-06 | Social media account links | Missing | No finalized social link section found in current implementation. |
| CPT-02 | Confirmation email proof | Missing/unclear | No current MVP API contract guarantees email proof after registration/payment. Open decision for production email provider/content. |
| CPT-06 | Competition layout with registration and contact sections | Partial | Registration CTA exists. Contact section/final layout remains content-dependent. |
| CPT-08 | Competition FAQ | Missing | No FAQ model or UI. |
| EV-11 | Session pages with rundown, speaker, schedule, bookmark/reminder | Missing | No session routes, content model, or reminder feature. |
| EV-09 | Booth filter by category | Missing | Map filters static venue marker types, not booth categories from a booth model. |
| EV-14 | Volunteer information page | Missing | No route or external form CTA. |
| EV-15 | Inspirates per-school activity summary | Missing | No content model or page section. |
| EV-12 | Basic analytics dashboard | Missing beyond MVP counts | Admin metrics cover visitors/registrations/payment counts, not busiest booth or gate-to-booth conversion. |

## Could-Have Gap Matrix

| PRD ID | Requirement | Status | Gap |
| --- | --- | --- | --- |
| EV-16 | Booth visit points | Missing | Depends on booth scan logs. |
| EV-17 | Reward or merch claim | Missing | Depends on points and anti-double-claim rules. |
| EV-18 | Leaderboard or progress tracker | Missing | Depends on booth scan logs. |
| EV-19 | Replayable Inspirates digital content | Missing | No Inspirates content model. |
| EV-20 | AI booth recommendations | Missing | No preference data or recommendation service. |
| EV-21 | Real-time visitor heatmap | Missing | No live location/scan aggregation pipeline. |
| SPON-04 | Sponsor click tracking | Missing | No sponsor model or click events. |
| EV-22 | One-click social sharing | Missing | No share UI. |
| CB-2 | Easter egg | Missing | No hidden interaction implemented. |
| EV-23 | Feedback dashboard | Missing | Depends on feedback system. |

## Data Model Gaps

Implemented MVP tables: `profiles`, `visitor_tickets`, `competitions`, `competition_teams`, `competition_team_members`, `competition_registrations`, `admin_roles`, `payments`, and `midtrans_transactions`.

Likely new tables or schema extensions for full PRD:

| Data area | Needed for |
| --- | --- |
| `event_registrations` or dedicated RSVP tables | Public pre-registration, invited guest RSVP, attendance status, represented guest data. |
| `programs` and `sessions` | Main event pages, seminar/stage schedules, speakers, external registration links. |
| `booths` and `booth_visits` | Booth QR tracking, booth filters, busiest booth analytics, gamification. |
| `feedback` | Overall event feedback, booth feedback, Inspirates feedback, feedback dashboard. |
| `partners` and `partner_clicks` | Tiered logo wall, sponsor hotspots, click tracking. |
| `inspirates_activities` | Per-school recap, participant counts, outreach member summaries. |
| `admin_audit_logs` | Sensitive admin actions and data-integrity checks. |

## Security And Reliability Gaps

Implemented:

- Supabase Auth via Google OAuth and magic link.
- RLS policies for MVP tables in migrations.
- Server-only service role usage in privileged API routes.
- Admin access check through `admin_roles` with `ADMIN_EMAILS` fallback.
- Opaque QR token gate check-in without geofence.
- Midtrans notification signature verification.

Missing or incomplete:

- Rate limiting for auth-sensitive, registration, payment, and admin endpoints.
- Audit log for sensitive admin actions.
- Backup, monitoring, uptime alerting, and incident runbook.
- PII retention policy and export/delete procedure.
- File upload validation and storage rules for competition documents.
- End-to-end production verification for OAuth redirect, email, RLS policies, Midtrans callback, and domain configuration.

## Launch UI Cleanup Gaps

| Area | Current status | Required change |
| --- | --- | --- |
| Header navigation | `Berita`, `Galeri`, and `Dashboard` are defined in the shared header nav. | Hide `Berita` and `Galeri` until content is ready. Hide `Dashboard` for Guests and show it only after login. |
| Admin navigation | Admin routes exist, but the shared header does not currently define an admin-only link. | Show `Admin` in desktop and mobile header only when the logged-in user is authorized as admin. Keep server-side admin checks authoritative. |
| Direct admin access | Admin pages exist and should be reachable by URL. | Re-test `/admin` after Phase 18. If broken, fix auth/admin guard logic instead of hiding the route. |
| Direct dashboard access | `/dashboard*` is protected by middleware. | Keep this server-side protection; do not rely on header visibility alone. |
| Landing dashboard CTA | Landing hero has a `Buka Dashboard` CTA. | Remove it for Guests or send it to `/auth/login?next=/dashboard`. |
| Participant dashboard first screen | Uses a decorative neural/Three.js animation. | Replace with a clear status summary and next actions for ticket, registration, team, and payment. |
| Favicon/app icon | `/favicon.ico` can return 404 in production if no icon file or metadata route exists. | Add a production favicon/app icon and verify Vercel returns 200. |
| OAuth branding | Google account chooser can show the raw Supabase project reference when default/provider branding is not configured. | Configure custom Google OAuth branding and, if available, a custom Supabase auth domain before launch. |

## Recommended Next Build Order

1. Phase 19 regression polish: restore/verify admin access, add admin-only header link, add favicon/app icon, and configure OAuth branding.
2. Production hardening for current MVP: env checklist, Midtrans sandbox callback test, admin role seeding, RLS smoke tests, and manual QA script.
3. Confirm content source decision for competitions: hardcoded fallback vs Sanity as operational source.
4. Add final competition content: guidebooks, fees, timeline, prize pool, contact, FAQ, and robot sketch upload decision.
5. Add public event program pages or explicitly route selected programs to external forms.
6. Add RSVP/alumni flow only after deciding table naming and whether it shares ticket/check-in behavior.
7. Add booth model and booth QR scan flow if the event operations team confirms it is back in scope.
8. Add feedback/sponsor/analytics features after data retention and admin permission decisions are approved.

## Verification Checklist

Run these after implementation changes:

| Check | Command or action |
| --- | --- |
| Type/build verification | `npm run build` |
| TypeScript only | `npx tsc --noEmit` |
| Supabase REST smoke test | `node scripts/verify-supabase.js` |
| Supabase service-role smoke test | `node scripts/test-supabase-client.js` |
| Manual auth check | Login with Google and magic link in local and production callback URLs. |
| Manual QR check | Generate ticket, scan in admin page, verify duplicate check-in rejection. |
| Manual registration check | Submit individual registration, create/join/submit team, and verify status `submitted`. |
| Manual payment check | Create mock payment, settle/fail/expire, create Midtrans Sandbox payment if env vars exist, and verify webhook signature path in sandbox/tunnel. |
| Manual public nav check | Confirm guest header hides Dashboard/Berita/Galeri, logged-in header shows Dashboard, and direct `/dashboard` guest access redirects to login. |
| Manual admin nav check | Confirm admin header shows Admin only for authorized admins, non-admin users do not see it, and authorized admins can open `/admin` directly. |
| Production icon check | Confirm `/favicon.ico` and any declared app icons return 200 on Vercel. |
| OAuth branding check | Confirm Google login account chooser/consent identifies ITB Insight or the approved event domain, not the raw Supabase project reference. |
| Manual RLS check | Verify user A cannot read user B registration, ticket, or payment rows. |

Note: `npm run lint` currently invokes `next lint`, which prompts for ESLint setup because no ESLint config exists.

## Open Decisions

| Decision | Why it blocks implementation |
| --- | --- |
| Competition content source for launch | Code supports Sanity with hardcoded fallback, but operational source and content ownership need confirmation. |
| Midtrans production policy | Sandbox flow/webhook exists, but production keys, production callback URL, settlement testing, and go-live approval are not confirmed. |
| Supabase custom auth domain | Needed if the team wants the Google login flow to show an event-owned domain instead of the Supabase project host. Availability may depend on Supabase plan/domain setup. |
| Google OAuth consent ownership | Needs final owner for Google Cloud OAuth consent screen name, logo, support email, privacy URL, and authorized redirect URLs. |
| Final registration verification policy | `paid` does not automatically mean `verified`; owner must define final acceptance/rejection rules. |
| Which flows stay in GForm | EV-05 allows external registration, but each program needs a clear decision. |
| Who owns final program content and partner logos | Event pages, sponsor wall, gallery, and map hotspots cannot be finalized without assets. |
| When to publish news and gallery | Routes exist, but nav links should stay hidden until editorial ownership, content source, and final assets are ready. |
| Admin roles beyond `admin` | Current MVP has one admin level; future RSVP/feedback/partner data may need narrower permissions. |
| PII retention and deletion policy | The PRD highlights data leak risk; retention/access/export/delete rules need approval before launch. |
