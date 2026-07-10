schema_version: 1

# Environment Runbook

Source of truth: current code, Vercel configuration, Supabase project settings, and owner-run dashboard checks.

Audience: release owner and contributors changing environment configuration.

## Purpose

Use this runbook to record which deployment points at which Supabase project without writing secrets into the repo. It supports three scopes: Local, Preview/Staging, and Production.

## Environment Matrix Template

| Environment | Vercel target | App domain | Supabase project ref | Supabase API domain | Data type | Payment mode |
| --- | --- | --- | --- | --- | --- | --- |
| Local | Local `.env.local` | `http://localhost:3000` | `<staging-project-ref>` | `https://<staging-project-ref>.supabase.co` | Internal QA and development data | Mock or Midtrans Sandbox |
| Preview/Staging | Vercel Preview or staging deployment | `<staging-domain>` | `<staging-project-ref>` | `https://<staging-project-ref>.supabase.co` | Internal tester data | Mock or Midtrans Sandbox |
| Production | Vercel Production | `<production-domain>` | `<production-project-ref>` | `https://<production-project-ref>.supabase.co` | Clean launch data only | Mock or sandbox until separate Midtrans approval |

## Secret Recording Rules

- Record variable names, project refs, domains, regions, and boolean mode labels only.
- Don't record key values, OAuth secrets, service-role keys, Midtrans keys, tokens, backup URLs, auth exports, or PII.
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `MIDTRANS_SERVER_KEY` server-only.
- Store real values only in approved local env files, Vercel environment settings, or the owning service dashboard.

## Non-Negotiable Production Restrictions

Production is for real user data only. It must stay separate from staging data, staging credentials, dummy flows, and sandbox-only payment checks.

- Do not run dummy registrations, dummy teams, mock payment QA, sandbox payment QA, admin review drills, or QR check-in drills against Production.
- Do not run load tests, traffic spikes, scripted mass signups, or bulk check-in rehearsals against Production.
- Do not set `MIDTRANS_IS_PRODUCTION=true` or add live Midtrans keys without a separate owner-approved payment go-live.
- Do not commit secrets, Supabase keys, service-role output, Auth exports, backup dumps, backup URLs, signed URLs, raw database rows, QR tokens, payment tokens, user emails, phone numbers, or PII evidence.
- Production verification is limited to small smoke checks: public pages, icons, redirect configuration, project-ref confirmation, clean data counts, policy/config evidence, and approved admin access checks.

Staging is the place for dummy visitor, registration, team, payment, admin, and RLS checks. If a check needs fake data, run it in Preview/Staging.

## Environment Variable Boundaries

Use separate owner-managed values for Local, Preview/Staging, and Production. Do not copy one `.env.local` file into every Vercel scope. Real values belong only in `.env.local`, Vercel Environment Variables, Supabase dashboard settings, or the owning service dashboard. Repo docs must use labels and placeholders only.

| Variable | Local `.env.local` | Vercel Preview/Staging | Vercel Production | Boundary rule |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `<staging-domain>` | `<production-domain>` | Must differ by environment. |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<staging-project-ref>.supabase.co` or disposable dev project | `https://<staging-project-ref>.supabase.co` | `https://<production-project-ref>.supabase.co` | Preview/Staging and Production must use different project refs. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging or dev anon key | Staging anon key | Production anon key | Public anon key by design, but never paste the real key into docs. |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging or dev service-role key for trusted local scripts only | Staging service-role key, server-side only | Production service-role key, server-side only | Never expose as `NEXT_PUBLIC_*`, never use in browser code, and never paste into docs. |
| `ADMIN_EMAILS` | Local fallback if `admin_roles` is not seeded | Staging fallback if needed | Production fallback only if approved | Prefer `admin_roles`; don't paste private emails into docs. |
| `MIDTRANS_SERVER_KEY` | Sandbox key or unset | Sandbox key or unset | Unset or sandbox unless separate go-live approval exists | Server-side only. |
| `MIDTRANS_CLIENT_KEY` | Sandbox key or unset | Sandbox key or unset | Unset or sandbox unless separate go-live approval exists | Keep real values in the service dashboard or env manager. |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Sandbox public client key or unset | Sandbox public client key or unset | Unset or sandbox unless separate go-live approval exists | Public by name, but don't paste real values into docs. |
| `MIDTRANS_IS_PRODUCTION` | `false` | `false` | `false` or unset | Production payment must not become live without separate approval. |

