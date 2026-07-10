schema_version: 1

# Security Checklist

Source of truth: current code, Supabase policies, deployment configuration.

Audience: contributors handling auth, data, admin, payment, or production setup.

## Credentials

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Keep `MIDTRANS_SERVER_KEY` server-only.
- Do not expose server secrets through `NEXT_PUBLIC_*` variables.
- Rotate credentials if they were committed, logged, or shared outside approved channels.
- Use separate Supabase anon and service-role keys for Preview/Staging and Production.
- Keep `.env.local` on staging or disposable dev values. Don't use clean production Supabase for dummy local QA.
- Don't commit secrets, Auth exports, backup dumps, private backup URLs, signed URLs, service-role output, tokens, user emails, phone numbers, or PII evidence.

## Auth And Access

- Protect `/dashboard*` through middleware and server checks.
- Protect `/admin*` through server-side admin checks.
- Use `admin_roles` first and `ADMIN_EMAILS` fallback only when intentionally configured.
- Treat header visibility as UX only, not authorization.

## Data Protection

- Keep QR payloads opaque; do not place names, emails, phone numbers, or IDs in QR data.
- Keep personal data minimal.
- Define retention and deletion rules before production scale.
- Avoid exporting PII unless the user is authorized and the export path is logged or reviewed.

## Database And RLS

- Confirm RLS is enabled on public MVP tables.
- Verify user A cannot read or update user B profile, visitor ticket, competition registration, team, team member, or payment data.
- Use service-role access only inside privileged server routes.
- Add audit logs before expanding sensitive admin operations.
- Staging requires executable RLS smoke with controlled dummy users.
- Production requires policy/config evidence plus smoke-only access checks. Do not create dummy production users, registrations, teams, payments, or QR tickets for RLS testing.

### RLS And Access Smoke Procedure

Use `.omo/evidence/env-separation-hardening/rls-smoke.md` as the evidence template. Owner-run evidence is required before production release sign-off. This checklist documents the procedure only; don't mark it passed until the owner records safe evidence.

Required environments:

- Preview/Staging: run executable smoke checks with two controlled internal test users, one admin, and one logged-in non-admin.
- Production: record policy/config evidence and only smoke-approved auth checks. Don't create dummy users, dummy registrations, dummy teams, dummy payments, or dummy QR tickets in Production unless the owner approves the account and cleanup path.

Tables covered:

| Table | Required smoke result |
| --- | --- |
| `profiles` | User A can read own profile. User A cannot read or update User B profile. |
| `visitor_tickets` | User A can read own ticket. User A cannot read or update User B ticket or QR token. |
| `competition_registrations` | User A can read own registration. User A cannot read or update User B registration. |
| `competition_teams` | User can read only teams they are allowed to access through current app rules. User A cannot update a team they don't lead. |
| `competition_team_members` | User A cannot read or update private member rows outside allowed team membership rules. |
| `payments` | User A or team leader can read own payment only. User A cannot read or update User B payment. |

Admin API coverage:

| Endpoint | Required smoke result |
| --- | --- |
| `/api/admin/overview` | Admin succeeds. Logged-in non-admin receives `403`. Unauthenticated request receives `401`. |
| `/api/admin/registrations` | Admin succeeds. Logged-in non-admin receives `403`. Unauthenticated request receives `401`. |
| `/api/admin/visitors` | Admin succeeds. Logged-in non-admin receives `403`. Unauthenticated request receives `401`. |
| `/api/admin/check-in` | Admin can submit only an approved opaque placeholder in staging. Logged-in non-admin receives `403`. Unauthenticated request receives `401`. |

Unauthenticated mutation coverage:

| Endpoint | Required smoke result |
| --- | --- |
| `/api/registrations/individual` | `401` |
| `/api/registrations/team` | `401` |
| `/api/teams` | `401` |
| `/api/teams/join` | `401` |
| `/api/payments/create` | `401` |

Environment split notes:

- Staging is the place for dummy RLS data and User A/User B setup.
- Production evidence must prove policies/config exist and private tables don't allow broad public reads.
- `admin_roles` is the preferred admin source. `ADMIN_EMAILS` fallback must be recorded as approved if it remains enabled.
- Evidence may include status codes, redacted row counts, policy names, screenshots stored outside git, or dashboard labels. It must not include real user emails, JWTs, bearer tokens, service-role output, QR tokens, Snap tokens, or private row payloads.
- Stop the release if a non-admin receives a success response from `/admin*` or `/api/admin*`, or if unauthenticated registration/team/payment mutations return success instead of `401`.

## Rate Limiting

- Sensitive MVP mutation and admin-heavy routes use a no-dependency, per-instance baseline limiter in `lib/rate-limit.ts`.
- Registration, team create/join/edit, and payment creation endpoints currently allow 20 attempts per minute for both the authenticated user key and request IP key.
- Admin status updates, registration CSV export, and admin check-in currently allow 10 attempts per minute for both the authenticated admin key and request IP key.
- Exceeded limits return `429` with error code `RATE_LIMITED`, Bahasa Indonesia message `Terlalu banyak percobaan. Silakan coba lagi nanti.`, and a `Retry-After` header.
- The current limiter is a conservative MVP guard only. It is in-memory and per server instance, so it is not globally reliable across Vercel/serverless instances or high-traffic deployments.
- If this is upgraded to Redis, Upstash, Vercel KV, or another distributed limiter, staging and production must use separate credentials, separate namespaces/prefixes, and no shared secret values.
- Do not rate-limit public read pages aggressively until real traffic data supports the threshold.

Final state for launch hardening:

| Area | Current state | Release rule |
| --- | --- | --- |
| Service-role isolation | Server-only by code path and docs. Values must be scoped per environment. | Block release if a service-role key appears in `NEXT_PUBLIC_*`, docs, screenshots, or client code. |
| RLS smoke | Procedure is documented for staging and production evidence. | Block production release until owner-run evidence exists. |
| Rate limiting | MVP in-memory per-instance limiter protects sensitive mutation and admin routes. | Accept for MVP baseline, but require distributed limiter before high-traffic production. |
| Backup | Owner-run backup and restore labels are documented in `docs/runbooks/ENVIRONMENTS.md`. | Block release if backup owner or restore path label is missing. |
| Monitoring | Owner-run alert and incident labels are documented in `docs/runbooks/ENVIRONMENTS.md`. | Block release if alert destination, incident owner/contact, or restore approval label is missing. |

## Payment Safety

- Client code must not directly set `paid`.
- Payment state changes must happen through server routes or verified Midtrans webhook.
- Invalid Midtrans signatures must be rejected.
- Registration verification must remain an admin action unless a new approved decision changes that rule.

## Known Hardening Backlog

- Upgrade the MVP baseline rate limiter to a distributed, environment-specific limiter before high-traffic production use.
- Admin audit logs for sensitive changes.
- Owner-run backup, restore, monitoring, and incident baseline is documented in `docs/runbooks/ENVIRONMENTS.md` and `.omo/evidence/env-separation-hardening/ops-baseline.md`; owner evidence labels must still be filled before release.
- Uptime alerting and error monitoring integrations remain owner-run follow-ups until dashboard evidence labels are filled.
- File upload validation and storage rules if upload features return to scope.
