schema_version: 1

# API Contracts

Source of truth: `docs/prd-itbinsight.md`

Related docs: `docs/IMPLEMENTATION-GUIDE.md`, `docs/MVP-SCOPE.md`, `docs/DATA-MODEL.md`, `docs/REGISTRATION-FLOWS.md`, `docs/ADMIN-DASHBOARD.md`, `docs/SUPABASE-SCHEMA-PLAN.md`, `docs/PAYMENT-MIDTRANS-PLAN.md`, `docs/PAYMENT-FLOWS.md`

Audience: frontend and backend developers implementing the MVP API surface.

## Purpose

This document defines stable MVP API contracts for competition registration, teams, visitor tickets, admin registration review, CSV export, and gate check-in.

The MVP uses hardcoded competition content, Supabase Auth, Supabase database tables, and server route handlers for privileged operations.

## Response Envelope

Use one response shape across new MVP endpoints.

Success:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Failure:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Pesan error untuk user atau admin."
  }
}
```

Rules:

- `code` uses stable English `SCREAMING_SNAKE_CASE`.
- `message` uses Bahasa Indonesia for user-facing clarity.
- Future fields may be added to `data` or `error` without breaking clients.
- Clients must use `success` and `error.code`, not string-match `message`.

## Auth Rules

| Endpoint group | Required auth |
| --- | --- |
| Visitor ticket endpoints | Logged-in Visitor. |
| Registration endpoints | Logged-in Visitor. |
| Team endpoints | Logged-in Visitor. |
| Payment endpoints | Logged-in Visitor or team leader. |
| Admin endpoints | Logged-in Admin. |
| Check-in endpoint | Logged-in Admin. |
| Admin identity endpoint | Logged-in user; returns only whether user is admin. |

Admin authorization:

- Preferred: `admin_roles` table.
- Temporary acceptable fallback: `ADMIN_EMAILS` env allowlist.

## POST `/api/tickets/ensure`

Purpose: ensure logged-in Visitor has exactly one gate QR ticket.

When to call:

- After login callback.
- On dashboard load if needed.
- On ticket page load if needed.

Request:

```json
{}
```

Success `200`:

```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "uuid",
      "qr_code": "opaque-token",
      "checked_in": false,
      "checked_in_at": null
    }
  },
  "error": null
}
```

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 500 | `TICKET_ENSURE_FAILED` | Ticket could not be created or loaded. |

## POST `/api/registrations/individual`

Purpose: submit individual competition registration.

Request:

```json
{
  "competitionSlug": "paper-competition"
}
```

Success `201`:

```json
{
  "success": true,
  "data": {
      "registration": {
        "id": "uuid",
        "competitionSlug": "paper-competition",
        "registrationKind": "individual",
        "status": "submitted",
        "paymentStatus": "unpaid"
      }
  },
  "error": null
}
```

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_COMPETITION_TYPE` | Competition is not individual. |
| 400 | `REGISTRATION_CLOSED` | Registration is not open. |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 404 | `COMPETITION_NOT_FOUND` | Competition slug is invalid. |
| 409 | `DUPLICATE_REGISTRATION` | User already registered for this competition. |

## POST `/api/teams`

Purpose: create a team for a team-based competition.

Request:

```json
{
  "competitionSlug": "robotika-challenge",
  "teamName": "Delta Pulse"
}
```

Success `201`:

```json
{
  "success": true,
  "data": {
    "team": {
      "id": "uuid",
      "teamName": "Delta Pulse",
      "teamUid": "ROBO-A7K2QD",
      "competitionSlug": "robotika-challenge",
      "status": "draft"
    }
  },
  "error": null
}
```

Team UID rule:

- Format: competition prefix + hyphen + random 6-character uppercase code.
- Example: `ROBO-A7K2QD`.
- The prefix should come from competition config.

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_COMPETITION_TYPE` | Competition is not team-based. |
| 400 | `INVALID_TEAM_NAME` | Team name is missing or invalid. |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 404 | `COMPETITION_NOT_FOUND` | Competition slug is invalid. |
| 409 | `TEAM_NAME_TAKEN` | Team name already exists for this competition. |
| 409 | `ALREADY_IN_TEAM` | User already joined or leads a team in this competition. |

## POST `/api/teams/join`

Purpose: join an existing team with team UID.

Request:

```json
{
  "competitionSlug": "robotika-challenge",
  "teamUid": "ROBO-A7K2QD"
}
```

Success `200`:

```json
{
  "success": true,
  "data": {
    "team": {
      "id": "uuid",
      "teamName": "Delta Pulse",
      "teamUid": "ROBO-A7K2QD",
      "memberCount": 3,
      "status": "draft"
    }
  },
  "error": null
}
```

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_TEAM_UID` | Team UID format is invalid. |
| 400 | `TEAM_ALREADY_SUBMITTED` | Team registration has already been submitted. |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 404 | `TEAM_NOT_FOUND` | Team UID is invalid for this competition. |
| 409 | `TEAM_FULL` | Team has reached max members. |
| 409 | `ALREADY_IN_TEAM` | User already joined a team in this competition. |

## DELETE `/api/teams/[teamId]/members/[memberId]`

Purpose: allow leader to remove a team member before submission.

Rules:

- Leader can remove members before team submission.
- Leader cannot remove themselves through this endpoint.
- After submission, membership is locked.

Success `200`:

```json
{
  "success": true,
  "data": {
    "removed": true
  },
  "error": null
}
```

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 403 | `NOT_TEAM_LEADER` | User is not the team leader. |
| 404 | `MEMBER_NOT_FOUND` | Member row does not exist. |
| 409 | `TEAM_ALREADY_SUBMITTED` | Team membership is locked. |

## POST `/api/teams/[teamId]/leave`

Purpose: allow member to leave a team before submission.

Rules:

- Member can leave before team submission.
- Leader cannot leave through this endpoint while still leader.
- After submission, membership is locked.

Success `200`:

```json
{
  "success": true,
  "data": {
    "left": true
  },
  "error": null
}
```

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 403 | `LEADER_CANNOT_LEAVE` | Leader must delete/cancel team or ask admin later. |
| 404 | `TEAM_NOT_FOUND` | Team does not exist. |
| 409 | `TEAM_ALREADY_SUBMITTED` | Team membership is locked. |

## POST `/api/registrations/team`

Purpose: submit final team registration.

Request:

```json
{
  "teamId": "uuid"
}
```

Success `201`:

```json
{
  "success": true,
  "data": {
    "registration": {
      "id": "uuid",
      "registrationKind": "team",
      "teamId": "uuid",
      "status": "submitted",
      "paymentStatus": "pending"
    }
  },
  "error": null
}
```

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `TEAM_SIZE_INVALID` | Team member count is below min or above max. |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 403 | `NOT_TEAM_LEADER` | Only leader can submit team registration. |
| 404 | `TEAM_NOT_FOUND` | Team does not exist. |
| 409 | `TEAM_ALREADY_SUBMITTED` | Registration already exists. |

## GET `/api/admin/overview`

Purpose: load admin dashboard metrics.

Success `200` data:

```json
{
  "metrics": {
    "totalVisitors": 120,
    "totalCheckedInVisitors": 80,
    "totalRegistrations": 45,
    "totalTeams": 12,
    "submittedRegistrations": 20,
    "verifiedRegistrations": 22,
    "rejectedRegistrations": 3,
    "perCompetition": [
      { "competitionSlug": "robotika-challenge", "count": 10 }
    ]
  }
}
```

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 403 | `ADMIN_ONLY` | User is not admin. |

## GET `/api/admin/me`

Purpose: provide minimal admin state to client UI such as the shared header.