Owner-run acceptance checks:

1. Vercel Preview/Staging points to staging or dev Supabase, where internal tester data is allowed.
2. Vercel Production points to a clean production Supabase project, where internal tester data is not allowed.
3. `NEXT_PUBLIC_SITE_URL` uses `http://localhost:3000`, `<staging-domain>`, and `<production-domain>` in the matching scopes.
4. Supabase Auth Site URL and redirect URLs include `http://localhost:3000/auth/callback`, `<staging-domain>/auth/callback`, and `<production-domain>/auth/callback` as appropriate for each Supabase project.
5. `SUPABASE_SERVICE_ROLE_KEY` exists only in server-side env settings and never as a `NEXT_PUBLIC_*` variable.
6. Production Midtrans remains false or unset until the separate production payment go-live checklist is approved.
7. Production deploy is blocked if the target environment, Supabase project ref, payment mode, or data type is unclear.

## Backup Before Destructive Changes

No destructive Supabase or Vercel environment operation may occur before backup evidence exists.

Required gate:

1. Keep the current internal-data project frozen for testing writes.
2. Fill `.omo/evidence/env-separation-hardening/backup-receipt.md` with owner-run labels for backup timestamp, source project ref, private storage label, and restore owner.
3. Confirm the backup covers `profiles`, `visitor_tickets`, `competitions`, `competition_teams`, `competition_team_members`, `competition_registrations`, `admin_roles`, plus `payments` and `midtrans_transactions` when present.
4. Confirm Auth evidence exists outside git and proves current users are internal/test users only.
5. Confirm the restore owner can access the private backup location.

Blocked until the gate is complete:

- Resetting or deleting a Supabase project.
- Replaying migrations against a project that contains internal data.
- Changing a project role from current/internal to staging or production.
- Switching Vercel Production to a new Supabase project.
- Creating or resetting clean production from the current project state.

Never place raw backups, Auth exports, database URLs with credentials, signed URLs, screenshots with user data, or PII in repo docs.

## Backup, Monitoring, And Incident Baseline

This baseline is owner-run. It records who owns each production safety check and where evidence lives, without recording private backup URLs, alert hooks, phone numbers, emails, keys, tokens, or personal data.

Evidence path: `.omo/evidence/env-separation-hardening/ops-baseline.md`.

Docs do not configure dashboards, alerts, backups, restore jobs, incident channels, or owner access. The owner must configure those systems outside git and record only non-secret labels in the evidence file.

Release is blocked until owner-run labels exist for backup owner, restore path, alert destination, incident owner/contact, and restore approval.

Required owner labels before release:

| Area | Required owner-run label | Release rule |
| --- | --- | --- |
| Backup owner | `<backup-owner-role>` | Block release if missing. |
| Restore path | `<restore-path-label>` | Block release if missing or if it points to a private URL in repo docs. |
| Alert destination | `<alert-destination-label>` | Block release if missing. |
| Incident owner | `<incident-owner-role>` | Block release if missing. |
| Incident contact path | `<incident-contact-channel-label>` | Block release if missing or if it contains a private phone number, personal email, or token. |
| Restore approval | `<restore-approval-channel-or-ticket-label>` | Block any restore without approval and target project ref confirmation. |

Minimum monitoring labels:

1. Vercel deployment or build failure notification owner label.
2. Supabase usage, quota, or database alert owner label when the chosen plan exposes it.
3. Error log review owner label for app, API, auth, payment, and admin failures.

Baseline operating rules:

- Freeze writes when data integrity, payment state, admin review, QR tickets, registration records, or target environment identity is unclear.
- Roll back the app deployment first when the latest deploy caused the issue, and keep Supabase project refs unchanged unless restore approval exists.
- Restore data only after the owner approves the target project ref, selected backup label, restore executor, and post-restore verification owner.

