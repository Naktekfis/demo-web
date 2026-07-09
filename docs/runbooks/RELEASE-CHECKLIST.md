schema_version: 1

# Release Checklist

Source of truth: current code, `docs/QA-CHECKLIST.md`, deployment configuration.

Audience: release owner.

## Before Release

- Confirm worktree contains only intended changes.
- Review `docs/DECISIONS.md` for unresolved launch blockers.
- Review `docs/BACKLOG.md` launch readiness items.
- Confirm required env vars are configured in the target environment.
- Confirm Supabase URL, anon key, service role key, and redirect URLs are correct.
- Confirm admin roles are seeded or `ADMIN_EMAILS` fallback is intentionally configured.
- Confirm Midtrans env/callback setup if payment is enabled.
- Confirm OAuth branding and support URLs are production-ready.

## Verification

- Run `npm run build`.
- Run `node scripts/verify-supabase.js` when Supabase env vars are available.
- Run `node scripts/test-supabase-client.js` only in a trusted environment with service-role key.
- Complete `docs/QA-CHECKLIST.md` manual public/auth/visitor/registration/admin checks.
- Complete `docs/runbooks/PAYMENT-MIDTRANS.md` sandbox or production checks if payment changed.

## After Release

- Record release notes in `docs/RELEASES.md`.
- Record any new decisions in `docs/DECISIONS.md`.
- Move follow-up work into `docs/BACKLOG.md`.
- Do not use archived implementation plans as active release criteria.
