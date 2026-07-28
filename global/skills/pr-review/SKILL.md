---
name: pr-review
description: Gold-standard checklist for reviewing pull requests and diffs. Use when asked to review a PR, review code, or check something before merge.
---
# PR Review Checklist

Apply these checks to every review. Call out which findings are **blocking** (must fix before merge) versus **non-blocking** (worth raising, not a gate).

## Correctness (blocking)
- Does the change do what the PR description claims? Read the diff, not just the description.
- Are there obvious edge cases the code doesn't handle (empty input, null/undefined, concurrent access, off-by-one)?
- Does error handling actually handle the error, or just swallow it?

## Tests (blocking for new behavior)
- Does new behavior have test coverage? Does changed behavior have updated tests?
- Do the tests actually exercise the failure paths, or only the happy path?
- Were any existing tests weakened or deleted to make this pass? If so, is that justified?

## Security (blocking)
- Any injection risk (SQL, command, XSS) from unsanitized input?
- Any secrets, credentials, or tokens committed?
- Any new external input trusted without validation at a system boundary?

## Scope and design (non-blocking unless egregious)
- Is the change scoped to what was asked, or does it carry unrelated refactors?
- Are new abstractions justified by actual current need, or speculative?
- Does it follow existing conventions in the repo rather than introducing a new pattern for the same problem?

## Readability (non-blocking)
- Would a teammate unfamiliar with this change understand it without asking the author?
- Are names accurate? Do comments explain *why*, not *what*?

## How to deliver findings
- Cite file and line.
- State the concrete failure scenario ("if X calls this with an empty list, it throws") rather than a vague quality judgment.
- Lead with blocking issues; group non-blocking suggestions separately so they don't read as gating.
