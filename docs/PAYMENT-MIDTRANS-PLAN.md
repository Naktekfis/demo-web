schema_version: 1

# Payment And Midtrans Plan

Source of truth: `docs/prd-itbinsight.md`

Related docs: `docs/PAYMENT-FLOWS.md`, `docs/IMPLEMENTATION-GUIDE.md`, `docs/MVP-SCOPE.md`, `docs/DATA-MODEL.md`, `docs/API-CONTRACTS.md`, `docs/SUPABASE-SCHEMA-PLAN.md`, `docs/ADMIN-DASHBOARD.md`

Audience: web development team adding payment after the registration MVP is working.

## Purpose

This document defines the payment implementation plan for competition registration. The implementation uses two stages:

1. Internal mock payment.
2. Midtrans Sandbox Snap.

The goal is to add payment without destabilizing the already-tested QR, individual registration, and team registration flows.

## Decisions

| Topic | Decision |
| --- | --- |
| Payment coverage | Individual and team competition registrations. |
| Team payment actor | Team leader only. |
| Fee source | Hardcoded competition data for now. |
| Default mock amount | IDR 10,000. |
| Payment entry point | User pays from dashboard after registration submission. |
| Status model | Registration status and payment status are separate. |
| Successful payment | Sets `payment_status = paid`; admin still verifies registration. |
| Rollout | Stage 1 internal mock, then Stage 2 Midtrans Sandbox Snap. |
| Return route | Dashboard is the safest return route. |
| Webhook | Implemented at `POST /api/payments/midtrans/notification`; production callback still needs deployment-side confirmation. |
| Public domain | `https://www.itbinsight.com`. |
| Customer details | Name, email, phone, registration/team name, competition name, gross amount. |
| Team customer details | Team leader/contact person. |
| Expiry | Use Midtrans default first. |
| Retry | Allowed while registration is not `verified` or `rejected`. |
| Admin override | Not implemented. Mock status changes live in the visitor mock payment page/actions only. |

## Status Model

Registration status:

| Status | Meaning |
| --- | --- |
| `submitted` | Registration has been submitted and is awaiting payment/admin review. |
| `verified` | Admin accepted the registration. Future final meaning may include complete payment and file validation. |
| `rejected` | Admin rejected the registration. |

Payment status:

| Status | Meaning |
| --- | --- |
| `pending` | Payment transaction exists but is not paid yet. |
| `paid` | Payment succeeded. |
| `failed` | Payment failed. |
| `expired` | Payment expired. |
| `cancelled` | Payment was cancelled. |

Display-only status:

- `unpaid` is shown by dashboard/admin helpers when no payment row exists yet. It is not stored in `payments.status`.

Rule:

- Payment success must not automatically set registration status to `verified`.
- Admin verification remains separate.

## Rollout Plan

### Stage 1: Internal Mock Payment

Goal: prove the payment state machine, dashboard UI, admin visibility, and retry behavior without Midtrans dependency.

Build:

- Add payment tables and payment fields.
- Add dashboard Pay button.
- Add internal mock payment page.
- Add mock success/fail/expire actions.
- Add admin payment status visibility.
- Do not add admin payment override unless a new product decision explicitly requires it.

Mock routes:

- `POST /api/payments/create`
- `POST /api/payments/mock/settle`
- `POST /api/payments/mock/fail`
- `POST /api/payments/mock/expire`

Definition of done:

- User can pay from dashboard using mock flow.
- Payment status updates without changing registration status to `verified`.
- Admin can see payment status.
- User can retry if status is `failed` or `expired` and registration is not `verified` or `rejected`.

### Stage 2: Midtrans Sandbox Snap

Goal: replace mock transaction creation with Midtrans Sandbox transaction creation while keeping the same app-level payment model.

Build:

- Add Midtrans Sandbox env vars.
- Create Snap transaction server-side.
- Store `order_id`, `snap_token`, `redirect_url`, and raw response.
- Redirect user to Midtrans Snap page or open Snap flow from dashboard.
- Return user to dashboard after payment attempt.

Preferred UI behavior:

- Dashboard card has a `Bayar` button.
- User clicks `Bayar`.
- Server creates or reuses a pending payment.
- User is redirected to Midtrans Snap redirect URL.
- Midtrans returns to dashboard with query params.
- Dashboard refreshes payment status.

Definition of done:

- Sandbox transaction can be created.
- User can reach Midtrans payment page.
- Return to dashboard does not break the app.
- Payment row stores Midtrans identifiers.

### Stage 3: Midtrans Webhook

Goal: make Midtrans the source of truth for payment result.

Current code implements the webhook endpoint and signature verification. Production use still requires configuring the deployed callback URL in Midtrans.

Build:

- Add notification endpoint.
- Verify Midtrans signature.
- Map Midtrans transaction status to internal payment status.
- Store raw webhook payload for debugging.
- Make webhook idempotent.

Webhook endpoint:

- `POST /api/payments/midtrans/notification`

Definition of done:

- Webhook can mark payment `paid`, `failed`, or `expired`.
- Duplicate webhook does not duplicate or corrupt records.
- Invalid signature is rejected.

## Environment Variables

Add only when Stage 2 starts:

```bash
MIDTRANS_SERVER_KEY=your-sandbox-server-key
MIDTRANS_CLIENT_KEY=your-sandbox-client-key
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-sandbox-client-key
```

Rules:

- `MIDTRANS_SERVER_KEY` is server-only.
- Never expose server key through `NEXT_PUBLIC_*`.
- Use Sandbox keys while `MIDTRANS_IS_PRODUCTION=false`.

## Data Model

Use two tables:

- `payments`: app-level payment record linked to registration.
- `midtrans_transactions`: Midtrans-specific transaction data and payloads.

Why two tables:

- Keeps MVP mock payment clean.
- Allows future providers without rewriting registration logic.
- Keeps Midtrans raw data isolated.

## Admin Behavior

Admin dashboard should show:

- Registration status.
- Payment status.
- Gross amount.
- Payment provider.
- Midtrans order ID, if available.
- Paid at.
- Expired at.
- Latest payment attempt.

No admin payment override UI is implemented in the current code. Admin reviews payment status and manually updates registration status separately.

## Safety Rules

- Client cannot directly set `paid`.
- Payment updates must happen through server routes or verified webhook.
- Registration status and payment status must stay separate.
- Retry creates a new payment attempt or reuses a valid pending payment.
- Do not create duplicate active pending payments for the same registration.

## Implementation Order

1. Update schema for `payments` and `midtrans_transactions`.
2. Add payment fields to registration queries.
3. Add `POST /api/payments/create`.
4. Add internal mock payment page/actions.
5. Add dashboard Pay button and payment badge.
6. Add admin payment visibility.
7. Test mock success/fail/expire/retry.
8. Add Midtrans Sandbox env vars.
9. Replace create-payment provider path with Midtrans Snap transaction creation.
10. Add return-to-dashboard handling.
11. Configure deployed webhook URL in Midtrans for production/sandbox testing.

## Open Decisions

| Decision | Why it matters |
| --- | --- |
| Midtrans production go-live | Production keys, callback URL, and settlement testing are not confirmed in repo. |
| Admin payment override | Previously discussed as demo-only, but current implementation intentionally does not include it. Confirm before adding. |
| Final verification policy | Payment `paid` and registration `verified` are separate; final launch rules for accepting/rejecting after payment still need owner approval. |
