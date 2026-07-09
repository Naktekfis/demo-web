schema_version: 1

# Docs

This directory lists only active source-of-truth docs and operational runbooks. It is written as plain Markdown first, so it reads normally on GitHub and in code review.

## Start Here

| Need | Read |
| --- | --- |
| Product requirements | [prd-itbinsight.md](prd-itbinsight.md) |
| Current MVP scope | [MVP-SCOPE.md](MVP-SCOPE.md) |
| API contracts | [API-CONTRACTS.md](API-CONTRACTS.md) |
| Data model | [DATA-MODEL.md](DATA-MODEL.md) |
| Supabase schema plan | [SUPABASE-SCHEMA-PLAN.md](SUPABASE-SCHEMA-PLAN.md) |
| Registration flows | [REGISTRATION-FLOWS.md](REGISTRATION-FLOWS.md) |
| Admin dashboard behavior | [ADMIN-DASHBOARD.md](ADMIN-DASHBOARD.md) |
| Payment behavior | [PAYMENT-FLOWS.md](PAYMENT-FLOWS.md) |
| New ideas and future scope | [BACKLOG.md](BACKLOG.md) |
| Active sprint plan | [SPRINTS.md](SPRINTS.md) |
| Release notes | [RELEASES.md](RELEASES.md) |
| Product and technical decisions | [DECISIONS.md](DECISIONS.md) |
| Manual QA | [QA-CHECKLIST.md](QA-CHECKLIST.md) |
| Operational procedures | [runbooks/](runbooks/) |

## Source Of Truth Rules

- [prd-itbinsight.md](prd-itbinsight.md) explains the full product intent.
- [MVP-SCOPE.md](MVP-SCOPE.md) defines the current release boundary.
- Technical behavior belongs in the specific spec docs listed above.
- Planning and follow-up work belongs in [BACKLOG.md](BACKLOG.md) and [SPRINTS.md](SPRINTS.md).
- Historical snapshots and old planning filenames are not active instructions.

## Runbooks

| Runbook | Use For |
| --- | --- |
| [PAYMENT-MIDTRANS.md](runbooks/PAYMENT-MIDTRANS.md) | Midtrans sandbox/production setup and payment operations checks. |
| [RELEASE-CHECKLIST.md](runbooks/RELEASE-CHECKLIST.md) | Pre-release and release verification. |
| [SECURITY-CHECKLIST.md](runbooks/SECURITY-CHECKLIST.md) | Security, privacy, credentials, and access checks. |

