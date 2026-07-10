schema_version: 1

# Release Checklist

Source of truth: current code, `docs/QA-CHECKLIST.md`, deployment configuration.

Audience: release owner.

## Before Release

- Confirm worktree contains only intended changes.
- Review `docs/DECISIONS.md` for unresolved launch blockers.
- Review `docs/BACKLOG.md` launch readiness items.
- Confirm required env vars are configured in the target environment.
- Confirm the target environment before deploy: Local, Preview/Staging, or Production.
- Confirm the target Supabase project ref before deploy, and record only the non-secret ref label in release evidence.
- Confirm Preview/Staging points to staging Supabase and Production points to a separate clean production Supabase project.
- Confirm Local `.env.local` points to staging or a disposable dev Supabase project, never the clean production project for dummy QA.
- Confirm Supabase URL, anon key, service role key, and redirect URLs match the target environment.
- Confirm admin roles are seeded or `ADMIN_EMAILS` fallback is intentionally configured.
- Confirm Midtrans env/callback setup if payment is enabled.
- Confirm Production Midtrans live mode is off unless a separate payment go-live approval exists.
- Confirm OAuth branding and support URLs are production-ready.
- Confirm `.omo/evidence/env-separation-hardening/ops-baseline.md` has owner-run labels for backup owner, restore path, alert destination, incident owner, incident contact channel, and restore approval.
- Block release if backup owner, restore path, alert destination, incident owner, incident contact channel, or restore approval label is missing.
- Block release if any backup URL, signed URL, database URL, token, secret, private phone number, personal email, Auth export, or PII appears in release evidence.

## Verification

- Run `npm run build`.
- Run `node scripts/verify-supabase.js` when Supabase env vars are available.
- Run `node scripts/test-supabase-client.js` only in a trusted environment with service-role key.
- Complete `docs/QA-CHECKLIST.md` manual checks against the correct environment. Dummy visitor, registration, team, payment, and admin flows run in Preview/Staging only. Production receives smoke-only checks.
- Complete `docs/runbooks/PAYMENT-MIDTRANS.md` sandbox or production checks if payment changed.
- Review `.omo/evidence/env-separation-hardening/ops-baseline.md` and confirm backup, alert, incident, freeze, rollback, and restore approval sections are present before release sign-off.
- Block release if Production and Preview/Staging use the same Supabase project ref, if the project ref is unknown, or if release evidence implies dummy data was created in Production.

## After Release

- Record release notes in `docs/RELEASES.md`.
- Record any new decisions in `docs/DECISIONS.md`.
- Move follow-up work into `docs/BACKLOG.md`.
- Do not use archived implementation plans as active release criteria.
