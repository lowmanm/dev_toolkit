---
name: dev-scaffolding
description: Org conventions for scaffolding new code - project layout, naming, and where new components/services/modules should live. Use when creating a new component, service, module, or repo.
---
# Scaffolding Conventions

## Before scaffolding anything new
Look for an existing example of the same kind of thing in the repo (another service, another component, another module) and match its shape rather than inventing a new one. Consistency with what's already there beats a "better" pattern used nowhere else.

## Naming
- Match the casing convention already used in the repo/language (don't introduce snake_case into a camelCase codebase or vice versa).
- Names should describe what the thing is or does, not how it's implemented.

## Layout
- New modules/services go where equivalent existing ones live — don't invent a new top-level directory for something that fits an existing pattern.
- Keep test files co-located or in the mirrored test directory, matching whatever the repo already does.

## What not to do
- Don't scaffold speculative structure for functionality that doesn't exist yet ("just in case" folders, empty interface layers).
- Don't add a new framework, build tool, or dependency to solve a problem an existing one already solves in this repo.

> Org-wide repo layout standards (e.g. a canonical service template, monorepo vs. polyrepo guidance) are TODO — fill in once decided.