This endpoint is optional if the header can be rendered with server-side admin state. If implemented, it must use the same admin decision path as other admin routes: `admin_roles` first, then `ADMIN_EMAILS` fallback.

Success `200` data for a logged-in admin:

```json
{
  "success": true,
  "data": {
    "isAdmin": true
  },
  "error": null
}
```

Success `200` data for a logged-in non-admin:

```json
{
  "success": true,
  "data": {
    "isAdmin": false
  },
  "error": null
}
```

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` | User is not logged in. |

Security rules:

- Return only `isAdmin`.
- Do not return admin role table rows, allowlist values, service-role details, or internal authorization errors.
- A `true` response may control header visibility, but must not replace server-side checks on `/admin*` pages or `/api/admin*` privileged endpoints.

## GET `/api/admin/registrations`

Purpose: list/search/filter registrations.

Query params:

- `q`
- `competitionSlug`
- `registrationType`
- `status`
- `paymentStatus`
- `checkInStatus`
- `page`
- `pageSize`

Success `200` data:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 25,
  "total": 0
}
```

Search fields:

- Name.
- Email.
- Phone.
- Team name.
- Team UID.
- Competition.
- QR token.

## PATCH `/api/admin/registrations/[id]/status`

Purpose: update registration status.

Request:

```json
{
  "status": "rejected",
  "note": "Data belum lengkap."
}
```

Rules:

- Allowed statuses: `submitted`, `verified`, `rejected`.
- `rejected` requires `note`.
- `verified` means admin accepted current record for MVP, not final payment/berkas validation.

Success `200` data:

```json
{
  "registration": {
    "id": "uuid",
    "status": "rejected",
    "note": "Data belum lengkap."
  }
}
```

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_STATUS` | Status is not allowed. |
| 400 | `NOTE_REQUIRED` | Rejection requires note. |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 403 | `ADMIN_ONLY` | User is not admin. |
| 404 | `REGISTRATION_NOT_FOUND` | Registration ID does not exist. |

## GET `/api/admin/registrations/export`

Purpose: export filtered registrations as CSV.

Query params match `/api/admin/registrations`.

Response:

- Content-Type: `text/csv`.
- Filename: `itb-insight-registrations.csv`.

Columns:

- `competition_name`
- `competition_slug`
- `registration_type`
- `registration_status`
- `payment_status`
- `payment_provider`
- `payment_amount`
- `payment_currency`
- `payment_midtrans_order_id`
- `payment_expired_at`
- `payment_attempted_at`
- `paid_at`
- `team_name`
- `team_uid`
- `member_role`
- `member_name`
- `member_email`
- `member_phone`
- `institution`
- `submitted_at`
- `checked_in`
- `checked_in_at`

## POST `/api/payments/create`

Purpose: create or reuse a payment for a submitted registration.

Request:

```json
{
  "registrationId": "uuid",
  "provider": "mock"
}
```

Provider values:

- `mock` for Stage 1.
- `midtrans` for Stage 2 Sandbox Snap.
- If omitted, provider defaults to `mock`.

Success `201` for mock:

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "registration_id": "uuid",
      "provider": "mock",
      "status": "pending",
      "amount": 10000,
      "currency": "IDR",
      "paid_at": null,
      "expired_at": null
    },
    "redirectUrl": "/dashboard/payments/uuid/mock"
  },
  "error": null
}
```

Success `201` for Midtrans Sandbox:

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "registration_id": "uuid",
      "provider": "midtrans",
      "status": "pending",
      "amount": 10000,
      "currency": "IDR",
      "orderId": "INSIGHT-uuid-short",
      "snapToken": "snap-token",
      "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
    },
    "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
  },
  "error": null
}
```

Rules:

- Individual participant can create payment for own registration.
- Team payment can only be created by team leader.
- Registration must be `submitted`.
- Payment cannot be created for `verified` or `rejected` registration.
- If an active pending payment exists, return it instead of creating duplicate.

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_PROVIDER` | Provider is not `mock` or `midtrans`. |
| 409 | `REGISTRATION_NOT_PAYABLE` | Registration cannot be paid in current state. |
| 409 | `REGISTRATION_NOT_SUBMITTED` | Registration must be `submitted` before payment is created. |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 403 | `PAYMENT_FORBIDDEN` | User is not allowed to manage payment for this registration. |
| 404 | `REGISTRATION_NOT_FOUND` | Registration does not exist. |
| 500 | `MIDTRANS_CONFIG_MISSING` | Midtrans provider was requested but required env vars are missing. |

