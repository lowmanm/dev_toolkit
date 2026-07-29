These are baseline instructions from the org dev toolkit. They apply alongside any project-specific instructions already in this repo — project-specific guidance wins on conflict.

## Agents available
- **dev** — implementing features, scaffolding, local environment setup.
- **reviewer** — pull request / diff review against the org's `pr-review` checklist.
- **tester** — writing and reviewing unit/integration tests against org standards.
- **repo-init** — bootstraps this toolkit into a new repo; only needs to be run once per repo.
- **principles** — generates or refreshes this repo's `principles/*.md` files; run once to bootstrap, and again after a large refactor.

## Skills available
- `dev-scaffolding`, `dev-environment-setup` — scaffolding conventions and local setup.
- `pr-review` — the gold-standard PR review checklist.
- `testing-unit`, `testing-integration` — testing standards and coverage expectations.
- `sdlc-request-review`, `sdlc-new-app` — process docs for common SDLC questions (placeholder content, being filled in).
- `principles-maintenance` — what belongs in `principles/architecture.md`, `design.md`, `domain.md`, and how they get kept current.

## This repo's principles (if present)

If `principles/architecture.md`, `principles/design.md`, and/or `principles/domain.md` exist in this repo, read them before making non-trivial changes — they're this repo's actual, current architecture/design/domain documentation, not org-wide policy. Keep them updated as part of the same change if what you're doing affects any of them; see the `principles-maintenance` skill.

## Ground rules
- Match existing conventions in this repo over introducing new ones.
- Keep changes scoped to what was asked — no speculative abstractions, no unrelated refactors bundled into a fix.
- Flag security, SRE, architecture (as an org-wide governance area), or PM/Jira/Confluence questions as out of scope for this toolkit today — that tooling doesn't exist yet (v1 is dev/review/testing/sdlc only).

> This file is generated from `global/instructions/core.md` in the dev_toolkit repo. Edit the source there, not this file directly — local edits here will be detected and left alone on the next update rather than overwritten, so they won't propagate back automatically.