Incident procedure:

1. Detect the issue from an alert label, owner report, or release verification failure.
2. Identify the affected environment before acting: Local, Preview/Staging, or Production.
3. Freeze writes if data integrity, payment state, admin review, QR tickets, or registration records may be affected.
4. Roll back the app deployment first when the failure is caused by the latest deploy.
5. Restore database state only after the restore decision owner approves the target project ref, backup label, and restore executor.
6. Record non-secret evidence labels in `.omo/evidence/env-separation-hardening/ops-baseline.md` and keep screenshots, exports, hooks, backup objects, and user data outside git.

Stop before release if backup owner, restore path, alert destination, incident owner/contact, or restore approval label is missing.

## Preserve Current Project As Staging

The current internal-only Supabase project and its current data are preserved as Staging. Internal tester users, dummy visitor tickets, dummy competition registrations, dummy teams, dummy team members, dummy payment rows, and admin QA records are allowed in Staging. They are not allowed in Production.

Production remains a separate, clean environment. Do not point Vercel Production at the staging Supabase URL, staging anon key, or staging service-role key. Do not copy staging Auth users or internal test data into Production.

Required staging configuration:

| Area | Required staging setting | Evidence path |
| --- | --- | --- |
| Supabase project role | Current internal-only project is labeled and treated as Staging. | `.omo/evidence/env-separation-hardening/staging-smoke.md` |
| Auth Site URL | Staging app domain, for example `<staging-domain>`. | Owner dashboard evidence label only. |
| Auth redirect URLs | `http://localhost:3000/auth/callback` and `<staging-domain>/auth/callback`. | Owner dashboard evidence label only. |
| Vercel Preview/Staging env | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` point to staging Supabase. | Owner env-scope evidence label only. |
| Payment | Mock payment or Midtrans Sandbox only. `MIDTRANS_IS_PRODUCTION=false`. | Owner env-scope evidence label only. |

Operator rules:

- Use placeholders in repo docs. Real keys stay in Vercel, local env files, or service dashboards.
- Keep Vercel Preview and any named staging deployment mapped to the staging Supabase project.
- Keep `.env.local` mapped to staging or a disposable development project, never the clean production project for dummy QA.
- Keep staging clearly labeled non-production in owner-facing dashboard notes, deployment names, and release evidence.
- Stop before production setup if the staging and production project refs are the same or unclear.
- Do not claim dashboard changes are complete until the owner fills `.omo/evidence/env-separation-hardening/staging-smoke.md`.

## Clean Production Setup

Production starts from a clean Supabase project. Prefer creating a new Supabase Production project over resetting an existing project, because the current database contains internal tester data and is preserved for Staging.

Required order:

1. Confirm `.omo/evidence/env-separation-hardening/backup-receipt.md` and `.omo/evidence/env-separation-hardening/staging-smoke.md` are complete with owner labels.
2. Record the staging project ref, production project ref, project names, and Supabase API domains in `.omo/evidence/env-separation-hardening/production-cleanliness.md` using placeholders or owner evidence labels only.
3. Confirm Production and Staging use different Supabase project refs before any migration, seed, Vercel Production switch, or reset.
4. If a new project is used, apply migrations in order: `0001_initial_schema.sql`, `0002_mvp_schema.sql`, `0003_submit_team_registration.sql`, and `0004_payment_schema.sql`.
5. If an existing project is reset, require immediate owner confirmation of the target project ref, project name, API domain, and intended Production role before reset. Stop if any value is unclear.
6. Seed only approved launch data: final competition config if needed, approved admin account profile rows if needed, and intentional `admin_roles` rows.
7. Verify forbidden tester data counts are zero for `visitor_tickets`, `competition_registrations`, `competition_teams`, `competition_team_members`, `payments`, and `midtrans_transactions` when those tables exist.
8. Keep production Midtrans go-live out of scope. `MIDTRANS_IS_PRODUCTION` must be false or unset unless a separate payment go-live approval exists.

Required production evidence:

| Check | Required result | Evidence path |
| --- | --- | --- |
| Target project | Production project ref differs from staging. | `.omo/evidence/env-separation-hardening/production-cleanliness.md` |
| Schema | Required MVP tables exist after migrations. | Owner query or dashboard label only. |
| Clean data | No internal tester registrations, tickets, teams, team members, payments, or Midtrans rows. | Owner count labels only. |
| Admin seed | Admin access seed is intentional and recorded. | Owner seed label only. |
| Payment mode | Mock or sandbox only, no production Midtrans. | Owner env label only. |

Stop before switching Vercel Production if any Production table contains tester data, if admin seed ownership is unclear, if migrations were skipped, or if Production and Staging point at the same Supabase project.

## RLS And Access-Control Smoke

Run RLS and access-control smoke checks after the environment split is configured and before release readiness sign-off. This is an owner-run procedure because it needs environment credentials, controlled test accounts, and Supabase dashboard access. Do not paste account emails, session tokens, JWTs, QR tokens, service-role output, or rows with PII into repo files.

Evidence path: `.omo/evidence/env-separation-hardening/rls-smoke.md`.

Environment rules:

| Environment | Allowed smoke scope | Required evidence |
| --- | --- | --- |
| Preview/Staging | Use two controlled internal test users plus one admin and one non-admin. Dummy registration, team, ticket, and mock payment rows are allowed. | User A/User B denial results, admin API status checks, unauthenticated mutation status checks, and table coverage notes. |
| Production | Use policy/config inspection plus the smallest approved auth checks. Do not create dummy users, dummy registrations, dummy teams, dummy payments, or test QR tickets in Production unless the owner explicitly approves the account and cleanup path. | Production policy/config evidence, admin seed evidence, non-admin denial evidence, and confirmation that no broad public reads exist for private tables. |

Minimum table coverage:

- `profiles`
- `visitor_tickets`
- `competition_registrations`
- `competition_teams`
- `competition_team_members`
- `payments`

Minimum endpoint coverage:

| Surface | Expected denial |
| --- | --- |
| `/api/admin/overview` | Non-admin receives `403`; unauthenticated user receives `401` or redirects before page access. |
| `/api/admin/registrations` | Non-admin receives `403`; unauthenticated user receives `401` or redirects before page access. |
| `/api/admin/visitors` | Non-admin receives `403`; unauthenticated user receives `401` or redirects before page access. |
| `/api/admin/check-in` | Non-admin receives `403`; unauthenticated user receives `401`. |
| `/api/registrations/individual` | Unauthenticated mutation returns `401`. |
| `/api/registrations/team` | Unauthenticated mutation returns `401`. |
| `/api/teams` | Unauthenticated mutation returns `401`. |
| `/api/teams/join` | Unauthenticated mutation returns `401`. |
| `/api/payments/create` | Unauthenticated mutation returns `401`. |

Stop conditions:

- User A can read or update User B private rows in any covered table.
- A non-admin can open `/admin*` pages or call `/api/admin*` successfully.
- An unauthenticated registration, team, or payment mutation returns success instead of `401`.
- Production policy/config evidence is missing before production release sign-off.
- Evidence contains raw emails, JWTs, service-role output, QR tokens, payment tokens, or real row payloads with PII.

## Owner Checkpoints

1. Confirm the current internal-data Supabase project is staging or is being preserved as staging.
2. Confirm `.omo/evidence/env-separation-hardening/backup-receipt.md` exists and is filled with owner-run labels before any destructive operation.
3. Confirm production Supabase uses a different project ref from staging before production setup or switching.
4. Confirm `.omo/evidence/env-separation-hardening/production-cleanliness.md` records schema, seed, clean table counts, admin seed, and payment mode evidence before any Production switch.
5. Confirm Vercel Preview/Staging points to staging Supabase.
6. Confirm Vercel Production points to clean production Supabase only after backup, production setup, and smoke checks finish.
7. Keep Midtrans production mode off until the separate payment go-live procedure is approved.
8. Complete `.omo/evidence/env-separation-hardening/rls-smoke.md` before release readiness sign-off. Staging needs executable User A/User B and admin denial evidence. Production needs policy/config evidence plus approved smoke-only access checks.
