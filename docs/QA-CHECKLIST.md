schema_version: 1

# QA Checklist

Source of truth: current code, `docs/MVP-SCOPE.md`, technical specs.

Audience: contributors verifying local, staging, or production changes.

## Environment Targets

Use the environment before choosing a checklist.

| Environment | QA target | Allowed data |
| --- | --- | --- |
| Local | Developer checks with `.env.local` | Staging or disposable dev Supabase only. |
| Preview/Staging | Full dummy QA | Internal test users, dummy registrations, teams, mock payments, sandbox payments, admin review, RLS User A/User B checks. |
| Production | Smoke-only release checks | Real user data only. No dummy registrations, dummy teams, mock payment QA, sandbox payment QA, load tests, or admin drills. |

If a check creates or mutates fake data, run it in Preview/Staging. Production checks must be tiny and reversible, and release evidence must use labels or redacted counts only.

## Automated Checks

| Check | Command | Notes |
| --- | --- | --- |
| Production build | `npm run build` | Reliable full verification command for Next build/type checks. |
| TypeScript only | `npx tsc --noEmit` | Optional focused type check. |
| Supabase REST smoke test | `node scripts/verify-supabase.js` | Loads `.env.local`. |
| Supabase service-role smoke test | `node scripts/test-supabase-client.js` | Requires `SUPABASE_SERVICE_ROLE_KEY`; lists auth users. |

Note: `npm run lint` currently invokes `next lint`, which can prompt for ESLint setup because no ESLint config exists.

## Manual Public And Auth Checks

Target: Local, Preview/Staging, and Production smoke. Production may verify pages, redirects, and approved auth only.

- Open `/`, `/competitions`, and `/competitions/[slug]` without logging in.
- Confirm guest header hides `Dashboard`, `Admin`, `Berita`, and `Galeri` when those content areas are not launch-ready.
- Confirm clicking register as guest redirects to `/auth/login?next=...`.
- Log in with Google and magic link where configured.
- Confirm logged-in header shows `Dashboard`.
- Confirm logout from `/dashboard*` redirects to `/`.
- Confirm Google account chooser/consent shows approved ITB Insight branding or event domain.

## Manual Visitor Checks

Target: Preview/Staging for full checks. Production smoke may verify that the route loads for approved accounts only, without creating dummy tickets.

- Confirm a new visitor gets a `profiles` row after login.
- Confirm a new visitor gets exactly one `visitor_tickets` row.
- Confirm returning visitors reuse the same QR token.
- Confirm `/dashboard/my-tickets` shows the QR ticket after refresh.
- Confirm QR payload does not expose user metadata.

## Manual Registration Checks

Target: Preview/Staging only. Do not submit dummy individual or team registrations in Production.

- Submit an individual competition registration.
- Confirm missing phone blocks registration submission.
- Confirm duplicate individual registration returns a clear duplicate state.
- Create a team as leader and confirm team UID is visible.
- Join a team as another logged-in member using team UID.
- Confirm invalid team UID is rejected.
- Submit team registration as leader.
- Confirm team membership is locked after final submit.
- Confirm users cannot view another participant's private registration data.

## Manual Payment Checks

Target: Preview/Staging only unless a separate production Midtrans go-live is approved. Production keeps `MIDTRANS_IS_PRODUCTION=false` or unset by default.

- Create a mock payment from dashboard.
- Settle mock payment and confirm payment status becomes `paid` without auto-verifying registration.
- Fail and expire mock payments, then confirm retry behavior.
- Create a Midtrans Sandbox payment when env vars are available.
- Confirm user can return to `/dashboard` after payment attempt.
- Verify Midtrans webhook signature path in sandbox or tunnel before production use.
- Confirm admin can see payment status, provider, amount, and Midtrans order ID when available.

## Manual Admin Checks

Target: Preview/Staging for full admin drills. Production admin checks are limited to approved smoke access and must not update dummy records.

- Confirm authorized admin can open `/admin` directly.
- Confirm authorized admin sees `Admin` in desktop and mobile header.
- Confirm logged-in non-admin user does not see `Admin`.
- Confirm logged-in non-admin user cannot access `/admin` directly.
- List competition registrations.
- Search by name, email, team name, and team UID.
- Open registration detail and update status.
- Export registration CSV.
- Open visitor list and confirm QR/check-in status display.
- Scan a visitor QR through `/admin/check-in`.
- Confirm duplicate QR scans return an already-checked-in response.
- Confirm logout from `/admin*` redirects to `/`.

## Production Checks

- Confirm Production uses a clean Supabase project ref that differs from Preview/Staging.
- Confirm Production has no internal tester registrations, teams, tickets, payments, Midtrans rows, or dummy admin review records.
- Confirm `/favicon.ico` returns 200.
- Confirm declared app icons return 200.
- Confirm Supabase redirect URLs match deployed domain.
- Confirm Midtrans notification/callback URL points at the deployed app before approved production payment use.
- Confirm `MIDTRANS_IS_PRODUCTION` is false or unset unless a separate payment go-live was approved.
- Confirm admin roles are seeded through `admin_roles` or approved `ADMIN_EMAILS` fallback.
- Verify RLS with production-safe policy/config evidence plus approved smoke-only access checks. Do not create dummy production users or records for this check.
- Confirm no production load test, scripted mass signup, bulk registration, bulk payment, or bulk check-in was run.
