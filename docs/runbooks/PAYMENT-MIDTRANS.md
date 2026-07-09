schema_version: 1

# Payment And Midtrans Runbook

Source of truth: `docs/PAYMENT-FLOWS.md`, current code, Midtrans dashboard configuration.

Audience: contributors operating payment in sandbox or preparing production go-live.

## Current Model

- Payments cover individual and team competition registrations.
- Team payment is initiated by the team leader only.
- Fee source is hardcoded competition data for the MVP.
- Registration status and payment status are separate.
- Payment success sets payment status to `paid`; admin still verifies registration.
- `unpaid` is a display-only state when no payment row exists.
- Admin payment override is not implemented.

## Environment Variables

Use sandbox keys until production go-live is approved.

```bash
MIDTRANS_SERVER_KEY=your-sandbox-server-key
MIDTRANS_CLIENT_KEY=your-sandbox-client-key
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-sandbox-client-key
```

Rules:

- Keep `MIDTRANS_SERVER_KEY` server-only.
- Never expose the server key through `NEXT_PUBLIC_*`.
- Set `MIDTRANS_IS_PRODUCTION=false` for sandbox.

## Important Routes

| Route | Purpose |
| --- | --- |
| `POST /api/payments/create` | Create or reuse a payment attempt. |
| `POST /api/payments/mock/settle` | Mark an owned pending mock payment as paid. |
| `POST /api/payments/mock/fail` | Mark an owned pending mock payment as failed. |
| `POST /api/payments/mock/expire` | Mark an owned pending mock payment as expired. |
| `POST /api/payments/midtrans/notification` | Receive and verify Midtrans notification webhook. |

## Sandbox Verification

1. Confirm env vars are loaded locally or in the target deployment.
2. Submit an individual or team registration.
3. Click `Bayar` from dashboard.
4. Confirm a payment row is created or reused.
5. Complete mock success/fail/expire checks first.
6. Switch to Midtrans Sandbox path when configured.
7. Confirm Snap redirect URL opens successfully.
8. Complete sandbox payment.
9. Confirm user returns to dashboard.
10. Confirm webhook updates payment status and is idempotent.
11. Confirm registration status remains `submitted` until admin verifies.

## Production Go-Live Checklist

- Confirm production Midtrans account is approved.
- Add production server/client keys to deployment secrets.
- Set `MIDTRANS_IS_PRODUCTION=true` only for production.
- Configure deployed notification URL in Midtrans: `https://<domain>/api/payments/midtrans/notification`.
- Run a settlement test with approved production procedure.
- Confirm webhook signature verification succeeds.
- Confirm invalid signature is rejected.
- Confirm duplicate webhook does not duplicate or corrupt records.
- Confirm admin can review payment status before verifying registration.
- Record go-live date and verification notes in `docs/RELEASES.md`.

## Failure Handling

| Failure | Action |
| --- | --- |
| Snap transaction create fails | Keep registration submitted and show retryable error. |
| Active pending payment exists | Reuse it instead of creating duplicate active payments. |
| Payment failed/expired/cancelled | Allow retry while registration is not `verified` or `rejected`. |
| Invalid webhook signature | Reject and log safely. |
| Paid webhook received twice | Treat as idempotent; do not duplicate or corrupt records. |