## GET `/api/payments/[id]`

Purpose: load payment detail for dashboard/mock payment page.

Success `200` data:

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "registration_id": "uuid",
      "provider": "mock",
      "status": "pending",
      "amount": 10000,
      "currency": "IDR",
      "paid_at": null,
      "expired_at": null
    },
    "registration": {
      "id": "uuid",
      "status": "submitted",
      "registrationKind": "individual"
    }
  },
  "error": null
}
```

## POST `/api/payments/mock/settle`

Purpose: mark an owned pending mock payment as paid.

Request:

```json
{
  "paymentId": "uuid"
}
```

Success `200` data:

```json
{
  "payment": {
    "id": "uuid",
    "status": "paid"
  }
}
```

Rules:

- Authenticated payment owner only.
- Mock provider only.
- Pending payment only.
- Does not set registration status to `verified`.

## POST `/api/payments/mock/fail`

Purpose: mark an owned pending mock payment as failed.

Request:

```json
{
  "paymentId": "uuid"
}
```

## POST `/api/payments/mock/expire`

Purpose: mark an owned pending mock payment as expired.

Request:

```json
{
  "paymentId": "uuid"
}
```

## POST `/api/payments/midtrans/notification`

Purpose: receive Midtrans webhook notifications.

Current implementation:

- Endpoint exists and verifies Midtrans signature before updating payment state.

Rules:

- Verify Midtrans signature before updating payment.
- Make webhook idempotent.
- Store raw notification payload in `midtrans_transactions.raw_notification`.
- Map Midtrans transaction status to internal payment status.

Internal status mapping:

| Midtrans status | Internal payment status |
| --- | --- |
| `settlement`, `capture` | `paid` |
| `pending` | `pending` |
| `deny`, `failure` | `failed` |
| `expire` | `expired` |
| `cancel` | `cancelled` |

## GET `/api/admin/visitors`

Purpose: list/search/filter all signed-up Visitors.

Query params:

- `q`
- `checkInStatus`
- `page`
- `pageSize`

Search fields:

- Name.
- Email.
- Phone.
- QR token.

## POST `/api/admin/check-in`

Purpose: admin-operated gate check-in.

Request:

```json
{
  "qrCode": "opaque-token"
}
```

Success `200`:

```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "uuid",
      "checked_in": true,
      "checked_in_at": "2026-07-07T10:00:00.000Z"
    },
    "visitor": {
      "name": "Nama Peserta",
      "email": "peserta@example.com"
    }
  },
  "error": null
}
```

Errors:

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `QR_REQUIRED` | QR token is missing. |
| 401 | `UNAUTHORIZED` | User is not logged in. |
| 403 | `ADMIN_ONLY` | User is not admin. |
| 404 | `TICKET_NOT_FOUND` | QR token is unknown. |
| 409 | `ALREADY_CHECKED_IN` | Ticket already checked in. |

MVP rule:

- No geofence requirement.
- Do not require admin location.

## Compatibility Notes

Legacy migration/code references should not be used for new MVP work:

| Legacy surface | Current MVP direction |
| --- | --- |
| `/api/register` | Replaced by `/api/registrations/individual` and `/api/registrations/team`. |
| `/api/admin/check-in` with `{ ticketCode, lat, lng }` | Current request body is `{ "qrCode": "opaque-token" }`; no geofence/location fields. |
