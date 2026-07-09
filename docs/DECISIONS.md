schema_version: 1

# Decisions

Source of truth: project owner decisions, `docs/MVP-SCOPE.md`, technical specs.

Audience: project owner and contributors who need decision history.

## Accepted Decisions

| Decision | Status | Rationale |
| --- | --- | --- |
| MVP focuses on competition registration | Accepted | Keeps first release narrow: auth, visitor QR ticket, competition registration, dashboard, admin review, CSV export, and gate check-in. |
| Hardcoded competition data is operational source for MVP | Accepted | Sanity may remain as optional fallback, but launch docs treat hardcoded data as the current MVP source. |
| Use `visitor_tickets` for QR tickets | Accepted | `rsvp` is legacy and should not be used for new MVP ticket/check-in work. |
| QR payloads use opaque tokens only | Accepted | Avoids exposing user metadata through QR content. |
| Gate check-in is admin-operated | Accepted | MVP does not use self-service visitor check-in or geofence. |
| Team membership locks after final submit | Accepted | Prevents team composition drift after registration submission. |
| Payment and registration status stay separate | Accepted | `paid` does not automatically set registration status to `verified`; admin review remains explicit. |
| Team payment is leader-only | Accepted | Simplifies ownership and customer details for team payments. |
| Admin payment override is not implemented | Accepted | Mock status changes stay in the visitor mock payment page/actions; production paid state comes from server routes or verified webhook. |

## Open Decisions

| Decision | Why It Matters |
| --- | --- |
| Midtrans production go-live | Production keys, callback URL, settlement testing, and go-live approval are not confirmed in repo. |
| Final registration verification policy | Payment `paid` and registration `verified` are separate; launch rules for accepting/rejecting after payment need owner approval. |
| Google OAuth consent ownership | Needs final owner for app name, logo, support email, privacy URL, and authorized redirect URLs. |
| Supabase custom auth domain | Needed if the team wants login to show an event-owned domain instead of the Supabase project host. |
| Competition content source for launch | Code supports Sanity with hardcoded fallback; operational source and content ownership need confirmation. |
| Which flows stay in GForm | PRD allows external registration for some flows, but MVP currently says no GForm for competition registration. |
| Program/content ownership | Event pages, sponsor wall, gallery, and map hotspots need final assets and owners before publication. |
| Admin roles beyond `admin` | Future RSVP, feedback, partner, or analytics work may need narrower permissions. |
| PII retention and deletion policy | Required before production scale and before broader data exports/deletion requests. |
