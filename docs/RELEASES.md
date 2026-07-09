schema_version: 1

# Releases

Source of truth: current code, `docs/MVP-SCOPE.md`, release verification results.

Audience: project owner and contributors tracking what shipped.

## Unreleased

| Area | Change |
| --- | --- |
| Docs | Added docs skeleton for navigation, backlog, sprint tracking, decisions, QA, and runbooks. |
| Docs | Extracted active items from long implementation/gap/payment planning docs into canonical tracking docs. |
| Docs | Removed old planning docs from the active docs tree so they no longer act as sources of truth. |

## Release Note Template

```markdown
## YYYY-MM-DD

### Added

- ...

### Changed

- ...

### Fixed

- ...

### Verification

- `npm run build`: pass/fail or skipped with reason
- Manual QA: pass/fail or skipped with reason
```
