schema_version: 1

# Payment Flows

Source of truth: `docs/prd-itbinsight.md`

Related docs: `docs/PAYMENT-MIDTRANS-PLAN.md`, `docs/IMPLEMENTATION-GUIDE.md`, `docs/API-CONTRACTS.md`, `docs/SUPABASE-SCHEMA-PLAN.md`, `docs/ADMIN-DASHBOARD.md`, `docs/REGISTRATION-FLOWS.md`

Audience: web development team implementing the payment user experience.

## Purpose

This document defines payment flows for individual and team competition registration. Payment starts after registration is submitted and is initiated from the dashboard.

## Flow Summary

| Flow | Actor | Result |
| --- | --- | --- |
| A. Individual payment | Visitor | Pays for own individual registration. |
| B. Team payment | Team leader | Pays for submitted team registration. |
| C. Mock payment | Visitor or leader | Simulates success/fail/expire before Midtrans. |
| D. Midtrans Sandbox payment | Visitor or leader | Pays through Midtrans Sandbox Snap. |
| E. Retry payment | Visitor or leader | Creates/reuses payment while registration is not verified/rejected. |
| F. Admin payment review | Admin | Views payment status before manual registration verification. |

## Flow A: Individual Payment

Preconditions:

- Visitor is logged in.
- Visitor has submitted individual registration.
- Registration status is `submitted`.
- Payment status is not `paid`.

Steps:

1. Visitor opens dashboard.
2. Dashboard shows registration card.
3. Card shows fee amount, default IDR 10,000 for now.
4. Visitor clicks `Bayar`.
5. System creates or reuses payment.
6. Stage 1: user opens mock payment page.
7. Stage 2: user is redirected to Midtrans Sandbox Snap.
8. User returns to dashboard.
9. Dashboard refreshes payment status.

Success result:

- `payment_status = paid`.
- `registration_status` remains `submitted` until admin verifies.

## Flow B: Team Payment

Preconditions:

- Team registration is submitted.
- User is team leader.
- Registration status is `submitted`.
- Payment status is not `paid`.

Steps:

1. Leader opens dashboard.
2. Dashboard shows team registration card.
3. Card shows team name, competition name, and fee amount.
4. Leader clicks `Bayar`.
5. System creates or reuses payment using leader/contact details.
6. Stage 1: leader completes mock payment.
7. Stage 2: leader completes Midtrans Sandbox Snap payment.
8. Dashboard refreshes payment status.

Rules:

- Only leader can initiate team payment.
- Team members can see team/payment status if they are allowed to view team registration.
- Team members cannot pay for MVP.

## Flow C: Internal Mock Payment

Goal: test payment behavior without Midtrans.

Steps:

1. User clicks `Bayar`.
2. `POST /api/payments/create` creates payment with provider `mock`.
3. User is sent to internal mock payment page.
4. Mock page offers demo actions: success, fail, expire.
5. Server updates payment status.
6. User returns to dashboard.

Mock status actions:

- Success -> `paid`.
- Fail -> `failed`.
- Expire -> `expired`.

Rules:

- Mock action endpoints require an authenticated payment owner and only update `mock` payments that are still `pending`.
- Mock action must not auto-verify registration.
- Mock status changes are user/payment-owner actions in the mock payment page, not admin overrides.

## Flow D: Midtrans Sandbox Snap

Goal: use Midtrans Sandbox after mock flow is stable.

Steps:

1. User clicks `Bayar`.
2. `POST /api/payments/create` creates app payment row.
3. Server creates Midtrans Snap transaction.
4. Server stores Midtrans `order_id`, `snap_token`, `redirect_url`, and raw response.
5. Client redirects to `redirect_url`.
6. User completes payment in Midtrans Sandbox.
7. Midtrans redirects user to dashboard or configured finish URL.
8. Dashboard reloads payment status.

Return route:

- Use `/dashboard` for minimum bug risk.
- Optional query params can be shown as a dashboard alert.

## Flow E: Retry Payment

Allowed when:

- Registration status is `submitted`.
- Payment status is `failed`, `expired`, or `cancelled`.
- Registration is not `verified` or `rejected`.

Steps:

1. User opens dashboard.
2. Dashboard shows `Coba bayar lagi`.
3. User clicks retry.
4. System creates a new payment attempt or reuses an existing valid pending payment.
5. User completes mock or Midtrans flow again.

Rules:

- Do not create duplicate active pending payments for one registration.
- Paid registration should not show retry.
- Verified/rejected registration should not show retry.

## Flow F: Admin Payment Review

Admin dashboard should show payment information next to registration information.

Fields:

- Payment status: `unpaid`, `pending`, `paid`, `failed`, `expired`, or `cancelled`.
- Provider: `mock` or `midtrans`.
- Gross amount.
- Currency.
- Midtrans order ID, if available.
- Paid at.
- Expired at.
- Latest payment attempt status.

Admin rules:

- Admin can verify registration after reviewing payment and registration data.
- Admin payment override is not implemented in current code.
- Admin cannot use client-side controls to fake Midtrans `paid` in production.

## Failure States

| Failure | Expected response |
| --- | --- |
| Non-leader tries to pay team registration | Return `NOT_TEAM_LEADER`. |
| Registration is verified/rejected | Block payment creation. |
| Already paid | Show paid state and do not create new payment. |
| Active pending payment exists | Reuse it instead of creating duplicate. |
| Midtrans create transaction fails | Keep registration submitted and show retryable error. |
| Webhook invalid signature | Reject and log safely. |

## Dashboard States

| Registration status | Payment status | Dashboard CTA |
| --- | --- | --- |
| `submitted` | `pending` | `Lanjutkan pembayaran` |
| `submitted` | `paid` | `Menunggu verifikasi admin` |
| `submitted` | `failed` | `Coba bayar lagi` |
| `submitted` | `expired` | `Coba bayar lagi` |
| `submitted` | `cancelled` | `Coba bayar lagi` |
| `verified` | any | No payment CTA. Show verified. |
| `rejected` | any | No payment CTA. Show rejection note. |
