schema_version: 1

# Security Checklist

Source of truth: current code, Supabase policies, deployment configuration.

Audience: contributors handling auth, data, admin, payment, or production setup.

## Credentials

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Keep `MIDTRANS_SERVER_KEY` server-only.
- Do not expose server secrets through `NEXT_PUBLIC_*` variables.
- Rotate credentials if they were committed, logged, or shared outside approved channels.

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
- Verify user A cannot read user B profile, ticket, registration, team, or payment data.
- Use service-role access only inside privileged server routes.
- Add audit logs before expanding sensitive admin operations.

## Payment Safety

- Client code must not directly set `paid`.
- Payment state changes must happen through server routes or verified Midtrans webhook.
- Invalid Midtrans signatures must be rejected.
- Registration verification must remain an admin action unless a new approved decision changes that rule.

## Known Hardening Backlog

- Rate limiting for auth-sensitive, registration, payment, and admin endpoints.
- Admin audit logs for sensitive changes.
- Backup, monitoring, uptime alerting, and incident runbook.
- File upload validation and storage rules if upload features return to scope.
