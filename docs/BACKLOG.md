schema_version: 1

# Backlog

Source of truth: `docs/prd-itbinsight.md`, `docs/MVP-SCOPE.md`, current code.

Audience: project owner and contributors deciding what to build next.

## Launch Readiness

| Item | Source | Notes |
| --- | --- | --- |
| Verify Google OAuth branding | Launch readiness review | Account chooser/consent should identify ITB Insight or approved event domain, not the raw Supabase project reference. |
| Confirm Midtrans production go-live | Payment launch review | Keep `MIDTRANS_IS_PRODUCTION=false` or unset until the owner approves live keys, callback URL, settlement test, rollback plan, and release note. |
| Confirm final registration verification policy | Payment and admin review policy | `paid` and `verified` are intentionally separate; owner must define final acceptance/rejection rules. |
| Confirm competition content source | Content launch review | Code supports hardcoded data and optional Sanity fallback; launch ownership/source needs confirmation. |
| Add final competition content | Content launch review | Guidebooks, fees, timeline, prize pool, contact, FAQ, and robot sketch upload decision. |
| Define PII retention and deletion policy | Privacy launch review | Required before production scale because registration and ticket data include personal data. |

## Security And Reliability

| Item | Source | Notes |
| --- | --- | --- |
| Upgrade distributed rate limiting | Security launch review | MVP baseline rate limiting exists for registration, team create/join/edit, payment creation, admin status update, admin CSV export, and admin check-in. Before high-traffic production use, replace the in-memory per-instance guard with environment-specific distributed credentials/namespaces. |
| Add admin audit logs | Security launch review | Track sensitive admin actions and status changes. |
| Fill owner-run backup and monitoring evidence labels | Reliability launch review | Runbook exists in `docs/runbooks/ENVIRONMENTS.md`. Owner still must fill backup owner, restore path, alert destination, incident owner/contact, and restore approval labels before release. |
| Add file upload validation path | Future upload scope review | Needed if robot sketch upload returns to scope. |
| Run production-safe RLS smoke evidence | Security launch review | Use policy/config evidence plus approved smoke-only access checks. Do not create dummy production records. |

## Future Product Scope

These are outside the current MVP unless explicitly promoted.

| Area | Examples |
| --- | --- |
| Event program pages | Exhibition, play-tech, show-tech, tech seminar, Insight on Stage, Alumni Gathering, Inspirates. |
| RSVP/alumni flow | Dedicated RSVP model, invited-guest behavior, attendance status. |
| Booth operations | Booth QR, booth visits, booth category filters, busiest booth analytics. |
| Feedback | Public feedback forms, booth feedback, feedback dashboard. |
| Sponsor and partner features | Logo wall, sponsor hotspots, partner click tracking, partnership inquiry form. |
| Gamification | Booth visit points, leaderboard, reward or merch claim. |
| Advanced analytics | Gate-to-booth conversion, real-time heatmap, broader event analytics. |
| Public content | News, gallery, aftermovie, finalized social links, volunteer info page. |
