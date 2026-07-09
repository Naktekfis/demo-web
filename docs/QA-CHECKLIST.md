schema_version: 1

# QA Checklist

Source of truth: current code, `docs/MVP-SCOPE.md`, technical specs.

Audience: contributors verifying local, staging, or production changes.

## Automated Checks

| Check | Command | Notes |
| --- | --- | --- |
| Production build | `npm run build` | Reliable full verification command for Next build/type checks. |
| TypeScript only | `npx tsc --noEmit` | Optional focused type check. |
| Supabase REST smoke test | `node scripts/verify-supabase.js` | Loads `.env.local`. |
| Supabase service-role smoke test | `node scripts/test-supabase-client.js` | Requires `SUPABASE_SERVICE_ROLE_KEY`; lists auth users. |

Note: `npm run lint` currently invokes `next lint`, which can prompt for ESLint setup because no ESLint config exists.

## Manual Public And Auth Checks

- Open `/`, `/competitions`, and `/competitions/[slug]` without logging in.
- Confirm guest header hides `Dashboard`, `Admin`, `Berita`, and `Galeri` when those content areas are not launch-ready.
- Confirm clicking register as guest redirects to `/auth/login?next=...`.
- Log in with Google and magic link where configured.
- Confirm logged-in header shows `Dashboard`.
- Confirm logout from `/dashboard*` redirects to `/`.
- Confirm Google account chooser/consent shows approved ITB Insight branding or event domain.

## Manual Visitor Checks

- Confirm a new visitor gets a `profiles` row after login.
- Confirm a new visitor gets exactly one `visitor_tickets` row.
- Confirm returning visitors reuse the same QR token.
- Confirm `/dashboard/my-tickets` shows the QR ticket after refresh.
- Confirm QR payload does not expose user metadata.

## Manual Registration Checks

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

- Create a mock payment from dashboard.
- Settle mock payment and confirm payment status becomes `paid` without auto-verifying registration.
- Fail and expire mock payments, then confirm retry behavior.
- Create a Midtrans Sandbox payment when env vars are available.
- Confirm user can return to `/dashboard` after payment attempt.
- Verify Midtrans webhook signature path in sandbox or tunnel before production use.
- Confirm admin can see payment status, provider, amount, and Midtrans order ID when available.

## Manual Admin Checks

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

- Confirm `/favicon.ico` returns 200.
- Confirm declared app icons return 200.
- Confirm Supabase redirect URLs match deployed domain.
- Confirm Midtrans notification/callback URL points at the deployed app before production use.
- Confirm admin roles are seeded through `admin_roles` or approved `ADMIN_EMAILS` fallback.
- Verify RLS manually: user A cannot read user B registration, ticket, team, or payment rows.
