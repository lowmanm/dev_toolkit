---
name: testing-integration
description: Org standards for integration tests - when to write them and what they should cover. Use when writing, reviewing, or evaluating integration test coverage.
---
# Integration Testing Standards

## Scope
An integration test exercises real interaction between components — a real database, a real HTTP call between services, a real message queue — rather than mocking the boundary. Use it to verify that components actually work together, not to re-verify logic already covered by unit tests.

## When integration tests are expected
- New or changed API contracts between services.
- New or changed database access patterns (queries, migrations, transactions).
- Anything where a unit test's mocked boundary could hide a real integration bug (serialization mismatches, schema drift, auth/permission wiring).

## When they're not the right tool
- Testing pure business logic — that belongs in a unit test, which is faster and more precise about what broke.
- Exhaustively testing every input combination — cover the integration boundary itself, push combinatorial cases down to unit tests.

## What makes a good integration test
- Uses realistic test fixtures/data, not hand-wavy placeholders that wouldn't survive contact with real data shapes.
- Cleans up after itself — doesn't leave state that breaks subsequent test runs.
- Fails clearly at the boundary that broke, not just "something went wrong."

## What to avoid
- Flaky tests tolerated as "just rerun it" — a flaky integration test is a bug in the test or the system, not background noise.
- Integration tests standing in for missing unit coverage — if a bug could have been caught faster by a unit test, add the unit test too.

> Org-specific integration test infrastructure (test environments, seed data strategy, required CI gates) is TODO — fill in once decided.
