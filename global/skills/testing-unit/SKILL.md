---
name: testing-unit
description: Org standards and coverage expectations for unit tests. Use when writing, reviewing, or evaluating coverage of unit tests.
---
# Unit Testing Standards

## Scope
A unit test exercises a single function, method, or class in isolation — dependencies are mocked, stubbed, or faked, not real. If a test talks to a real database, network, or filesystem, it's an integration test — see the `testing-integration` skill instead.

## Coverage expectations
- New logic (a new function, a new branch in an existing function) needs a unit test covering its primary path and its realistic failure paths.
- Bug fixes need a regression test that fails without the fix and passes with it.
- Pure refactors (no behavior change) don't need new tests, but must not break existing ones.

## What makes a good unit test
- Tests one behavior per test case — a test name should describe exactly what's being asserted.
- Asserts on outcomes (return values, thrown errors, calls to a collaborator), not on implementation details that would break under a valid refactor.
- Is deterministic — no reliance on real time, real randomness, or execution order between tests.
- Fails with a clear message when it fails; a reader shouldn't need to open the implementation to understand what broke.

## What to avoid
- Tests that assert `true === true` just to inflate a coverage number.
- Overly broad mocking that means the test no longer verifies real behavior.
- Copy-pasted test cases that differ only in input, when a parameterized test would say the same thing more clearly.

> Org-specific test framework, coverage tooling, and CI thresholds are TODO — fill in once decided (e.g. required coverage %, which framework is standard per language).
