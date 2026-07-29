---
name: principles-maintenance
description: How this repo's principles/*.md files (architecture, design, business domain) get created and kept current. Use whenever a change affects architecture, a design convention, or the business domain model, or when deciding whether to generate or refresh principles files.
---
# Principles Maintenance

`principles/` holds this specific repo's living documentation of its actual architecture, design conventions, and business domain — not org-wide policy, and not a one-time snapshot. Note: this is distinct from "architecture" as an org-wide skill area (out of scope for this toolkit's v1, alongside security/SRE/PM) — `principles/architecture.md` documents what *this repo's own system* looks like, not org architecture governance.

## The files

- `principles/architecture.md` — system structure, major components, how they interact.
- `principles/design.md` — design/code conventions specific to this repo, beyond the org-wide `dev-scaffolding` skill's generic guidance.
- `principles/domain.md` — business domain model: entities, terminology, business rules. Skip this one if the repo has no real business domain (e.g. a pure library or infra tool).

## Creating them

- Repo with substantial existing code → the `principles` agent reads the codebase and derives real content. Don't fabricate detail that isn't actually true of the code.
- Net-new repo with little or no code yet → `bin/toolkit scaffold-principles` writes TODO-marked placeholders instead. There's nothing real to derive yet.

## Keeping them current — this is the part that matters most

These files drift out of date unless updating them is part of the same change that makes them stale, not a separate follow-up task:

- If you're the `dev` agent and your change affects architecture, a design convention, or the domain model, update the matching `principles/*.md` file **in the same change**.
- If you're the `reviewer` agent, treat a PR that changes architecture/design/domain without a matching `principles/*.md` update as a **blocking** finding — the same severity as a missing test for new behavior.
- Prefer editing the existing file over replacing it wholesale — preserve what's still accurate, correct what's now wrong, add what's new.

## When to do a full refresh instead of an incremental edit

After a large refactor, or if a `principles/*.md` file looks meaningfully out of sync with the actual code, re-run the `principles` agent for a fuller pass rather than patching it incrementally.
