---
name: dev-environment-setup
description: Org conventions for local development environment setup - dependencies, env vars, and getting a repo running locally. Use when setting up a repo for local development or onboarding to a new project.
---
# Local Environment Setup

## General approach
1. Check for a README or setup doc in the repo first — it's the source of truth for that specific project, this skill covers org-wide defaults and gaps.
2. Check for a dependency manifest (package manifest, lockfile, requirements file) and install via the project's declared package manager rather than guessing one.
3. Check for an example env file (e.g. `.env.example`) and copy it rather than fabricating env vars from scratch.
4. Confirm the project actually runs (build/start/test command) before considering setup done — don't declare success without running something.

## What to avoid
- Committing real secrets into an example env file or into version control.
- Silently changing a project's declared package manager or runtime version to work around a local issue — surface the mismatch instead.
- Leaving the repo in a state where `git status` shows unexpected local-only config changes after "setup."

> Org-specific baseline tooling (standard IDE config, required local services, VPN/SSO prerequisites, secrets management) is TODO — fill in once decided.
