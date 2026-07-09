schema_version: 1

# Backlog

Source of truth: `docs/prd-itbinsight.md`, `docs/MVP-SCOPE.md`, current code.

Audience: project owner and contributors deciding what to build next.

## Launch Readiness

| Item | Source | Notes |
| --- | --- | --- |
| Verify Google OAuth branding | Launch readiness review | Account chooser/consent should identify ITB Insight or approved event domain, not the raw Supabase project reference. |
| Confirm Midtrans production go-live | Payment launch review | Production keys, callback URL, settlement testing, and go-live approval are not confirmed in repo. |
| Confirm final registration verification policy | Payment and admin review policy | `paid` and `verified` are intentionally separate; owner must define final acceptance/rejection rules. |
| Confirm competition content source | Content launch review | Code supports hardcoded data and optional Sanity fallback; launch ownership/source needs confirmation. |
| Add final competition content | Content launch review | Guidebooks, fees, timeline, prize pool, contact, FAQ, and robot sketch upload decision. |
| Define PII retention and deletion policy | Privacy launch review | Required before production scale because registration and ticket data include personal data. |

## Security And Reliability

| Item | Source | Notes |
| --- | --- | --- |
| Add rate limiting | Security launch review | Auth-sensitive, registration, payment, and admin endpoints. |
| Add admin audit logs | Security launch review | Track sensitive admin actions and status changes. |
| Define backup and monitoring plan | Reliability launch review | Include uptime alerts and incident response. |
| Add file upload validation path | Future upload scope review | Needed if robot sketch upload returns to scope. |
| Run production RLS smoke tests | Security launch review | Verify users cannot read other users' tickets, registrations, teams, or payments. |

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
